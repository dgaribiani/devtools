import { Injectable, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface AppSettings {
  rememberInputs: boolean;
  theme: ThemePreference;
}

const STORAGE_KEY = 'devtoolbox.settings';

const defaultSettings: AppSettings = {
  rememberInputs: false,
  theme: 'system'
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly settings = signal<AppSettings>({ ...defaultSettings });

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<AppSettings>;
        this.settings.set({
          rememberInputs: parsed.rememberInputs ?? defaultSettings.rememberInputs,
          theme: parsed.theme ?? defaultSettings.theme
        });
      } catch {
        this.settings.set({ ...defaultSettings });
      }
    }
  }

  update(partial: Partial<AppSettings>): void {
    const next = { ...this.settings(), ...partial };
    this.settings.set(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }

  reset(): void {
    this.settings.set({ ...defaultSettings });
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }
}
