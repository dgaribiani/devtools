import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/';
const SIMILAR = /[O0Il1]/g;

@Component({
  selector: 'app-password-generator',
  standalone: false,
  templateUrl: './password-generator.component.html',
  styleUrl: './password-generator.component.css'
})
export class PasswordGeneratorComponent implements OnInit, OnDestroy {
  length = 24;
  includeLower = true;
  includeUpper = true;
  includeDigits = true;
  includeSymbols = true;
  excludeSimilar = false;
  output = '';
  entropy = 0;
  error = '';
  private readonly runHandler = () => this.generate();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.length = this.toolState.get('password.length', 24);
    this.includeLower = this.toolState.get('password.lower', true);
    this.includeUpper = this.toolState.get('password.upper', true);
    this.includeDigits = this.toolState.get('password.digits', true);
    this.includeSymbols = this.toolState.get('password.symbols', true);
    this.excludeSimilar = this.toolState.get('password.excludeSimilar', false);
    this.activeTool.register(this.runHandler);
    this.generate();
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  generate(): void {
    this.error = '';
    const length = Math.max(8, Math.min(128, Number(this.length) || 8));
    const charset = this.buildCharset();
    if (!charset) {
      this.error = 'Select at least one character set.';
      this.toast.error(this.error);
      return;
    }
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[bytes[i] % charset.length];
    }
    this.output = result;
    this.entropy = Math.round(length * Math.log2(charset.length));
    this.toolState.set('password.length', length);
    this.toolState.set('password.lower', this.includeLower);
    this.toolState.set('password.upper', this.includeUpper);
    this.toolState.set('password.digits', this.includeDigits);
    this.toolState.set('password.symbols', this.includeSymbols);
    this.toolState.set('password.excludeSimilar', this.excludeSimilar);
    this.toast.success('Password generated.');
  }

  private buildCharset(): string {
    let charset = '';
    if (this.includeLower) {
      charset += LOWER;
    }
    if (this.includeUpper) {
      charset += UPPER;
    }
    if (this.includeDigits) {
      charset += DIGITS;
    }
    if (this.includeSymbols) {
      charset += SYMBOLS;
    }
    if (this.excludeSimilar) {
      charset = charset.replace(SIMILAR, '');
    }
    return charset;
  }
}
