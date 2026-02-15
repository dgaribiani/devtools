import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TextWorkerService } from '../../../shared/services/text-worker.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

interface DiffPart {
  added: boolean;
  removed: boolean;
  value: string;
}

@Component({
  selector: 'app-text-diff',
  standalone: false,
  templateUrl: './text-diff.component.html',
  styleUrl: './text-diff.component.css'
})
export class TextDiffComponent implements OnInit, OnDestroy {
  left = '';
  right = '';
  diffHtml?: SafeHtml;
  diffText = '';
  summary = { added: 0, removed: 0 };
  loading = false;
  private readonly runHandler = () => this.run();

  constructor(
    private worker: TextWorkerService,
    private sanitizer: DomSanitizer,
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.left = this.toolState.get('text-diff.left', 'Hello world\nSecond line');
    this.right = this.toolState.get('text-diff.right', 'Hello toolbox\nSecond line\nThird line');
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  async run(): Promise<void> {
    this.loading = true;
    try {
      const parts = await this.worker.request<{ left: string; right: string }, DiffPart[]>('diff-lines', {
        left: this.left,
        right: this.right
      });
      const html = parts.map(part => {
        const escaped = escapeHtml(part.value);
        if (part.added) {
          return `<span class="diff-added">${escaped}</span>`;
        }
        if (part.removed) {
          return `<span class="diff-removed">${escaped}</span>`;
        }
        return `<span class="diff-unchanged">${escaped}</span>`;
      }).join('');
      this.diffHtml = this.sanitizer.bypassSecurityTrustHtml(html);
      this.diffText = parts.map(part => {
        const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
        return part.value
          .split('\n')
          .map(line => (line ? `${prefix}${line}` : ''))
          .join('\n');
      }).join('\n');
      this.summary = {
        added: parts.filter(part => part.added).length,
        removed: parts.filter(part => part.removed).length
      };
      this.toolState.set('text-diff.left', this.left);
      this.toolState.set('text-diff.right', this.right);
      this.toast.success('Text diff complete.');
    } catch (error) {
      this.toast.error('Unable to diff text.');
    } finally {
      this.loading = false;
    }
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

