export type PlanEngine = 'postgres' | 'mysql' | 'sqlserver' | 'sqlite';

export interface PlanNode {
  name: string;
  detail?: string;
  cost?: number;
  rows?: number;
  actualTime?: number;
  actualRows?: number;
  loops?: number;
  children: PlanNode[];
}

export interface PlanSummary {
  engine: PlanEngine;
  nodeCount: number;
  totalCost?: number;
  actualTime?: number;
  actualRows?: number;
  notes: string[];
}

export interface PlanParseResult {
  summary: PlanSummary;
  root?: PlanNode;
}

export function parsePlan(engine: PlanEngine, input: string): PlanParseResult {
  switch (engine) {
    case 'postgres':
      return parsePostgresPlan(input);
    case 'mysql':
      return parseMySqlPlan(input);
    case 'sqlserver':
      return parseSqlServerPlan(input);
    case 'sqlite':
      return parseSqlitePlan(input);
    default:
      return {
        summary: { engine, nodeCount: 0, notes: ['Unsupported engine.'] }
      };
  }
}

function parsePostgresPlan(input: string): PlanParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Paste a PostgreSQL JSON plan.');
  }
  const parsed = JSON.parse(trimmed) as Array<Record<string, unknown>>;
  const planRoot = parsed?.[0]?.['Plan'] as Record<string, unknown> | undefined;
  if (!planRoot) {
    throw new Error('Missing Plan root. Use EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON).');
  }
  const root = mapPostgresNode(planRoot);
  const summary: PlanSummary = {
    engine: 'postgres',
    nodeCount: countNodes(root),
    totalCost: getNumber(planRoot['Total Cost']),
    actualTime: getNumber(planRoot['Actual Total Time']),
    actualRows: getNumber(planRoot['Actual Rows']),
    notes: []
  };
  if (!summary.actualTime) {
    summary.notes.push('No actual timing found. Include ANALYZE for runtime metrics.');
  }
  return { summary, root };
}

function mapPostgresNode(node: Record<string, unknown>): PlanNode {
  const name = String(node['Node Type'] ?? 'Plan Node');
  const detail = buildDetail(node, ['Relation Name', 'Index Name', 'Join Type']);
  const childrenRaw = (node['Plans'] as Record<string, unknown>[] | undefined) ?? [];
  return {
    name,
    detail,
    cost: getNumber(node['Total Cost']) ?? getNumber(node['Startup Cost']),
    rows: getNumber(node['Plan Rows']),
    actualTime: getNumber(node['Actual Total Time']) ?? getNumber(node['Actual Startup Time']),
    actualRows: getNumber(node['Actual Rows']),
    loops: getNumber(node['Actual Loops']),
    children: childrenRaw.map(mapPostgresNode)
  };
}

function parseMySqlPlan(input: string): PlanParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Paste a MySQL JSON plan.');
  }
  const parsed = JSON.parse(trimmed) as Record<string, unknown>;
  const rootBlock = parsed['query_block'] as Record<string, unknown> | undefined;
  if (!rootBlock) {
    throw new Error('Missing query_block. Use EXPLAIN FORMAT=JSON.');
  }
  const root = mapMySqlNode(rootBlock, 'QUERY');
  const summary: PlanSummary = {
    engine: 'mysql',
    nodeCount: countNodes(root),
    notes: []
  };
  return { summary, root };
}

function mapMySqlNode(block: Record<string, unknown>, label: string): PlanNode {
  const name = label;
  const detail = buildDetail(block, ['select_id', 'table_name', 'access_type', 'key']);
  const node: PlanNode = {
    name,
    detail,
    rows: getNumber(block['rows_examined_per_scan']) ?? getNumber(block['rows']),
    cost: getNumber(block['cost_info'] && (block['cost_info'] as Record<string, unknown>)['query_cost']),
    children: []
  };

  const nestedLoop = block['nested_loop'] as Record<string, unknown>[] | undefined;
  if (Array.isArray(nestedLoop)) {
    node.children = nestedLoop.map(entry => {
      const table = entry['table'] as Record<string, unknown> | undefined;
      if (table) {
        return mapMySqlNode(table, 'TABLE');
      }
      const blockChild = entry['query_block'] as Record<string, unknown> | undefined;
      if (blockChild) {
        return mapMySqlNode(blockChild, 'QUERY');
      }
      return { name: 'NODE', children: [] };
    });
  }

  const table = block['table'] as Record<string, unknown> | undefined;
  if (table) {
    node.children.push(mapMySqlNode(table, 'TABLE'));
  }

  return node;
}

function parseSqlServerPlan(input: string): PlanParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Paste a SQL Server .sqlplan XML.');
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(trimmed, 'application/xml');
  const relOp = doc.getElementsByTagName('RelOp')[0];
  if (!relOp) {
    throw new Error('No RelOp nodes found in XML.');
  }
  const root = mapSqlServerRelOp(relOp);
  const summary: PlanSummary = {
    engine: 'sqlserver',
    nodeCount: countNodes(root),
    notes: []
  };
  return { summary, root };
}

function mapSqlServerRelOp(node: Element): PlanNode {
  const logical = node.getAttribute('LogicalOp') ?? 'RelOp';
  const physical = node.getAttribute('PhysicalOp');
  const detail = physical ? `${logical} (${physical})` : logical;
  const cost = toNumber(node.getAttribute('EstimatedTotalSubtreeCost'));
  const rows = toNumber(node.getAttribute('EstimateRows'));

  const children: PlanNode[] = [];
  const childRelOps = node.getElementsByTagName('RelOp');
  if (childRelOps.length > 0) {
    const immediateChildren: Element[] = [];
    for (let i = 0; i < childRelOps.length; i++) {
      const child = childRelOps[i];
      if (child.parentElement === node.parentElement || child.parentElement === node) {
        immediateChildren.push(child);
      }
    }
    immediateChildren.forEach(child => {
      if (child !== node) {
        children.push(mapSqlServerRelOp(child));
      }
    });
  }

  return {
    name: logical,
    detail,
    cost: isNaN(cost) ? undefined : cost,
    rows: isNaN(rows) ? undefined : rows,
    children
  };
}

function parseSqlitePlan(input: string): PlanParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Paste SQLite EXPLAIN QUERY PLAN text.');
  }
  const lines = trimmed.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const children: PlanNode[] = lines.map((line, index) => {
    const parts = line.split('|');
    const detail = parts.length > 3 ? parts.slice(3).join('|') : line;
    return { name: `Step ${index + 1}`, detail, children: [] };
  });
  const root: PlanNode = { name: 'Query Plan', children };
  const summary: PlanSummary = {
    engine: 'sqlite',
    nodeCount: countNodes(root),
    notes: []
  };
  return { summary, root };
}

function buildDetail(node: Record<string, unknown>, keys: string[]): string | undefined {
  const parts = keys
    .map(key => {
      const value = node[key];
      if (value === undefined || value === null || value === '') {
        return null;
      }
      return `${key}: ${value}`;
    })
    .filter(Boolean) as string[];
  return parts.length ? parts.join(' • ') : undefined;
}

function getNumber(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function toNumber(value: string | null): number {
  if (!value) {
    return NaN;
  }
  const parsed = Number(value);
  return parsed;
}

function countNodes(node: PlanNode | undefined): number {
  if (!node) {
    return 0;
  }
  return 1 + node.children.reduce((total, child) => total + countNodes(child), 0);
}
