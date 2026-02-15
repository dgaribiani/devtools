import { Component, OnDestroy, OnInit } from '@angular/core';
import { normalizeWhitespace, WhitespaceOptions } from '../utils/whitespace';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-whitespace-normalizer',
  standalone: false,
  templateUrl: './whitespace-normalizer.component.html',
  styleUrl: './whitespace-normalizer.component.css'
})
export class WhitespaceNormalizerComponent implements OnInit, OnDestroy {
  input = '';
  output = '';
  options: WhitespaceOptions = {
    lineEnding: 'preserve',
    trimTrailing: true,
    trimLeading: false,
    trimLines: false,
    tabsToSpaces: false,
    tabSize: 2
  };
  error = '';
  private readonly runHandler = () => this.normalize();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.input = this.toolState.get('whitespace.input', 'Line one\t\nLine two   \n');
    this.options = this.toolState.get('whitespace.options', this.options);
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  normalize(): void {
    this.error = '';
    try {
      this.output = normalizeWhitespace(this.input, this.options);
      this.toolState.set('whitespace.input', this.input);
      this.toolState.set('whitespace.options', this.options);
      this.toast.success('Whitespace normalized.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to normalize.';
      this.toast.error('Unable to normalize.');
    }
  }
}
