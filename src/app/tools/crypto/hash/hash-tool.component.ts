import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-hash-tool',
  standalone: false,
  templateUrl: './hash-tool.component.html',
  styleUrl: './hash-tool.component.css'
})
export class HashToolComponent implements OnInit, OnDestroy {
  input = '';
  algorithm = 'SHA-256';
  output = '';
  error = '';
  private readonly runHandler = () => this.run();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.input = this.toolState.get('hash.input', 'Hash me');
    this.algorithm = this.toolState.get('hash.algorithm', 'SHA-256');
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  async run(): Promise<void> {
    this.error = '';
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(this.input);
      const digest = await crypto.subtle.digest(this.algorithm, data);
      const hashArray = Array.from(new Uint8Array(digest));
      this.output = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      this.toolState.set('hash.input', this.input);
      this.toolState.set('hash.algorithm', this.algorithm);
      this.toast.success('Hash generated.');
    } catch (error) {
      this.error = 'Unable to hash input with selected algorithm.';
      this.toast.error(this.error);
    }
  }
}

