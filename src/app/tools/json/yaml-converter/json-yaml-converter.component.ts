import { Component, OnDestroy, OnInit } from '@angular/core';
import { dump, load } from 'js-yaml';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-json-yaml-converter',
  standalone: false,
  templateUrl: './json-yaml-converter.component.html',
  styleUrl: './json-yaml-converter.component.css'
})
export class JsonYamlConverterComponent implements OnInit, OnDestroy {
  jsonInput = '';
  yamlInput = '';
  error = '';
  private readonly runHandler = () => this.toYaml();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.jsonInput = this.toolState.get('json-yaml.json', '{\n  \"name\": \"Dev Toolbox\"\n}');
    this.yamlInput = this.toolState.get('json-yaml.yaml', 'name: Dev Toolbox');
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  toYaml(): void {
    this.error = '';
    try {
      const parsed = JSON.parse(this.jsonInput);
      this.yamlInput = dump(parsed, { noRefs: true, indent: 2 });
      this.toolState.set('json-yaml.json', this.jsonInput);
      this.toolState.set('json-yaml.yaml', this.yamlInput);
      this.toast.success('Converted JSON to YAML.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Invalid JSON.';
      this.toast.error('Invalid JSON.');
    }
  }

  toJson(): void {
    this.error = '';
    try {
      const parsed = load(this.yamlInput);
      this.jsonInput = JSON.stringify(parsed, null, 2);
      this.toolState.set('json-yaml.json', this.jsonInput);
      this.toolState.set('json-yaml.yaml', this.yamlInput);
      this.toast.success('Converted YAML to JSON.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Invalid YAML.';
      this.toast.error('Invalid YAML.');
    }
  }
}

