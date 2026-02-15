import { Component, OnDestroy, OnInit } from '@angular/core';
import { buildInClause, InClauseOptions } from '../utils/sql-tools';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-sql-in-clause',
  standalone: false,
  templateUrl: './sql-in-clause.component.html',
  styleUrl: './sql-in-clause.component.css'
})
export class SqlInClauseComponent implements OnInit, OnDestroy {
  input = '';
  output = '';
  options: InClauseOptions = {
    quote: 'single',
    unique: true,
    multiline: true
  };
  error = '';
  private readonly runHandler = () => this.build();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.input = this.toolState.get('sql-in.input', 'alpha\nbeta\ngamma');
    this.options = this.toolState.get('sql-in.options', this.options);
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  build(): void {
    this.error = '';
    try {
      this.output = buildInClause(this.input, this.options);
      this.toolState.set('sql-in.input', this.input);
      this.toolState.set('sql-in.options', this.options);
      this.toast.success('IN clause built.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to build IN clause.';
      this.toast.error('Unable to build IN clause.');
    }
  }
}
