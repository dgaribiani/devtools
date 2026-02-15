import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from '../../../shared/services/toast.service';
import { ToolStateService } from '../../../shared/services/tool-state.service';
import { ActiveToolService } from '../../../shared/services/active-tool.service';

const ULID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

type SortableIdType = 'uuidv7' | 'ulid';

@Component({
  selector: 'app-sortable-ids',
  standalone: false,
  templateUrl: './sortable-ids.component.html',
  styleUrl: './sortable-ids.component.css'
})
export class SortableIdsComponent implements OnInit, OnDestroy {
  kind: SortableIdType = 'uuidv7';
  count = 5;
  output = '';
  error = '';
  private readonly runHandler = () => this.generate();

  constructor(
    private toast: ToastService,
    private toolState: ToolStateService,
    private activeTool: ActiveToolService
  ) {}

  ngOnInit(): void {
    this.kind = this.toolState.get('sortable-ids.kind', 'uuidv7');
    this.count = this.toolState.get('sortable-ids.count', 5);
    this.activeTool.register(this.runHandler);
  }

  ngOnDestroy(): void {
    this.activeTool.clear(this.runHandler);
  }

  generate(): void {
    this.error = '';
    try {
      const total = Math.max(1, Math.min(50, Number(this.count) || 1));
      const ids = Array.from({ length: total }, () => this.kind === 'ulid' ? createUlid() : createUuidV7());
      this.output = ids.join('\n');
      this.toolState.set('sortable-ids.kind', this.kind);
      this.toolState.set('sortable-ids.count', total);
      this.toast.success('Identifiers generated.');
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to generate identifiers.';
      this.toast.error('Unable to generate identifiers.');
    }
  }
}

function createUuidV7(): string {
  const bytes = new Uint8Array(16);
  const now = Date.now();
  bytes[0] = (now >>> 40) & 0xff;
  bytes[1] = (now >>> 32) & 0xff;
  bytes[2] = (now >>> 24) & 0xff;
  bytes[3] = (now >>> 16) & 0xff;
  bytes[4] = (now >>> 8) & 0xff;
  bytes[5] = now & 0xff;

  const random = crypto.getRandomValues(new Uint8Array(10));
  bytes[6] = (random[0] & 0x0f) | 0x70;
  bytes[7] = random[1];
  bytes[8] = (random[2] & 0x3f) | 0x80;
  bytes[9] = random[3];
  bytes[10] = random[4];
  bytes[11] = random[5];
  bytes[12] = random[6];
  bytes[13] = random[7];
  bytes[14] = random[8];
  bytes[15] = random[9];

  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function createUlid(): string {
  const time = encodeUlidTime(Date.now());
  const randomness = encodeUlidRandomness();
  return `${time}${randomness}`;
}

function encodeUlidTime(ms: number): string {
  let value = BigInt(ms);
  let output = '';
  for (let i = 0; i < 10; i++) {
    const mod = Number(value % 32n);
    output = ULID_ALPHABET[mod] + output;
    value = value / 32n;
  }
  return output;
}

function encodeUlidRandomness(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(10));
  let value = 0n;
  for (const byte of randomBytes) {
    value = (value << 8n) | BigInt(byte);
  }
  let output = '';
  for (let i = 0; i < 16; i++) {
    const mod = Number(value % 32n);
    output = ULID_ALPHABET[mod] + output;
    value = value / 32n;
  }
  return output;
}
