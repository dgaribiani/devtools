import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'info', timeoutMs = 3200): void {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    this.toasts.update(list => [...list, { id, type, message }]);
    if (timeoutMs > 0) {
      setTimeout(() => this.dismiss(id), timeoutMs);
    }
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error', 5200);
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(id: string): void {
    this.toasts.update(list => list.filter(item => item.id !== id));
  }
}
