import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TextDiffComponent } from './diff/text-diff.component';
import { RegexTesterComponent } from './regex/regex-tester.component';
import { TextStatsComponent } from './stats/text-stats.component';
import { WhitespaceNormalizerComponent } from './whitespace/whitespace-normalizer.component';
import { MarkdownPreviewComponent } from './markdown/markdown-preview.component';
import { UnicodeInspectorComponent } from './unicode/unicode-inspector.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'diff' },
  { path: 'diff', component: TextDiffComponent, data: { animation: 'text-diff' } },
  { path: 'regex', component: RegexTesterComponent, data: { animation: 'regex' } },
  { path: 'stats', component: TextStatsComponent, data: { animation: 'text-stats' } },
  { path: 'whitespace', component: WhitespaceNormalizerComponent, data: { animation: 'whitespace' } },
  { path: 'markdown', component: MarkdownPreviewComponent, data: { animation: 'markdown' } },
  { path: 'unicode', component: UnicodeInspectorComponent, data: { animation: 'unicode' } }
];

@NgModule({
  declarations: [
    TextDiffComponent,
    RegexTesterComponent,
    TextStatsComponent,
    WhitespaceNormalizerComponent,
    MarkdownPreviewComponent,
    UnicodeInspectorComponent
  ],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class TextToolsModule {}
