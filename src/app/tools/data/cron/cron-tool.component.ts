import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';
import { computeNextCronRuns, formatCronRun, parseDateTimeLocal } from '../utils/cron';

@Component({
  selector: 'app-cron-tool',
  standalone: false,
  templateUrl: './cron-tool.component.html',
  styleUrl: './cron-tool.component.css'
})
export class CronToolComponent implements OnInit, OnDestroy {
  expression = '';
  baseDateInput = '';
  count = 5;
  useUtc = false;
  results: string[] = [];
  error = '';
  private readonly runHandler = () => this.run();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.expression = this.toolState.get('cron.expression', '*/5 * * * *');
    this.baseDateInput = this.toolState.get('cron.baseDate', '');
    this.count = this.toolState.get('cron.count', 5);
    this.useUtc = this.toolState.get('cron.useUtc', false);
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  run(): void {
    this.error = '';
    this.results = [];
    try {
      const total = Math.max(1, Math.min(10, Number(this.count) || 1));
      const baseDate = parseDateTimeLocal(this.baseDateInput, this.useUtc);
      const runs = computeNextCronRuns(this.expression, baseDate, total, this.useUtc);
      this.results = runs.map(date => formatCronRun(date, this.useUtc));
      this.toolState.set('cron.expression', this.expression);
      this.toolState.set('cron.baseDate', this.baseDateInput);
      this.toolState.set('cron.count', total);
      this.toolState.set('cron.useUtc', this.useUtc);
      this.toast.success('Cron schedule calculated.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Invalid cron expression.';
      this.toast.error(this.error);
    }
  }
}
