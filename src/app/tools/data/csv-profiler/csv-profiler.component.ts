import { Component, OnDestroy, OnInit } from '@angular/core';
import * as Papa from 'papaparse';
import { profileCsv, CsvProfileResult } from '../utils/csv-profiler';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-csv-profiler',
  standalone: false,
  templateUrl: './csv-profiler.component.html',
  styleUrl: './csv-profiler.component.css'
})
export class CsvProfilerComponent implements OnInit, OnDestroy {
  input = '';
  delimiter = '';
  header = true;
  output = '';
  result?: CsvProfileResult;
  error = '';
  private readonly runHandler = () => this.profile();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.input = this.toolState.get('csv-profiler.input', 'name,age,city\nAda,30,London\nLinus,34,Helsinki');
    this.delimiter = this.toolState.get('csv-profiler.delimiter', '');
    this.header = this.toolState.get('csv-profiler.header', true);
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  profile(): void {
    this.error = '';
    this.output = '';
    this.result = undefined;
    try {
      const parsed = Papa.parse<string[]>(this.input, {
        delimiter: this.delimiter || undefined,
        skipEmptyLines: true
      });
      if (parsed.errors?.length) {
        const message = parsed.errors.map(err => err.message).join(' | ');
        this.error = message;
        this.toast.error('CSV parse errors detected.');
      }
      const data = parsed.data as string[][];
      const delimiter = parsed.meta.delimiter || this.delimiter || ',';
      this.result = profileCsv(data, delimiter, this.header);
      this.output = JSON.stringify(this.result, null, 2);
      this.toolState.set('csv-profiler.input', this.input);
      this.toolState.set('csv-profiler.delimiter', this.delimiter);
      this.toolState.set('csv-profiler.header', this.header);
      this.toast.success('CSV profiled.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to profile CSV.';
      this.toast.error('Unable to profile CSV.');
    }
  }
}
