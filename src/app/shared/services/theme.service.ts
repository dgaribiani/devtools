import { Injectable, signal } from '@angular/core';
import { SettingsService, ThemePreference } from './settings.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<'light' | 'dark'>('light');

  private systemMedia = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

  constructor(private settings: SettingsService) {
    this.applyPreference(this.settings.settings().theme);

    this.systemMedia?.addEventListener('change', () => {
      if (this.settings.settings().theme === 'system') {
        this.applyPreference('system');
      }
    });
  }

  toggle(): void {
    const current = this.mode();
    const next: ThemePreference = current === 'dark' ? 'light' : 'dark';
    this.setPreference(next);
  }

  setPreference(pref: ThemePreference): void {
    this.settings.update({ theme: pref });
    this.applyPreference(pref);
  }

  private applyPreference(pref: ThemePreference): void {
    let resolved: 'light' | 'dark' = 'light';
    if (pref === 'system') {
      resolved = this.systemMedia?.matches ? 'dark' : 'light';
    } else {
      resolved = pref;
    }
    this.mode.set(resolved);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('theme-dark', resolved === 'dark');
    }
  }
}
