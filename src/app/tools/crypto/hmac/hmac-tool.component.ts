import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-hmac-tool',
  standalone: false,
  templateUrl: './hmac-tool.component.html',
  styleUrl: './hmac-tool.component.css'
})
export class HmacToolComponent implements OnInit, OnDestroy {
  message = '';
  secret = '';
  algorithm: 'SHA-256' | 'SHA-512' = 'SHA-256';
  outputFormat: 'hex' | 'base64' = 'hex';
  output = '';
  error = '';
  private readonly runHandler = () => this.generate();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.message = this.toolState.get('hmac.message', 'Hello from Dev Toolbox');
    this.secret = this.toolState.get('hmac.secret', 'super-secret');
    this.algorithm = this.toolState.get('hmac.algorithm', 'SHA-256');
    this.outputFormat = this.toolState.get('hmac.format', 'hex');
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  async generate(): Promise<void> {
    this.error = '';
    this.output = '';
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(this.secret);
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: { name: this.algorithm } },
        false,
        ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(this.message));
      const bytes = new Uint8Array(signature);
      this.output = this.outputFormat === 'hex' ? toHex(bytes) : toBase64(bytes);
      this.toolState.set('hmac.message', this.message);
      this.toolState.set('hmac.secret', this.secret);
      this.toolState.set('hmac.algorithm', this.algorithm);
      this.toolState.set('hmac.format', this.outputFormat);
      this.toast.success('HMAC generated.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to generate HMAC.';
      this.toast.error('Unable to generate HMAC.');
    }
  }
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}
