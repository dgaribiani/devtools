import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-result-panel',
  standalone: false,
  templateUrl: './result-panel.component.html',
  styleUrl: './result-panel.component.css'
})
export class ResultPanelComponent {
  @Input() title = 'Result';
  @Input() value = '';
  @Input() language: 'json' | 'yaml' | 'javascript' | 'text' = 'text';
  @Input() filename = 'result.txt';
  @Input() emptyHint = 'Run the tool to see output.';
}

