import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

interface UnicodeRow {
  index: number;
  char: string;
  codePoint: string;
  hex: string;
  utf16: string;
}

@Component({
  selector: 'app-unicode-inspector',
  standalone: false,
  templateUrl: './unicode-inspector.component.html',
  styleUrl: './unicode-inspector.component.css'
})
export class UnicodeInspectorComponent implements OnInit, OnDestroy {
  input = '';
  rows: UnicodeRow[] = [];
  error = '';
  private readonly runHandler = () => this.inspect();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.input = this.toolState.get('unicode.input', 'Hello ??');
    this.inspect();
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  inspect(): void {
    this.error = '';
    try {
      this.rows = buildRows(this.input);
      this.toolState.set('unicode.input', this.input);
      this.toast.success('Unicode inspected.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to inspect text.';
      this.toast.error('Unable to inspect text.');
    }
  }
}

function buildRows(input: string): UnicodeRow[] {
  const rows: UnicodeRow[] = [];
  let index = 0;
  for (const char of Array.from(input)) {
    const codePoint = char.codePointAt(0) ?? 0;
    rows.push({
      index,
      char,
      codePoint: `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
      hex: `0x${codePoint.toString(16).toUpperCase()}`,
      utf16: char
        .split('')
        .map(codeUnit => codeUnit.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'))
        .join(' ')
    });
    index++;
  }
  return rows;
}
