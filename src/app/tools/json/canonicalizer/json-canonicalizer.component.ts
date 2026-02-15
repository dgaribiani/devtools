import { Component, OnDestroy, OnInit } from '@angular/core';
import { JsonWorkerService } from '../../../shared/services/json-worker.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-json-canonicalizer',
  standalone: false,
  templateUrl: './json-canonicalizer.component.html',
  styleUrl: './json-canonicalizer.component.css'
})
export class JsonCanonicalizerComponent implements OnInit, OnDestroy {
  input = '';
  output = '';
  sortKeys = true;
  preserveArrayOrder = true;
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
    this.input = this.toolState.get('json-canonical.input', '{\n  \"b\": 2,\n  \"a\": {\n    \"z\": 1,\n    \"y\": 2\n  }\n}');
    this.sortKeys = this.toolState.get('json-canonical.sortKeys', true);
    this.preserveArrayOrder = this.toolState.get('json-canonical.preserveArrayOrder', true);
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  async run(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      const canonical = await this.worker.request<{ input: string; options: { sortKeys: boolean; preserveArrayOrder: boolean } }, string>(
        'canonicalize',
        {
          input: this.input,
          options: {
            sortKeys: this.sortKeys,
            preserveArrayOrder: this.preserveArrayOrder
          }
        }
      );
      this.output = canonical;
      this.toolState.set('json-canonical.input', this.input);
      this.toolState.set('json-canonical.sortKeys', this.sortKeys);
      this.toolState.set('json-canonical.preserveArrayOrder', this.preserveArrayOrder);
      this.toast.success('Canonical JSON generated.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Invalid JSON.';
      this.toast.error('Invalid JSON.');
    } finally {
      this.loading = false;
    }
  }
}

