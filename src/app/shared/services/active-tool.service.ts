import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ActiveToolService {
  private runner: (() => void) | null = null;

  register(run: () => void): void {
    this.runner = run;
  }

  clear(run?: () => void): void {
    if (!run || this.runner === run) {
      this.runner = null;
    }
  }

  runActive(): void {
    this.runner?.();
  }
}
