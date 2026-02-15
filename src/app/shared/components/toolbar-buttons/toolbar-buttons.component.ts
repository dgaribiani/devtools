import { Component, Input } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toolbar-buttons',
  standalone: false,
  templateUrl: './toolbar-buttons.component.html',
  styleUrl: './toolbar-buttons.component.css'
})
export class ToolbarButtonsComponent {
  @Input() text = '';
  @Input() filename = 'result.txt';

  constructor(private clipboard: Clipboard, private toast: ToastService) {}

  copy(): void {
    if (!this.text) {
      this.toast.info('Nothing to copy yet.');
      return;
    }
    this.clipboard.copy(this.text);
    this.toast.success('Copied to clipboard.');
  }

  download(): void {
    if (!this.text) {
      this.toast.info('Nothing to download yet.');
      return;
    }
    const blob = new Blob([this.text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = this.filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  }
}

