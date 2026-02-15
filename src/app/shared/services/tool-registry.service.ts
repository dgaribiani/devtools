import { Injectable } from '@angular/core';

export interface ToolItem {
  id: string;
  label: string;
  route: string;
  description: string;
  keywords: string[];
}

export interface ToolCategory {
  id: string;
  label: string;
  tools: ToolItem[];
}

@Injectable({ providedIn: 'root' })
export class ToolRegistryService {
  readonly categories: ToolCategory[] = [
    {
      id: 'json',
      label: 'JSON Core',
      tools: [
        {
          id: 'json-formatter',
          label: 'JSON Formatter / Validator',
          route: '/tools/json/formatter',
          description: 'Validate and pretty print JSON with pinpointed errors.',
          keywords: ['json', 'format', 'validate', 'pretty']
        },
        {
          id: 'json-minifier',
          label: 'JSON Minifier',
          route: '/tools/json/minifier',
          description: 'Compress JSON for payload size.',
          keywords: ['json', 'minify', 'compress']
        },
        {
          id: 'json-canonical',
          label: 'JSON Canonicalizer',
          route: '/tools/json/canonical',
          description: 'Deep sort keys deterministically.',
          keywords: ['json', 'canonical', 'sort']
        },
        {
          id: 'json-diff',
          label: 'JSON Diff',
          route: '/tools/json/diff',
          description: 'Semantic tree diff with ignore rules.',
          keywords: ['json', 'diff', 'compare']
        },
        {
          id: 'json-yaml',
          label: 'JSON <-> YAML',
          route: '/tools/json/yaml',
          description: 'Convert between JSON and YAML.',
          keywords: ['json', 'yaml', 'convert']
        },
        {
          id: 'json-schema',
          label: 'JSON Schema Validator',
          route: '/tools/json/schema',
          description: 'Validate JSON with AJV.',
          keywords: ['json', 'schema', 'ajv']
        },
        {
          id: 'jsonpath',
          label: 'JSONPath Evaluator',
          route: '/tools/json/jsonpath',
          description: 'Query JSON with JSONPath.',
          keywords: ['json', 'jsonpath', 'query']
        },
        {
          id: 'json-patch',
          label: 'JSON Patch (RFC 6902)',
          route: '/tools/json/patch',
          description: 'Generate or apply JSON patches.',
          keywords: ['json', 'patch', 'rfc6902']
        },
        {
          id: 'json-merge-patch',
          label: 'JSON Merge Patch',
          route: '/tools/json/merge-patch',
          description: 'Apply merge patches (RFC 7396).',
          keywords: ['json', 'merge', 'patch']
        },
        {
          id: 'json-types',
          label: 'JSON → Types',
          route: '/tools/json/types',
          description: 'Generate types from JSON.',
          keywords: ['json', 'types', 'schema']
        },
        {
          id: 'json5',
          label: 'JSON5 / JSONC → JSON',
          route: '/tools/json/json5',
          description: 'Parse JSON with comments.',
          keywords: ['json5', 'jsonc', 'convert']
        }
      ]
    },
    {
      id: 'text',
      label: 'Text Tools',
      tools: [
        {
          id: 'text-diff',
          label: 'Text Diff',
          route: '/tools/text/diff',
          description: 'Line-level diff of plain text.',
          keywords: ['text', 'diff', 'compare']
        },
        {
          id: 'regex',
          label: 'Regex Tester',
          route: '/tools/text/regex',
          description: 'Test patterns with group details.',
          keywords: ['regex', 'test', 'pattern']
        },
        {
          id: 'text-stats',
          label: 'Text Editor + Counter',
          route: '/tools/text/stats',
          description: 'Count characters, bytes, and line endings.',
          keywords: ['text', 'count', 'characters', 'lines']
        },
        {
          id: 'whitespace',
          label: 'Whitespace Normalizer',
          route: '/tools/text/whitespace',
          description: 'Trim and normalize line endings.',
          keywords: ['text', 'whitespace', 'normalize']
        },
        {
          id: 'markdown',
          label: 'Markdown Preview',
          route: '/tools/text/markdown',
          description: 'Preview markdown with sanitized HTML.',
          keywords: ['markdown', 'preview', 'html']
        },
        {
          id: 'unicode',
          label: 'Unicode Inspector',
          route: '/tools/text/unicode',
          description: 'Inspect code points and escapes.',
          keywords: ['unicode', 'codepoint', 'text']
        }
      ]
    },
    {
      id: 'crypto',
      label: 'Crypto & Encoding',
      tools: [
        {
          id: 'base64',
          label: 'Base64 Encode/Decode',
          route: '/tools/crypto/base64',
          description: 'Text and file base64 utilities.',
          keywords: ['base64', 'encode', 'decode']
        },
        {
          id: 'url',
          label: 'URL Encode/Decode',
          route: '/tools/crypto/url',
          description: 'Escape and unescape URLs.',
          keywords: ['url', 'encode', 'decode']
        },
        {
          id: 'jwt',
          label: 'JWT Decoder',
          route: '/tools/crypto/jwt',
          description: 'Decode header and payload safely.',
          keywords: ['jwt', 'token', 'decode']
        },
        {
          id: 'hash',
          label: 'Hash Generator',
          route: '/tools/crypto/hash',
          description: 'SHA hashing with Web Crypto.',
          keywords: ['hash', 'sha', 'crypto']
        },
        {
          id: 'uuid',
          label: 'UUID Generator',
          route: '/tools/crypto/uuid',
          description: 'Generate UUIDv4 identifiers.',
          keywords: ['uuid', 'guid', 'v4']
        },
        {
          id: 'sortable-ids',
          label: 'UUIDv7 / ULID',
          route: '/tools/crypto/sortable-ids',
          description: 'Generate sortable identifiers.',
          keywords: ['uuid', 'ulid', 'v7', 'sortable']
        },
        {
          id: 'hmac',
          label: 'HMAC Generator',
          route: '/tools/crypto/hmac',
          description: 'Generate HMAC signatures.',
          keywords: ['hmac', 'hash', 'crypto']
        },
        {
          id: 'password',
          label: 'Password Generator',
          route: '/tools/crypto/password',
          description: 'Generate secure random tokens.',
          keywords: ['password', 'token', 'random']
        }
      ]
    },
    {
      id: 'data',
      label: 'Data Utilities',
      tools: [
        {
          id: 'timestamp',
          label: 'Timestamp Converter',
          route: '/tools/data/timestamp',
          description: 'Unix timestamps to human time.',
          keywords: ['timestamp', 'unix', 'time']
        },
        {
          id: 'csv',
          label: 'CSV <-> JSON',
          route: '/tools/data/csv',
          description: 'Convert CSV and JSON arrays.',
          keywords: ['csv', 'json', 'convert']
        },
        {
          id: 'cron',
          label: 'Cron Next Run',
          route: '/tools/data/cron',
          description: 'Calculate upcoming cron runs.',
          keywords: ['cron', 'schedule', 'time']
        },
        {
          id: 'timezone',
          label: 'Timezone Converter',
          route: '/tools/data/timezone',
          description: 'Convert time between zones.',
          keywords: ['timezone', 'time', 'convert']
        },
        {
          id: 'csv-profiler',
          label: 'CSV Profiler',
          route: '/tools/data/csv-profiler',
          description: 'Analyze CSV columns and stats.',
          keywords: ['csv', 'profile', 'stats']
        },
        {
          id: 'openapi',
          label: 'OpenAPI Snippet Viewer',
          route: '/tools/data/openapi',
          description: 'Browse OpenAPI paths and methods.',
          keywords: ['openapi', 'swagger', 'api']
        }
      ]
    },
    {
      id: 'sql',
      label: 'SQL Tools',
      tools: [
        {
          id: 'sql-formatter',
          label: 'SQL Formatter / Minifier',
          route: '/tools/sql/formatter',
          description: 'Format or minify SQL queries.',
          keywords: ['sql', 'format', 'minify']
        },
        {
          id: 'sql-in-clause',
          label: 'SQL IN Clause Builder',
          route: '/tools/sql/in-clause',
          description: 'Build IN lists from values.',
          keywords: ['sql', 'in', 'list']
        },
        {
          id: 'sql-escape',
          label: 'SQL Identifier Escaper',
          route: '/tools/sql/escape',
          description: 'Quote identifiers safely.',
          keywords: ['sql', 'escape', 'identifier']
        },
        {
          id: 'sql-plan',
          label: 'Execution Plan Analyzer',
          route: '/tools/sql/plan',
          description: 'Analyze execution plans.',
          keywords: ['sql', 'plan', 'explain']
        }
      ]
    }
  ];

  get allTools(): ToolItem[] {
    return this.categories.flatMap(category => category.tools);
  }

  search(query: string): ToolItem[] {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return this.allTools;
    }
    return this.allTools.filter(tool => {
      const haystack = [tool.label, tool.description, ...tool.keywords].join(' ').toLowerCase();
      return haystack.includes(trimmed);
    });
  }
}
