import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-base64-tool',
  standalone: false,
  templateUrl: './base64-tool.component.html',
  styleUrl: './base64-tool.component.css'
})
export class Base64ToolComponent implements OnInit, OnDestroy {
  input = '';
  output = '';
  fileOutput = '';
  error = '';
  private readonly runHandler = () => this.encode();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.input = this.toolState.get('base64.input', 'Hello Base64');
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  encode(): void {
    this.error = '';
    try {
      this.output = encodeBase64(this.input);
      this.toolState.set('base64.input', this.input);
      this.toast.success('Encoded to Base64.');
    } catch (error) {
      this.error = 'Unable to encode.';
      this.toast.error(this.error);
    }
  }

  decode(): void {
    this.error = '';
    try {
      this.output = decodeBase64(this.input);
      this.toolState.set('base64.input', this.input);
      this.toast.success('Decoded Base64.');
    } catch (error) {
      this.error = 'Invalid Base64 input.';
      this.toast.error(this.error);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.fileOutput = result;
      this.toast.success('File converted to Base64.');
    };
    reader.readAsDataURL(file);
  }
}

function encodeBase64(input: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64(input: string): string {
  const binary = atob(input);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

