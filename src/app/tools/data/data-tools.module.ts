import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TimestampToolComponent } from './timestamp/timestamp-tool.component';
import { CsvToolComponent } from './csv/csv-tool.component';
import { CronToolComponent } from './cron/cron-tool.component';
import { TimezoneToolComponent } from './timezone/timezone-tool.component';
import { CsvProfilerComponent } from './csv-profiler/csv-profiler.component';
import { OpenApiViewerComponent } from './openapi/openapi-viewer.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'timestamp' },
  { path: 'timestamp', component: TimestampToolComponent, data: { animation: 'timestamp' } },
  { path: 'csv', component: CsvToolComponent, data: { animation: 'csv' } },
  { path: 'cron', component: CronToolComponent, data: { animation: 'cron' } },
  { path: 'timezone', component: TimezoneToolComponent, data: { animation: 'timezone' } },
  { path: 'csv-profiler', component: CsvProfilerComponent, data: { animation: 'csv-profiler' } },
  { path: 'openapi', component: OpenApiViewerComponent, data: { animation: 'openapi' } }
];

@NgModule({
  declarations: [
    TimestampToolComponent,
    CsvToolComponent,
    CronToolComponent,
    CsvProfilerComponent,
    OpenApiViewerComponent
  ],
  imports: [SharedModule, TimezoneToolComponent, RouterModule.forChild(routes)]
})
export class DataToolsModule {}
