import { Component, OnDestroy, OnInit } from '@angular/core';
import { JsonWorkerService } from '../../../shared/services/json-worker.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';
import { DiffResult } from '../utils/json-diff';

@Component({
  selector: 'app-json-diff',
  standalone: false,
  templateUrl: './json-diff.component.html',
  styleUrl: './json-diff.component.css'
})
export class JsonDiffComponent implements OnInit, OnDestroy {
  left = '';
  right = '';
  ignorePaths = '$.meta.*';
  ignoreNullVsMissing = true;
  numericTolerance = 0;
  arrayMatchPath = '';
  arrayMatchKey = '';

  result?: DiffResult;
  diffText = '';
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
    this.left = this.toolState.get('json-diff.left', '{\n  \"id\": 1,\n  \"name\": \"Alpha\"\n}');
    this.right = this.toolState.get('json-diff.right', '{\n  \"id\": 1,\n  \"name\": \"Beta\"\n}');
    this.ignorePaths = this.toolState.get('json-diff.ignorePaths', '$.meta.*');
    this.ignoreNullVsMissing = this.toolState.get('json-diff.ignoreNullVsMissing', true);
    this.numericTolerance = this.toolState.get('json-diff.numericTolerance', 0);
    this.arrayMatchPath = this.toolState.get('json-diff.arrayMatchPath', '');
    this.arrayMatchKey = this.toolState.get('json-diff.arrayMatchKey', '');
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  async run(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      const ignoreList = this.ignorePaths
        .split(/[\n,]+/)
        .map(item => item.trim())
        .filter(Boolean);

      const options = {
        ignorePaths: ignoreList,
        ignoreNullVsMissing: this.ignoreNullVsMissing,
        numericTolerance: Number(this.numericTolerance) || 0,
        arrayMatchKey: this.arrayMatchPath && this.arrayMatchKey
          ? { path: this.arrayMatchPath.trim(), key: this.arrayMatchKey.trim() }
          : null
      };

      const diff = await this.worker.request<{ left: string; right: string; options: typeof options }, DiffResult>(
        'diff',
        { left: this.left, right: this.right, options }
      );
      this.result = diff;
      this.diffText = JSON.stringify(diff, null, 2);
      this.toolState.set('json-diff.left', this.left);
      this.toolState.set('json-diff.right', this.right);
      this.toolState.set('json-diff.ignorePaths', this.ignorePaths);
      this.toolState.set('json-diff.ignoreNullVsMissing', this.ignoreNullVsMissing);
      this.toolState.set('json-diff.numericTolerance', this.numericTolerance);
      this.toolState.set('json-diff.arrayMatchPath', this.arrayMatchPath);
      this.toolState.set('json-diff.arrayMatchKey', this.arrayMatchKey);
      this.toast.success('Diff complete.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to diff JSON.';
      this.toast.error('Invalid JSON input.');
    } finally {
      this.loading = false;
    }
  }
}

