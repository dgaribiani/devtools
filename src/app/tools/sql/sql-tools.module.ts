import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SqlFormatterComponent } from './formatter/sql-formatter.component';
import { SqlInClauseComponent } from './in-clause/sql-in-clause.component';
import { SqlEscapeComponent } from './escape/sql-escape.component';
import { SqlPlanAnalyzerComponent } from './plan/sql-plan-analyzer.component';
import { PlanNodeComponent } from './plan-node/plan-node.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'formatter' },
  { path: 'formatter', component: SqlFormatterComponent, data: { animation: 'sql-formatter' } },
  { path: 'in-clause', component: SqlInClauseComponent, data: { animation: 'sql-in' } },
  { path: 'escape', component: SqlEscapeComponent, data: { animation: 'sql-escape' } },
  { path: 'plan', component: SqlPlanAnalyzerComponent, data: { animation: 'sql-plan' } }
];

@NgModule({
  declarations: [
    SqlFormatterComponent,
    SqlInClauseComponent,
    SqlEscapeComponent,
    SqlPlanAnalyzerComponent,
    PlanNodeComponent
  ],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class SqlToolsModule {}
