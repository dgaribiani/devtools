import { Component, OnDestroy, OnInit } from '@angular/core';
import JSON5 from 'json5';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-json5-converter',
  standalone: false,
  templateUrl: './json5-converter.component.html',
  styleUrl: './json5-converter.component.css'
})
export class Json5ConverterComponent implements OnInit, OnDestroy {
  input = '';
  output = '';
  indent = 2;
  error = '';
  private readonly runHandler = () => this.convert();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.input = this.toolState.get('json5.input', '{\n  // JSON5 example\n  name: "Dev Toolbox",\n  trailing: true,\n}');
    this.indent = this.toolState.get('json5.indent', 2);
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  convert(): void {
    this.error = '';
    this.output = '';
    try {
      const parsed = parseJson5(this.input);
      this.output = JSON.stringify(parsed, null, this.indent);
      this.toolState.set('json5.input', this.input);
      this.toolState.set('json5.indent', this.indent);
      this.toast.success('Converted to JSON.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Invalid JSON5 input.';
      this.toast.error('Invalid JSON5 input.');
    }
  }
}

function parseJson5(input: string): unknown {
  const json5 = JSON5 as unknown as { parse?: (text: string) => unknown } | ((text: string) => unknown);
  if (typeof json5 === 'function') {
    return json5(input);
  }
  if (json5.parse) {
    return json5.parse(input);
  }
  throw new Error('JSON5 parser not available.');
}
