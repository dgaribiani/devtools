import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { EditorComponent } from './components/editor/editor.component';
import { ResultPanelComponent } from './components/result-panel/result-panel.component';
import { ToolbarButtonsComponent } from './components/toolbar-buttons/toolbar-buttons.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { AdSlotComponent } from './components/ad-slot/ad-slot.component';
import { CommandPaletteComponent } from './components/command-palette/command-palette.component';

const materialModules = [
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatCardModule,
  MatSelectModule,
  MatTooltipModule,
  MatSlideToggleModule,
  MatChipsModule,
  MatProgressSpinnerModule,
  MatMenuModule,
  MatDividerModule
];

@NgModule({
  declarations: [
    EditorComponent,
    ResultPanelComponent,
    ToolbarButtonsComponent,
    ToastContainerComponent,
    AdSlotComponent,
    CommandPaletteComponent
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ClipboardModule, ...materialModules],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ClipboardModule,
    ...materialModules,
    EditorComponent,
    ResultPanelComponent,
    ToolbarButtonsComponent,
    ToastContainerComponent,
    AdSlotComponent,
    CommandPaletteComponent
  ]
})
export class SharedModule {}
