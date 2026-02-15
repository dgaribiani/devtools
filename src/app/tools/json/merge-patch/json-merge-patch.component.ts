import { Component, OnDestroy, OnInit } from '@angular/core';
import { applyMergePatch } from '../utils/merge-patch';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-json-merge-patch',
  standalone: false,
  templateUrl: './json-merge-patch.component.html',
  styleUrl: './json-merge-patch.component.css'
})
export class JsonMergePatchComponent implements OnInit, OnDestroy {
  baseInput = '';
  patchInput = '';
  output = '';
  error = '';
  private readonly runHandler = () => this.apply();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.baseInput = this.toolState.get('json-merge.base', '{\n  "name": "Alpha",\n  "meta": {\n    "version": 1\n  }\n}');
    this.patchInput = this.toolState.get('json-merge.patch', '{\n  "name": "Beta",\n  "meta": {\n    "version": 2\n  }\n}');
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  apply(): void {
    this.error = '';
    this.output = '';
    try {
      const base = JSON.parse(this.baseInput);
      const patch = JSON.parse(this.patchInput);
      const result = applyMergePatch(base, patch);
      this.output = JSON.stringify(result, null, 2);
      this.toolState.set('json-merge.base', this.baseInput);
      this.toolState.set('json-merge.patch', this.patchInput);
      this.toast.success('Merge patch applied.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to apply merge patch.';
      this.toast.error('Invalid JSON input.');
    }
  }
}
