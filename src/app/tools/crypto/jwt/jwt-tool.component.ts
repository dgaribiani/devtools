import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-jwt-tool',
  standalone: false,
  templateUrl: './jwt-tool.component.html',
  styleUrl: './jwt-tool.component.css'
})
export class JwtToolComponent implements OnInit, OnDestroy {
  token = '';
  header = '';
  payload = '';
  error = '';
  private readonly runHandler = () => this.decode();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.token = this.toolState.get('jwt.token', '');
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  decode(): void {
    this.error = '';
    try {
      const [header, payload] = this.token.split('.');
      if (!header || !payload) {
        throw new Error('JWT must have header and payload sections.');
      }
      this.header = JSON.stringify(JSON.parse(base64UrlDecode(header)), null, 2);
      this.payload = JSON.stringify(JSON.parse(base64UrlDecode(payload)), null, 2);
      this.toolState.set('jwt.token', this.token);
      this.toast.success('JWT decoded.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Invalid JWT token.';
      this.toast.error('Invalid JWT.');
    }
  }
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

