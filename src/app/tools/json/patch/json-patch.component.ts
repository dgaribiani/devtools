import { Component, OnDestroy, OnInit } from '@angular/core';
import { compare, applyPatch, Operation } from 'fast-json-patch';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-json-patch',
  standalone: false,
  templateUrl: './json-patch.component.html',
  styleUrl: './json-patch.component.css'
})
export class JsonPatchComponent implements OnInit, OnDestroy {
  baseInput = '';
  targetInput = '';
  patchInput = '';
  output = '';
  error = '';
  private readonly runHandler = () => this.generatePatch();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.baseInput = this.toolState.get('json-patch.base', '{\n  "id": 1,\n  "name": "Alpha"\n}');
    this.targetInput = this.toolState.get('json-patch.target', '{\n  "id": 1,\n  "name": "Beta"\n}');
    this.patchInput = this.toolState.get('json-patch.patch', '[\n  {\n    "op": "replace",\n    "path": "/name",\n    "value": "Beta"\n  }\n]');
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  generatePatch(): void {
    this.error = '';
    this.output = '';
    try {
      const base = JSON.parse(this.baseInput);
      const target = JSON.parse(this.targetInput);
      const patch = compare(base, target);
      this.patchInput = JSON.stringify(patch, null, 2);
      this.output = this.patchInput;
      this.persist();
      this.toast.success('Patch generated.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to generate patch.';
      this.toast.error('Invalid JSON input.');
    }
  }

  applyPatch(): void {
    this.error = '';
    this.output = '';
    try {
      const base = JSON.parse(this.baseInput);
      const patch = JSON.parse(this.patchInput) as Operation[];
      const result = applyPatch(base, patch, true, false).newDocument;
      this.output = JSON.stringify(result, null, 2);
      this.persist();
      this.toast.success('Patch applied.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to apply patch.';
      this.toast.error('Invalid patch or JSON.');
    }
  }

  private persist(): void {
    this.toolState.set('json-patch.base', this.baseInput);
    this.toolState.set('json-patch.target', this.targetInput);
    this.toolState.set('json-patch.patch', this.patchInput);
  }
}
