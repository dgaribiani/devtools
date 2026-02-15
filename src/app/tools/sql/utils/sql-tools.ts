import { format } from 'sql-formatter';

export type SqlDialect = 'sql' | 'postgresql' | 'mysql' | 'sqlite' | 'mariadb' | 'transactsql';

export function formatSql(input: string, dialect: SqlDialect): string {
  return format(input ?? '', { language: dialect });
}

export function minifySql(input: string): string {
  if (!input) {
    return '';
  }
  let output = input;
  output = output.replace(/\/\*[\s\S]*?\*\//g, ' ');
  output = output.replace(/--.*$/gm, ' ');
  output = output.replace(/\s+/g, ' ');
  output = output.replace(/\s*,\s*/g, ',');
  output = output.replace(/\s*\(\s*/g, '(').replace(/\s*\)\s*/g, ')');
  output = output.replace(/\s*;\s*/g, ';');
  return output.trim();
}

export interface InClauseOptions {
  quote: 'none' | 'single' | 'double';
  unique: boolean;
  multiline: boolean;
}

export function buildInClause(input: string, options: InClauseOptions): string {
  const tokens = input
    .split(/[\n,\t]+/)
    .map(value => value.trim())
    .filter(Boolean);

  const values = options.unique ? Array.from(new Set(tokens)) : tokens;
  const quoted = values.map(value => quoteValue(value, options.quote));
  if (!quoted.length) {
    return '()';
  }
  if (options.multiline) {
    return ` (\n  ${quoted.join(',\n  ')}\n)`;
  }
  return `(${quoted.join(', ')})`;
}

function quoteValue(value: string, quote: 'none' | 'single' | 'double'): string {
  if (quote === 'single') {
    return `'${value.replace(/'/g, "''")}'`;
  }
  if (quote === 'double') {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export type IdentifierStyle = 'ansi' | 'mysql' | 'sqlserver';

export function escapeIdentifiers(input: string, style: IdentifierStyle): string {
  const items = input
    .split(/[\n,]+/)
    .map(value => value.trim())
    .filter(Boolean);
  const escaped = items.map(item => escapeIdentifier(item, style));
  return escaped.join('\n');
}

function escapeIdentifier(value: string, style: IdentifierStyle): string {
  switch (style) {
    case 'mysql':
      return `\`${value.replace(/`/g, '``')}\``;
    case 'sqlserver':
      return `[${value.replace(/]/g, ']]')}]`;
    default:
      return `"${value.replace(/"/g, '""')}"`;
  }
}
