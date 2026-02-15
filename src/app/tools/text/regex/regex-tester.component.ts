import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
}

@Component({
  selector: 'app-regex-tester',
  standalone: false,
  templateUrl: './regex-tester.component.html',
  styleUrl: './regex-tester.component.css'
})
export class RegexTesterComponent implements OnInit, OnDestroy {
  pattern = '';
  flags = '';
  text = '';
  matches: RegexMatch[] = [];
  highlightHtml?: SafeHtml;
  error = '';
  private readonly runHandler = () => this.run();

  constructor(
    private sanitizer: DomSanitizer,
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.pattern = this.toolState.get('regex.pattern', '(\\w+)');
    this.flags = this.toolState.get('regex.flags', 'g');
    this.text = this.toolState.get('regex.text', 'Test 123 and test 456');
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  run(): void {
    this.error = '';
    this.matches = [];
    try {
      const regex = new RegExp(this.pattern, this.flags);
      const matches: RegexMatch[] = [];
      let match: RegExpExecArray | null = null;
      while ((match = regex.exec(this.text)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        });
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
      this.matches = matches;
      this.highlightHtml = this.sanitizer.bypassSecurityTrustHtml(buildHighlightedText(this.text, matches));
      this.toolState.set('regex.pattern', this.pattern);
      this.toolState.set('regex.flags', this.flags);
      this.toolState.set('regex.text', this.text);
      this.toast.success('Regex executed.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Invalid regex.';
      this.toast.error('Invalid regex.');
    }
  }
}

function buildHighlightedText(text: string, matches: RegexMatch[]): string {
  if (!matches.length) {
    return escapeHtml(text);
  }
  let result = '';
  let lastIndex = 0;
  matches.forEach(match => {
    const start = match.index;
    const end = match.index + match.match.length;
    result += escapeHtml(text.slice(lastIndex, start));
    result += `<mark>${escapeHtml(text.slice(start, end))}</mark>`;
    lastIndex = end;
  });
  result += escapeHtml(text.slice(lastIndex));
  return result;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

