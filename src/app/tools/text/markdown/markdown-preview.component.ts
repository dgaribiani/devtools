import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import createDOMPurify from 'dompurify';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-markdown-preview',
  standalone: false,
  templateUrl: './markdown-preview.component.html',
  styleUrl: './markdown-preview.component.css'
})
export class MarkdownPreviewComponent implements OnInit, OnDestroy {
  input = '';
  htmlOutput = '';
  preview?: SafeHtml;
  error = '';
  private readonly runHandler = () => this.render();

  constructor(
    private sanitizer: DomSanitizer,
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.input = this.toolState.get('markdown.input', '# Markdown Preview\n\n- Fast preview\n- Sanitized output\n');
    this.activeTool.register(this.runHandler);
    this.render();
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  render(): void {
    this.error = '';
    try {
      const raw = marked.parse(this.input, { breaks: true }) as string;
      this.htmlOutput = getSanitizer().sanitize(raw);
      this.preview = this.sanitizer.bypassSecurityTrustHtml(this.htmlOutput);
      this.toolState.set('markdown.input', this.input);
      this.toast.success('Markdown rendered.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to render markdown.';
      this.toast.error('Unable to render markdown.');
    }
  }
}

function getSanitizer(): { sanitize: (input: string) => string } {
  if (typeof window === 'undefined') {
    return { sanitize: (input: string) => input };
  }
  return createDOMPurify(window);
}
