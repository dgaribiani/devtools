import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ToolRegistryService, ToolItem } from '../../services/tool-registry.service';

@Component({
  selector: 'app-command-palette',
  standalone: false,
  templateUrl: './command-palette.component.html',
  styleUrl: './command-palette.component.css'
})
export class CommandPaletteComponent implements OnChanges {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  query = '';

  constructor(private registry: ToolRegistryService, private router: Router) {}

  get tools(): ToolItem[] {
    return this.registry.search(this.query).slice(0, 12);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue) {
      this.query = '';
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('.palette-input');
        input?.focus();
      }, 0);
    }
  }

  select(tool: ToolItem): void {
    this.router.navigateByUrl(tool.route);
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.open) {
      this.close.emit();
    }
  }
}

