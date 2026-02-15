import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { JsonFormatterComponent } from './formatter/json-formatter.component';
import { JsonMinifierComponent } from './minifier/json-minifier.component';
import { JsonCanonicalizerComponent } from './canonicalizer/json-canonicalizer.component';
import { JsonDiffComponent } from './diff/json-diff.component';
import { JsonYamlConverterComponent } from './yaml-converter/json-yaml-converter.component';
import { JsonSchemaValidatorComponent } from './schema-validator/json-schema-validator.component';
import { JsonpathComponent } from './jsonpath/jsonpath.component';
import { JsonPatchComponent } from './patch/json-patch.component';
import { JsonMergePatchComponent } from './merge-patch/json-merge-patch.component';
import { JsonTypesComponent } from './types/json-types.component';
import { Json5ConverterComponent } from './json5/json5-converter.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'formatter' },
  { path: 'formatter', component: JsonFormatterComponent, data: { animation: 'json-formatter' } },
  { path: 'minifier', component: JsonMinifierComponent, data: { animation: 'json-minifier' } },
  { path: 'canonical', component: JsonCanonicalizerComponent, data: { animation: 'json-canonical' } },
  { path: 'diff', component: JsonDiffComponent, data: { animation: 'json-diff' } },
  { path: 'yaml', component: JsonYamlConverterComponent, data: { animation: 'json-yaml' } },
  { path: 'schema', component: JsonSchemaValidatorComponent, data: { animation: 'json-schema' } },
  { path: 'jsonpath', component: JsonpathComponent, data: { animation: 'jsonpath' } },
  { path: 'patch', component: JsonPatchComponent, data: { animation: 'json-patch' } },
  { path: 'merge-patch', component: JsonMergePatchComponent, data: { animation: 'json-merge-patch' } },
  { path: 'types', component: JsonTypesComponent, data: { animation: 'json-types' } },
  { path: 'json5', component: Json5ConverterComponent, data: { animation: 'json5' } }
];

@NgModule({
  declarations: [
    JsonFormatterComponent,
    JsonMinifierComponent,
    JsonCanonicalizerComponent,
    JsonDiffComponent,
    JsonYamlConverterComponent,
    JsonSchemaValidatorComponent,
    JsonpathComponent,
    JsonPatchComponent,
    JsonMergePatchComponent,
    JsonTypesComponent,
    Json5ConverterComponent
  ],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class JsonToolsModule {}
