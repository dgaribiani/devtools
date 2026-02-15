import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-url-tool',
  standalone: false,
  templateUrl: './url-tool.component.html',
  styleUrl: './url-tool.component.css'
})
export class UrlToolComponent implements OnInit, OnDestroy {
  input = '';
  output = '';
  error = '';
  private readonly runHandler = () => this.encode();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.input = this.toolState.get('url.input', 'https://example.com/?q=hello world');
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  encode(): void {
    this.error = '';
    try {
      this.output = encodeURIComponent(this.input);
      this.toolState.set('url.input', this.input);
      this.toast.success('URL encoded.');
    } catch {
      this.error = 'Unable to encode URL.';
      this.toast.error(this.error);
    }
  }

  decode(): void {
    this.error = '';
    try {
      this.output = decodeURIComponent(this.input);
      this.toolState.set('url.input', this.input);
      this.toast.success('URL decoded.');
    } catch {
      this.error = 'Unable to decode URL.';
      this.toast.error(this.error);
    }
  }
}

