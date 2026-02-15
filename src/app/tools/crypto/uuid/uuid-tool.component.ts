import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

@Component({
  selector: 'app-uuid-tool',
  standalone: false,
  templateUrl: './uuid-tool.component.html',
  styleUrl: './uuid-tool.component.css'
})
export class UuidToolComponent implements OnInit, OnDestroy {
  count = 1;
  output = '';
  private readonly runHandler = () => this.generate();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.count = this.toolState.get('uuid.count', 1);
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  generate(): void {
    const total = Math.max(1, Math.min(10, Number(this.count) || 1));
    const uuids = Array.from({ length: total }, () => createUuid());
    this.output = uuids.join('\n');
    this.toolState.set('uuid.count', total);
    this.toast.success('UUIDs generated.');
  }
}

function createUuid(): string {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

