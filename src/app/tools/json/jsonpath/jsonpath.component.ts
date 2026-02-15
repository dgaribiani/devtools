import { Component, OnDestroy, OnInit } from '@angular/core';
import { JSONPath } from 'jsonpath-plus';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-jsonpath',
  standalone: false,
  templateUrl: './jsonpath.component.html',
  styleUrl: './jsonpath.component.css'
})
export class JsonpathComponent implements OnInit, OnDestroy {
  jsonInput = '';
  path = '';
  output = '';
  error = '';
  private readonly runHandler = () => this.run();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.jsonInput = this.toolState.get('jsonpath.json', '{\n  \"store\": {\n    \"book\": [{\"title\": \"Alpha\"}, {\"title\": \"Beta\"}]\n  }\n}');
    this.path = this.toolState.get('jsonpath.path', '$.store.book[*].title');
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  run(): void {
    this.error = '';
    try {
      const data = JSON.parse(this.jsonInput);
      const result = JSONPath({ path: this.path, json: data });
      this.output = JSON.stringify(result, null, 2);
      this.toolState.set('jsonpath.json', this.jsonInput);
      this.toolState.set('jsonpath.path', this.path);
      this.toast.success('JSONPath executed.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Invalid JSON or JSONPath.';
      this.toast.error('Invalid JSON or JSONPath.');
    }
  }
}

