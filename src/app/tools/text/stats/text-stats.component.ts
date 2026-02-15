import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

interface TextStats {
  chars: number;
  charsNoWhitespace: number;
  words: number;
  lines: number;
  bytes: number;
  cr: number;
  lf: number;
  crlf: number;
}

@Component({
  selector: 'app-text-stats',
  standalone: false,
  templateUrl: './text-stats.component.html',
  styleUrl: './text-stats.component.css'
})
export class TextStatsComponent implements OnInit, OnDestroy {
  input = '';
  stats: TextStats = {
    chars: 0,
    charsNoWhitespace: 0,
    words: 0,
    lines: 1,
    bytes: 0,
    cr: 0,
    lf: 0,
    crlf: 0
  };

  private readonly runHandler = () => this.recount();

  constructor(
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.input = this.toolState.get('text-stats.input', 'Paste text here');
    this.recount();
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  onInputChange(value: string): void {
    this.input = value;
    this.toolState.set('text-stats.input', this.input);
    this.recount();
  }

  recount(): void {
    const text = this.input ?? '';
    const chars = text.length;
    const charsNoWhitespace = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const bytes = new TextEncoder().encode(text).length;

    const { cr, lf, crlf } = countLineEndings(text);
    const lines = text.length === 0 ? 0 : crlf + lf + cr + 1;

    this.stats = { chars, charsNoWhitespace, words, lines, bytes, cr, lf, crlf };
  }
}

function countLineEndings(text: string): { cr: number; lf: number; crlf: number } {
  let cr = 0;
  let lf = 0;
  let crlf = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '\r') {
      if (text[i + 1] === '\n') {
        crlf++;
        i++;
      } else {
        cr++;
      }
    } else if (char === '\n') {
      lf++;
    }
  }

  return { cr, lf, crlf };
}
