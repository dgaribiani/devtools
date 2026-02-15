import { Component, OnDestroy, OnInit } from '@angular/core';
import { JsonWorkerService } from '../../../shared/services/json-worker.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-json-minifier',
  standalone: false,
  templateUrl: './json-minifier.component.html',
  styleUrl: './json-minifier.component.css'
})
export class JsonMinifierComponent implements OnInit, OnDestroy {
  input = '';
  output = '';
  error = '';
  loading = false;
  private readonly runHandler = () => this.run();

  constructor(
    private worker: JsonWorkerService,
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.input = this.toolState.get('json-minifier.input', '{\n  \"name\": \"devtoolbox\"\n}');
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  async run(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      const minified = await this.worker.request<{ input: string }, string>('minify', { input: this.input });
      this.output = minified;
      this.toolState.set('json-minifier.input', this.input);
      this.toast.success('Minified JSON ready.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Invalid JSON.';
      this.toast.error('Invalid JSON.');
    } finally {
      this.loading = false;
    }
  }
}

