import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { Base64ToolComponent } from './base64/base64-tool.component';
import { UrlToolComponent } from './url/url-tool.component';
import { JwtToolComponent } from './jwt/jwt-tool.component';
import { HashToolComponent } from './hash/hash-tool.component';
import { UuidToolComponent } from './uuid/uuid-tool.component';
import { SortableIdsComponent } from './sortable-ids/sortable-ids.component';
import { HmacToolComponent } from './hmac/hmac-tool.component';
import { PasswordGeneratorComponent } from './password/password-generator.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'base64' },
  { path: 'base64', component: Base64ToolComponent, data: { animation: 'base64' } },
  { path: 'url', component: UrlToolComponent, data: { animation: 'url' } },
  { path: 'jwt', component: JwtToolComponent, data: { animation: 'jwt' } },
  { path: 'hash', component: HashToolComponent, data: { animation: 'hash' } },
  { path: 'uuid', component: UuidToolComponent, data: { animation: 'uuid' } },
  { path: 'sortable-ids', component: SortableIdsComponent, data: { animation: 'sortable-ids' } },
  { path: 'hmac', component: HmacToolComponent, data: { animation: 'hmac' } },
  { path: 'password', component: PasswordGeneratorComponent, data: { animation: 'password' } }
];

@NgModule({
  declarations: [
    Base64ToolComponent,
    UrlToolComponent,
    JwtToolComponent,
    HashToolComponent,
    UuidToolComponent,
    SortableIdsComponent,
    HmacToolComponent,
    PasswordGeneratorComponent
  ],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class CryptoToolsModule {}
