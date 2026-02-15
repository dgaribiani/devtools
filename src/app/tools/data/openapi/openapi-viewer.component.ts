import { Component, OnDestroy, OnInit } from '@angular/core';
import { load } from 'js-yaml';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

interface OpenApiOperation {
  method: string;
  path: string;
  summary: string;
  operationId?: string;
  tags: string[];
  description?: string;
  requestExample?: string;
  requestContentType?: string;
  pathParams: string[];
}

@Component({
  selector: 'app-openapi-viewer',
  standalone: false,
  templateUrl: './openapi-viewer.component.html',
  styleUrl: './openapi-viewer.component.css'
})
export class OpenApiViewerComponent implements OnInit, OnDestroy {
  input = '';
  filter = '';
  baseUrl = 'https://api.example.com';
  operations: OpenApiOperation[] = [];
  selected?: OpenApiOperation;
  pathParamValues: Record<string, string> = {};
  bodyOverride = '';
  curlOutput = '';
  error = '';
  private readonly runHandler = () => this.parse();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.input = this.toolState.get(
      'openapi.input',
      'openapi: 3.0.0\ninfo:\n  title: Sample API\n  version: 1.0.0\npaths:\n  /users:\n    get:\n      summary: List users\n      tags: [users]\n    post:\n      summary: Create user\n      tags: [users]\n  /users/{id}:\n    get:\n      summary: Get user\n      tags: [users]\n'
    );
    this.activeTool.register(this.runHandler);
    this.parse();
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  parse(): void {
    this.error = '';
    this.operations = [];
    this.selected = undefined;
    try {
      const spec = parseSpec(this.input);
      this.operations = extractOperations(spec);
      this.pathParamValues = {};
      this.bodyOverride = '';
      this.curlOutput = '';
      this.toolState.set('openapi.input', this.input);
      if (!this.operations.length) {
        this.toast.info('No paths found.');
        return;
      }
      this.selected = this.operations[0];
      this.prepareSelected();
      this.toast.success('OpenAPI parsed.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to parse OpenAPI.';
      this.toast.error('Unable to parse OpenAPI.');
    }
  }

  get filtered(): OpenApiOperation[] {
    const query = this.filter.trim().toLowerCase();
    if (!query) {
      return this.operations;
    }
    return this.operations.filter(operation => {
      const haystack = [operation.method, operation.path, operation.summary, operation.tags.join(' ')].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }

  select(op: OpenApiOperation): void {
    this.selected = op;
    this.prepareSelected();
  }

  onParamsChange(): void {
    this.updateCurl();
  }

  private prepareSelected(): void {
    if (!this.selected) {
      return;
    }
    const values: Record<string, string> = {};
    this.selected.pathParams.forEach(param => {
      values[param] = this.pathParamValues[param] ?? '';
    });
    this.pathParamValues = values;
    this.bodyOverride = this.selected.requestExample ?? '';
    this.updateCurl();
  }

  private updateCurl(): void {
    if (!this.selected) {
      this.curlOutput = '';
      return;
    }
    const url = buildUrl(this.baseUrl, this.selected.path, this.pathParamValues);
    const method = this.selected.method.toUpperCase();
    const headers: string[] = [];
    if (this.selected.requestContentType) {
      headers.push(`-H \"Content-Type: ${this.selected.requestContentType}\"`);
    }
    const data = this.bodyOverride?.trim();
    const bodyFlag = data ? `-d '${data.replace(/'/g, `'\"'\"'`)}'` : '';
    const parts = ['curl', '-X', method, `"${url}"`, ...headers];
    if (bodyFlag) {
      parts.push(bodyFlag);
    }
    this.curlOutput = parts.join(' ');
  }
}

function parseSpec(input: string): Record<string, unknown> {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Paste an OpenAPI JSON or YAML spec.');
  }
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    const parsed = load(trimmed) as Record<string, unknown> | undefined;
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Unable to parse OpenAPI spec.');
    }
    return parsed;
  }
}

function extractOperations(spec: Record<string, unknown>): OpenApiOperation[] {
  const paths = spec['paths'] as Record<string, unknown> | undefined;
  if (!paths || typeof paths !== 'object') {
    return [];
  }
  const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'];
  const ops: OpenApiOperation[] = [];
  Object.keys(paths).forEach(path => {
    const pathItem = paths[path] as Record<string, unknown> | undefined;
    if (!pathItem) {
      return;
    }
    methods.forEach(method => {
      const op = pathItem[method] as Record<string, unknown> | undefined;
      if (!op) {
        return;
      }
      const summary = (op['summary'] as string) || (op['operationId'] as string) || 'Untitled operation';
      const tags = Array.isArray(op['tags']) ? (op['tags'] as string[]) : [];
      const requestBody = buildRequestExample(spec, op);
      const pathParams = extractPathParams(path);
      ops.push({
        method: method.toUpperCase(),
        path,
        summary,
        operationId: op['operationId'] as string | undefined,
        tags,
        description: op['description'] as string | undefined,
        requestExample: requestBody?.example,
        requestContentType: requestBody?.contentType,
        pathParams
      });
    });
  });
  return ops;
}

