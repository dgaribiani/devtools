import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlanEngine, parsePlan, PlanParseResult } from '../utils/plan';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

interface FlatNode {
  depth: number;
  index: number;
}

@Component({
  selector: 'app-sql-plan-analyzer',
  standalone: false,
  templateUrl: './sql-plan-analyzer.component.html',
  styleUrl: './sql-plan-analyzer.component.css'
})
export class SqlPlanAnalyzerComponent implements OnInit, OnDestroy {
  engine: PlanEngine = 'postgres';
  input = '';
  result?: PlanParseResult;
  flatNodes: FlatNode[] = [];
  flatTruncated = false;
  error = '';
  private readonly runHandler = () => this.analyze();
  private readonly maxFlatNodes = 800;

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.engine = this.toolState.get('sql-plan.engine', 'postgres');
    this.input = this.toolState.get('sql-plan.input', samplePlan(this.engine));
    this.activeTool.register(this.runHandler);
    this.analyze();
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  onEngineChange(): void {
    if (!this.input.trim()) {
      this.input = samplePlan(this.engine);
    }
  }

  analyze(): void {
    this.error = '';
    try {
      this.result = parsePlan(this.engine, this.input);
      this.buildFlatNodes();
      this.toolState.set('sql-plan.engine', this.engine);
      this.toolState.set('sql-plan.input', this.input);
      this.toast.success('Plan analyzed.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to parse plan.';
      this.toast.error('Unable to parse plan.');
    }
  }

  get miniMapHeight(): number {
    return Math.max(60, this.flatNodes.length * 6);
  }

  private buildFlatNodes(): void {
    this.flatNodes = [];
    this.flatTruncated = false;
    const root = this.result?.root;
    if (!root) {
      return;
    }
    const walk = (node: { children: unknown[] }, depth: number) => {
      if (this.flatNodes.length >= this.maxFlatNodes) {
        this.flatTruncated = true;
        return;
      }
      this.flatNodes.push({ depth, index: this.flatNodes.length });
      const children = node.children as Array<{ children: unknown[] }>;
      children.forEach(child => walk(child, depth + 1));
    };
    walk(root, 0);
  }
}

function samplePlan(engine: PlanEngine): string {
  switch (engine) {
    case 'postgres':
      return '[{"Plan":{"Node Type":"Seq Scan","Relation Name":"users","Plan Rows":1000,"Total Cost":12.3,"Actual Rows":1000,"Actual Total Time":1.23}}]';
    case 'mysql':
      return '{"query_block":{"select_id":1,"nested_loop":[{"table":{"table_name":"users","access_type":"ALL","rows_examined_per_scan":1000}}]}}';
    case 'sqlserver':
      return '<?xml version="1.0" encoding="utf-16"?><ShowPlanXML xmlns="http://schemas.microsoft.com/sqlserver/2004/07/showplan"><BatchSequence><Batch><Statements><StmtSimple StatementType="SELECT"><QueryPlan><RelOp NodeId="0" PhysicalOp="Index Scan" LogicalOp="Index Scan" EstimateRows="100" EstimatedTotalSubtreeCost="0.5"></RelOp></QueryPlan></StmtSimple></Statements></Batch></BatchSequence></ShowPlanXML>';
    case 'sqlite':
      return '0|0|0|SCAN TABLE users';
    default:
      return '';
  }
}
