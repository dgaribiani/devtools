export type TargetLanguage = 'typescript' | 'go' | 'rust' | 'kotlin';

export function jsonToTypes(input: unknown, language: TargetLanguage): string {
  const builder = new TypeBuilder(language);
  const rootType = builder.inferType('Root', input);
  builder.addRoot('Root', rootType);
  return builder.render();
}

type TypeNode =
  | { kind: 'primitive'; name: string }
  | { kind: 'array'; element: TypeNode }
  | { kind: 'object'; name: string; fields: Record<string, TypeNode> }
  | { kind: 'any' };

class TypeBuilder {
  private definitions: { name: string; node: TypeNode }[] = [];
  private seenObjects = new Map<string, string>();

  constructor(private language: TargetLanguage) {}

  addRoot(name: string, node: TypeNode): void {
    this.definitions.unshift({ name, node });
  }

  inferType(nameHint: string, value: unknown): TypeNode {
    if (value === null || value === undefined) {
      return { kind: 'any' };
    }
    if (Array.isArray(value)) {
      if (!value.length) {
        return { kind: 'array', element: { kind: 'any' } };
      }
      const elementType = this.mergeArrayTypes(value.map(item => this.inferType(nameHint + 'Item', item)));
      return { kind: 'array', element: elementType };
    }
    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const keySig = Object.keys(obj).sort().join('|');
      const existing = this.seenObjects.get(keySig);
      if (existing) {
        return { kind: 'object', name: existing, fields: {} };
      }
      const name = toTypeName(nameHint);
      this.seenObjects.set(keySig, name);
      const fields: Record<string, TypeNode> = {};
      Object.keys(obj).forEach(key => {
        fields[key] = this.inferType(name + toTypeName(key), obj[key]);
      });
      const node: TypeNode = { kind: 'object', name, fields };
      this.definitions.push({ name, node });
      return node;
    }
    switch (typeof value) {
      case 'string':
        return { kind: 'primitive', name: 'string' };
      case 'number':
        return { kind: 'primitive', name: 'number' };
      case 'boolean':
        return { kind: 'primitive', name: 'boolean' };
      default:
        return { kind: 'any' };
    }
  }

  render(): string {
    return this.definitions
      .map(def => this.renderDefinition(def.name, def.node))
      .filter(Boolean)
      .join('\n\n');
  }

  private renderDefinition(name: string, node: TypeNode): string {
    if (node.kind !== 'object') {
      return '';
    }
    switch (this.language) {
      case 'typescript':
        return this.renderTypeScript(name, node.fields);
      case 'go':
        return this.renderGo(name, node.fields);
      case 'rust':
        return this.renderRust(name, node.fields);
      case 'kotlin':
        return this.renderKotlin(name, node.fields);
      default:
        return '';
    }
  }

  private renderTypeScript(name: string, fields: Record<string, TypeNode>): string {
    const lines = Object.keys(fields).map(key => `  ${safeIdentifier(key)}: ${this.renderType(fields[key])};`);
    return `export interface ${name} {\n${lines.join('\n')}\n}`;
  }

  private renderGo(name: string, fields: Record<string, TypeNode>): string {
    const lines = Object.keys(fields).map(key => {
      const fieldName = toExportedName(key);
      return `  ${fieldName} ${this.renderType(fields[key])} \`json:"${key}"\``;
    });
    return `type ${name} struct {\n${lines.join('\n')}\n}`;
  }

  private renderRust(name: string, fields: Record<string, TypeNode>): string {
    const lines = Object.keys(fields).map(key => {
      const fieldName = toSnakeCase(key);
      const rename = fieldName !== key ? `  #[serde(rename = "${key}")]\n` : '';
      return `${rename}  pub ${fieldName}: ${this.renderType(fields[key])},`;
    });
    return `#[derive(Debug, serde::Deserialize, serde::Serialize)]\npub struct ${name} {\n${lines.join('\n')}\n}`;
  }

  private renderKotlin(name: string, fields: Record<string, TypeNode>): string {
    const lines = Object.keys(fields).map(key => {
      const fieldName = toCamelCase(key);
      return `  val ${fieldName}: ${this.renderType(fields[key])}`;
    });
    return `data class ${name}(\n${lines.join(',\n')}\n)`;
  }

  private renderType(node: TypeNode): string {
    switch (node.kind) {
      case 'primitive':
        return this.mapPrimitive(node.name);
      case 'array':
        return this.mapArray(node.element);
      case 'object':
        return node.name;
      case 'any':
        return this.mapAny();
    }
  }

  private mapPrimitive(name: string): string {
    switch (this.language) {
      case 'typescript':
        return name;
      case 'go':
        return name === 'number' ? 'float64' : name === 'boolean' ? 'bool' : 'string';
      case 'rust':
        return name === 'number' ? 'f64' : name === 'boolean' ? 'bool' : 'String';
      case 'kotlin':
        return name === 'number' ? 'Double' : name === 'boolean' ? 'Boolean' : 'String';
      default:
        return name;
    }
  }

  private mapAny(): string {
    switch (this.language) {
      case 'typescript':
        return 'any';
      case 'go':
        return 'any';
      case 'rust':
        return 'serde_json::Value';
      case 'kotlin':
        return 'Any';
      default:
        return 'any';
    }
  }

  private mapArray(element: TypeNode): string {
    const inner = this.renderType(element);
    switch (this.language) {
      case 'typescript':
        return `${inner}[]`;
      case 'go':
        return `[]${inner}`;
      case 'rust':
        return `Vec<${inner}>`;
      case 'kotlin':
        return `List<${inner}>`;
      default:
        return `${inner}[]`;
    }
  }

  private mergeArrayTypes(types: TypeNode[]): TypeNode {
    if (!types.length) {
      return { kind: 'any' };
    }
    const first = types[0];
    if (types.every(type => type.kind === first.kind && JSON.stringify(type) === JSON.stringify(first))) {
      return first;
    }
    return { kind: 'any' };
  }
}

function toTypeName(value: string): string {
  const trimmed = value.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
  if (!trimmed) {
    return 'Type';
  }
  return trimmed
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function safeIdentifier(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9_]/g, '_');
  if (/^[0-9]/.test(cleaned)) {
    return `_${cleaned}`;
  }
  return cleaned || '_field';
}

function toExportedName(value: string): string {
  const name = toTypeName(value);
  return name || 'Field';
}

function toSnakeCase(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
}

function toCamelCase(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9]+/g, ' ');
  const parts = cleaned.trim().split(' ');
  if (!parts.length || !parts[0]) {
    return 'field';
  }
  const [first, ...rest] = parts;
  return [first.toLowerCase(), ...rest.map(part => part.charAt(0).toUpperCase() + part.slice(1))].join('');
}
