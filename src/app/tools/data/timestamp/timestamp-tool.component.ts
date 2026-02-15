import { Component, OnDestroy, OnInit } from '@angular/core';
import { formatTimestamp, parseTimestampInput } from '../utils/timestamp';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-timestamp-tool',
  standalone: false,
  templateUrl: './timestamp-tool.component.html',
  styleUrl: './timestamp-tool.component.css'
})
export class TimestampToolComponent implements OnInit, OnDestroy {
  timestampInput = '';
  dateInput = '';
  result?: { epochMs: number; local: string; utc: string } | null;
  error = '';
  private readonly runHandler = () => this.convertTimestamp();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.timestampInput = this.toolState.get('timestamp.input', `${Date.now()}`);
    this.dateInput = this.toolState.get('timestamp.date', '');
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  convertTimestamp(): void {
    this.error = '';
    const result = parseTimestampInput(this.timestampInput);
    if (!result) {
      this.error = 'Invalid timestamp input.';
      this.toast.error(this.error);
      this.result = null;
      return;
    }
    this.result = result;
    this.toolState.set('timestamp.input', this.timestampInput);
    this.toast.success('Timestamp converted.');
  }

  convertDate(): void {
    this.error = '';
    if (!this.dateInput) {
      this.error = 'Select a date/time first.';
      this.toast.error(this.error);
      return;
    }
    const epochMs = new Date(this.dateInput).getTime();
    if (Number.isNaN(epochMs)) {
      this.error = 'Invalid date input.';
      this.toast.error(this.error);
      return;
    }
    this.result = formatTimestamp(epochMs);
    this.timestampInput = `${epochMs}`;
    this.toolState.set('timestamp.input', this.timestampInput);
    this.toolState.set('timestamp.date', this.dateInput);
    this.toast.success('Date converted to timestamp.');
  }
}