function buildRequestExample(
  spec: Record<string, unknown>,
  op: Record<string, unknown>
): { example: string; contentType: string } | null {
  const body = op['requestBody'] as Record<string, unknown> | undefined;
  if (!body) {
    return null;
  }
  const content = body['content'] as Record<string, unknown> | undefined;
  if (!content) {
    return null;
  }
  const contentType = Object.keys(content).find(type => type.includes('json')) || Object.keys(content)[0];
  if (!contentType) {
    return null;
  }
  const contentDef = content[contentType] as Record<string, unknown> | undefined;
  if (!contentDef) {
    return null;
  }
  const directExample = contentDef['example'];
  if (directExample !== undefined) {
    return { example: JSON.stringify(directExample, null, 2), contentType };
  }
  const examples = contentDef['examples'] as Record<string, { value?: unknown }> | undefined;
  if (examples) {
    const firstKey = Object.keys(examples)[0];
    if (firstKey) {
      const exampleValue = examples[firstKey]?.value;
      if (exampleValue !== undefined) {
        return { example: JSON.stringify(exampleValue, null, 2), contentType };
      }
    }
  }
  const schema = contentDef['schema'] as Record<string, unknown> | undefined;
  if (!schema) {
    return null;
  }
  const sample = sampleFromSchema(schema, spec, new Set<string>(), 0);
  return { example: JSON.stringify(sample, null, 2), contentType };
}

function sampleFromSchema(
  schema: Record<string, unknown>,
  spec: Record<string, unknown>,
  seen: Set<string>,
  depth: number
): unknown {
  if (depth > 4) {
    return {};
  }
  const ref = schema['$ref'] as string | undefined;
  if (ref) {
    if (seen.has(ref)) {
      return {};
    }
    seen.add(ref);
    const resolved = resolveRef(ref, spec);
    if (resolved) {
      return sampleFromSchema(resolved, spec, seen, depth + 1);
    }
    return {};
  }

  if (schema['example'] !== undefined) {
    return schema['example'];
  }
  if (schema['default'] !== undefined) {
    return schema['default'];
  }
  const enumValues = schema['enum'] as unknown[] | undefined;
  if (Array.isArray(enumValues) && enumValues.length) {
    return enumValues[0];
  }

  const oneOf = schema['oneOf'] as Record<string, unknown>[] | undefined;
  if (Array.isArray(oneOf) && oneOf.length) {
    return sampleFromSchema(oneOf[0], spec, seen, depth + 1);
  }
  const anyOf = schema['anyOf'] as Record<string, unknown>[] | undefined;
  if (Array.isArray(anyOf) && anyOf.length) {
    return sampleFromSchema(anyOf[0], spec, seen, depth + 1);
  }
  const allOf = schema['allOf'] as Record<string, unknown>[] | undefined;
  if (Array.isArray(allOf) && allOf.length) {
    return sampleFromSchema(allOf[0], spec, seen, depth + 1);
  }

  const type = schema['type'] as string | undefined;
  if (type === 'array') {
    const items = schema['items'] as Record<string, unknown> | undefined;
    return items ? [sampleFromSchema(items, spec, seen, depth + 1)] : [];
  }
  if (type === 'object' || schema['properties']) {
    const properties = schema['properties'] as Record<string, Record<string, unknown>> | undefined;
    const result: Record<string, unknown> = {};
    if (properties) {
      Object.keys(properties).forEach(key => {
        result[key] = sampleFromSchema(properties[key], spec, seen, depth + 1);
      });
    }
    return result;
  }
  if (type === 'integer') {
    return schema['minimum'] ?? 0;
  }
  if (type === 'number') {
    return schema['minimum'] ?? 0;
  }
  if (type === 'boolean') {
    return false;
  }
  if (type === 'string') {
    const format = schema['format'] as string | undefined;
    switch (format) {
      case 'date-time':
        return new Date().toISOString();
      case 'date':
        return new Date().toISOString().slice(0, 10);
      case 'uuid':
        return '00000000-0000-4000-8000-000000000000';
      case 'email':
        return 'user@example.com';
      case 'uri':
        return 'https://example.com';
      default:
        return 'string';
    }
  }
  return {};
}

function resolveRef(ref: string, spec: Record<string, unknown>): Record<string, unknown> | null {
  if (!ref.startsWith('#/')) {
    return null;
  }
  const path = ref.replace(/^#\//, '').split('/');
  let current: unknown = spec;
  for (const segment of path) {
    if (!current || typeof current !== 'object') {
      return null;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  if (current && typeof current === 'object') {
    return current as Record<string, unknown>;
  }
  return null;
}

function extractPathParams(path: string): string[] {
  const matches = path.match(/\{([^}]+)\}/g) ?? [];
  return matches.map(match => match.slice(1, -1));
}

function buildUrl(baseUrl: string, path: string, params: Record<string, string>): string {
  let url = baseUrl.replace(/\/+$/, '') + path;
  Object.keys(params).forEach(key => {
    const value = params[key] || `{${key}}`;
    url = url.replace(`{${key}}`, encodeURIComponent(value));
  });
  return url;
}
