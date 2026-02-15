import { Component, HostListener, computed, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { SharedModule } from './shared/shared.module';
import { ToolRegistryService } from './shared/services/tool-registry.service';
import { ThemeService } from './shared/services/theme.service';
import { SettingsService } from './shared/services/settings.service';
import { ToolStateService } from './shared/services/tool-state.service';
import { ActiveToolService } from './shared/services/active-tool.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SharedModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('320ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class App {
  readonly paletteOpen = signal(false);
  readonly sidebarOpen = signal(typeof window !== 'undefined' ? window.innerWidth >= 960 : true);
  readonly sidebarQuery = signal('');

  readonly filteredCategories = computed(() => {
    const query = this.sidebarQuery().trim().toLowerCase();
    if (!query) {
      return this.registry.categories;
    }
    return this.registry.categories
      .map(category => ({
        ...category,
        tools: category.tools.filter(tool =>
          [tool.label, tool.description, tool.keywords.join(' ')].join(' ').toLowerCase().includes(query)
        )
      }))
      .filter(category => category.tools.length > 0);
  });

  constructor(
    public registry: ToolRegistryService,
    public theme: ThemeService,
    public settings: SettingsService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  openPalette(): void {
    this.paletteOpen.set(true);
  }

  closePalette(): void {
    this.paletteOpen.set(false);
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  toggleSidebar(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  toggleRemember(value: boolean): void {
    this.settings.update({ rememberInputs: value });
    if (!value) {
      this.toolState.clearStored();
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleShortcut(event: KeyboardEvent): void {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac');
    const metaKey = isMac ? event.metaKey : event.ctrlKey;

    if (metaKey && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openPalette();
    }

    if (metaKey && event.key === 'Enter') {
      event.preventDefault();
      this.activeTool.runActive();
    }
  }
}
