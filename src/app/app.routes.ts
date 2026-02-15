import { Routes } from '@angular/router';
import { PrivacyComponent } from './privacy/privacy.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tools/json/formatter' },
  { path: 'privacy', component: PrivacyComponent, data: { animation: 'privacy' } },
  {
    path: 'tools/json',
    loadChildren: () => import('./tools/json/json-tools.module').then(m => m.JsonToolsModule)
  },
  {
    path: 'tools/text',
    loadChildren: () => import('./tools/text/text-tools.module').then(m => m.TextToolsModule)
  },
  {
    path: 'tools/crypto',
    loadChildren: () => import('./tools/crypto/crypto-tools.module').then(m => m.CryptoToolsModule)
  },
  {
    path: 'tools/data',
    loadChildren: () => import('./tools/data/data-tools.module').then(m => m.DataToolsModule)
  },
  {
    path: 'tools/sql',
    loadChildren: () => import('./tools/sql/sql-tools.module').then(m => m.SqlToolsModule)
  },
  { path: '**', redirectTo: 'tools/json/formatter' }
];
