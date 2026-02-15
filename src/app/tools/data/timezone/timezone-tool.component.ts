import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';
import { SharedModule } from '../../../shared/shared.module';
import {
  TIMEZONE_LIST,
  convertTimeZone,
  formatInZone,
  toDateTimeLocalValue,
  TimezoneConversionResult
} from '../utils/timezone';

@Component({
  selector: 'app-timezone-tool',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './timezone-tool.component.html',
  styleUrl: './timezone-tool.component.css'
})
export class TimezoneToolComponent implements OnInit, OnDestroy {
  timezones = TIMEZONE_LIST;
  sourceZone = 'UTC';
  targetZone = 'America/New_York';
  dateInput = '';
  result?: TimezoneConversionResult;
  error = '';
  private readonly runHandler = () => this.convert();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    this.sourceZone = this.toolState.get('tz.source', localZone);
    this.targetZone = this.toolState.get('tz.target', 'UTC');
    const storedDate = this.toolState.get('tz.date', '');
    this.dateInput = storedDate || toDateTimeLocalValue(new Date());
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  convert(): void {
    this.error = '';
    this.result = undefined;
    try {
      this.result = convertTimeZone(this.dateInput, this.sourceZone, this.targetZone);
      this.toolState.set('tz.source', this.sourceZone);
      this.toolState.set('tz.target', this.targetZone);
      this.toolState.set('tz.date', this.dateInput);
      this.toast.success('Time converted.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to convert time.';
      this.toast.error(this.error);
    }
  }

  get utcLabel(): string {
    if (!this.result) {
      return '';
    }
    return formatInZone(this.result.utc, 'UTC');
  }
}
