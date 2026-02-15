import { Component, OnDestroy, OnInit } from '@angular/core';
import { escapeIdentifiers, IdentifierStyle } from '../utils/sql-tools';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-sql-escape',
  standalone: false,
  templateUrl: './sql-escape.component.html',
  styleUrl: './sql-escape.component.css'
})
export class SqlEscapeComponent implements OnInit, OnDestroy {
  input = '';
  output = '';
  style: IdentifierStyle = 'ansi';
  error = '';
  private readonly runHandler = () => this.escape();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.input = this.toolState.get('sql-escape.input', 'user\norder\nselect');
    this.style = this.toolState.get('sql-escape.style', 'ansi');
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  escape(): void {
    this.error = '';
    try {
      this.output = escapeIdentifiers(this.input, this.style);
      this.toolState.set('sql-escape.input', this.input);
      this.toolState.set('sql-escape.style', this.style);
      this.toast.success('Identifiers escaped.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to escape identifiers.';
      this.toast.error('Unable to escape identifiers.');
    }
  }
}
