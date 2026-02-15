import { Component, OnDestroy, OnInit } from '@angular/core';
import Ajv, { ErrorObject } from 'ajv';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-json-schema-validator',
  standalone: false,
  templateUrl: './json-schema-validator.component.html',
  styleUrl: './json-schema-validator.component.css'
})
export class JsonSchemaValidatorComponent implements OnInit, OnDestroy {
  schemaInput = '';
  jsonInput = '';
  errors: ErrorObject[] = [];
  error = '';
  valid: boolean | null = null;
  private readonly runHandler = () => this.run();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.schemaInput = this.toolState.get('json-schema.schema', '{\n  \"type\": \"object\",\n  \"properties\": {\n    \"name\": {\"type\": \"string\"},\n    \"age\": {\"type\": \"number\"}\n  },\n  \"required\": [\"name\"]\n}');
    this.jsonInput = this.toolState.get('json-schema.json', '{\n  \"name\": \"Dev Toolbox\",\n  \"age\": 4\n}');
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  run(): void {
    this.error = '';
    this.errors = [];
    this.valid = null;
    try {
      const schema = JSON.parse(this.schemaInput);
      const data = JSON.parse(this.jsonInput);
      const ajv = new Ajv({ allErrors: true, strict: false });
      const validate = ajv.compile(schema);
      const valid = validate(data) as boolean;
      this.valid = valid;
      this.errors = validate.errors ?? [];
      this.toolState.set('json-schema.schema', this.schemaInput);
      this.toolState.set('json-schema.json', this.jsonInput);
      if (valid) {
        this.toast.success('JSON matches the schema.');
      } else {
        this.toast.error('Schema validation failed.');
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Invalid schema or JSON.';
      this.toast.error('Invalid schema or JSON.');
    }
  }
}

