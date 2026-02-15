import { Component, OnDestroy, OnInit } from '@angular/core';
import { jsonToTypes, TargetLanguage } from '../utils/json-types';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-json-types',
  standalone: false,
  templateUrl: './json-types.component.html',
  styleUrl: './json-types.component.css'
})
export class JsonTypesComponent implements OnInit, OnDestroy {
  input = '';
  output = '';
  language: TargetLanguage = 'typescript';
  error = '';
  private readonly runHandler = () => this.generate();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.input = this.toolState.get('json-types.input', '{\n  "id": 1,\n  "name": "Dev Toolbox",\n  "tags": ["tool", "json"],\n  "meta": {\n    "active": true\n  }\n}');
    this.language = this.toolState.get('json-types.language', 'typescript');
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  generate(): void {
    this.error = '';
    this.output = '';
    try {
      const parsed = JSON.parse(this.input);
      this.output = jsonToTypes(parsed, this.language);
      this.toolState.set('json-types.input', this.input);
      this.toolState.set('json-types.language', this.language);
      this.toast.success('Types generated.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to generate types.';
      this.toast.error('Invalid JSON input.');
    }
  }
}
