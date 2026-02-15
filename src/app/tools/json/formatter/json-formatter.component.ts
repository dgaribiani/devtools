import { Component, OnDestroy, OnInit } from '@angular/core';
import { JsonWorkerService } from '../../../shared/services/json-worker.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-json-formatter',
  standalone: false,
  templateUrl: './json-formatter.component.html',
  styleUrl: './json-formatter.component.css'
})
export class JsonFormatterComponent implements OnInit, OnDestroy {
  input = '';
  output = '';
  indent = 2;
  error = '';
  errorLine?: number;
  errorColumn?: number;
  errorPosition: number | null = null;
  loading = false;
  private readonly runHandler = () => this.run();

  constructor(
    private worker: JsonWorkerService,
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.input = this.toolState.get('json-formatter.input', '{\n  \"hello\": \"world\"\n}');
    this.indent = this.toolState.get('json-formatter.indent', 2);
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  async run(): Promise<void> {
    this.loading = true;
    this.error = '';
    this.errorLine = undefined;
    this.errorColumn = undefined;
    this.errorPosition = null;
    try {
      const formatted = await this.worker.request<{ input: string; indent: number }, string>('format', {
        input: this.input,
        indent: this.indent
      });
      this.output = formatted;
      this.toast.success('JSON is valid and formatted.');
      this.toolState.set('json-formatter.input', this.input);
      this.toolState.set('json-formatter.indent', this.indent);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON.';
      this.error = message;
      const positionMatch = message.match(/position\s(\d+)/i);
      if (positionMatch) {
        const position = Number(positionMatch[1]);
        this.errorPosition = position;
        const lines = this.input.slice(0, position).split(/\n/);
        this.errorLine = lines.length;
        this.errorColumn = lines[lines.length - 1].length + 1;
      }
      this.toast.error('Invalid JSON. Check the error details.');
    } finally {
      this.loading = false;
    }
  }
}

