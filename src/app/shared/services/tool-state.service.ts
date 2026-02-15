import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

const STATE_PREFIX = 'devtoolbox.tool.';

@Injectable({ providedIn: 'root' })
export class ToolStateService {
  private memory = new Map<string, unknown>();

  constructor(private settings: SettingsService) {}

  get<T>(key: string, fallback: T): T {
    if (!this.settings.settings().rememberInputs) {
      return (this.memory.get(key) as T) ?? fallback;
    }
    if (typeof window === 'undefined') {
      return fallback;
    }
    const stored = window.localStorage.getItem(`${STATE_PREFIX}${key}`);
    if (!stored) {
      return fallback;
    }
    try {
      return JSON.parse(stored) as T;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.settings.settings().rememberInputs) {
      this.memory.set(key, value);
      return;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`${STATE_PREFIX}${key}`, JSON.stringify(value));
    }
  }

  clearStored(): void {
    if (typeof window === 'undefined') {
      return;
    }
    Object.keys(window.localStorage)
      .filter(key => key.startsWith(STATE_PREFIX))
      .forEach(key => window.localStorage.removeItem(key));
    this.memory.clear();
  }
}
