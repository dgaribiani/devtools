import { Component, OnDestroy, OnInit } from '@angular/core';
import { csvToJson, jsonToCsv } from '../utils/csv';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-csv-tool',
  standalone: false,
  templateUrl: './csv-tool.component.html',
  styleUrl: './csv-tool.component.css'
})
export class CsvToolComponent implements OnInit, OnDestroy {
  csvInput = '';
  jsonInput = '';
  delimiter = ',';
  header = true;
  error = '';
  private readonly runHandler = () => this.toJson();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.csvInput = this.toolState.get('csv.input', 'name,age\nAda,30\nLinus,34');
    this.jsonInput = this.toolState.get('csv.json', '');
    this.delimiter = this.toolState.get('csv.delimiter', ',');
    this.header = this.toolState.get('csv.header', true);
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  toJson(): void {
    this.error = '';
    const { data, errors } = csvToJson(this.csvInput, { delimiter: this.delimiter, header: this.header });
    if (errors.length) {
      this.error = errors.join(' | ');
      this.toast.error('CSV parse errors detected.');
    } else {
      this.toast.success('CSV converted to JSON.');
    }
    this.jsonInput = JSON.stringify(data, null, 2);
    this.persist();
  }

  toCsv(): void {
    this.error = '';
    const { csv, error } = jsonToCsv(this.jsonInput, { delimiter: this.delimiter, header: this.header });
    if (error) {
      this.error = error;
      this.toast.error(error);
      return;
    }
    this.csvInput = csv;
    this.toast.success('JSON converted to CSV.');
    this.persist();
  }

  private persist(): void {
    this.toolState.set('csv.input', this.csvInput);
    this.toolState.set('csv.json', this.jsonInput);
    this.toolState.set('csv.delimiter', this.delimiter);
    this.toolState.set('csv.header', this.header);
  }
}

