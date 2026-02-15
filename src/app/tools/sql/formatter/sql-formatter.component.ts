import { Component, OnDestroy, OnInit } from '@angular/core';
import { formatSql, minifySql, SqlDialect } from '../utils/sql-tools';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-sql-formatter',
  standalone: false,
  templateUrl: './sql-formatter.component.html',
  styleUrl: './sql-formatter.component.css'
})
export class SqlFormatterComponent implements OnInit, OnDestroy {
  input = '';
  output = '';
  dialect: SqlDialect = 'sql';
  error = '';
  private readonly runHandler = () => this.format();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.input = this.toolState.get(
      'sql-formatter.input',
      'select id, name from users where status = \'active\' and created_at > now() - interval \'7 days\' order by created_at desc;'
    );
    this.dialect = this.toolState.get('sql-formatter.dialect', 'sql');
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  format(): void {
    this.error = '';
    try {
      this.output = formatSql(this.input, this.dialect);
      this.toolState.set('sql-formatter.input', this.input);
      this.toolState.set('sql-formatter.dialect', this.dialect);
      this.toast.success('SQL formatted.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to format SQL.';
      this.toast.error('Unable to format SQL.');
    }
  }

  minify(): void {
    this.error = '';
    try {
      this.output = minifySql(this.input);
      this.toolState.set('sql-formatter.input', this.input);
      this.toolState.set('sql-formatter.dialect', this.dialect);
      this.toast.success('SQL minified.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to minify SQL.';
      this.toast.error('Unable to minify SQL.');
    }
  }
}
