import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  effect
} from '@angular/core';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from '@codemirror/basic-setup';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-editor',
  standalone: false,
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('editorHost', { static: true }) editorHost!: ElementRef<HTMLDivElement>;

  @Input() value = '';
  @Input() language: 'json' | 'yaml' | 'javascript' | 'text' = 'text';
  @Input() readonly = false;
  @Input() height = '260px';
  @Input() highlightPosition: number | null = null;

  @Output() valueChange = new EventEmitter<string>();

  @HostBinding('style.height') get hostHeight(): string {
    return this.height;
  }

  private view?: EditorView;
  private languageCompartment = new Compartment();
  private themeCompartment = new Compartment();
  private editableCompartment = new Compartment();

  constructor(private theme: ThemeService) {
    effect(() => {
      if (!this.view) {
        return;
      }
      const dark = this.theme.mode() === 'dark';
      this.view.dispatch({
        effects: this.themeCompartment.reconfigure(dark ? oneDark : [])
      });
    });
  }

  ngAfterViewInit(): void {
    const state = EditorState.create({
      doc: this.value ?? '',
      extensions: [
        basicSetup,
        this.languageCompartment.of(this.resolveLanguage()),
        this.themeCompartment.of(this.theme.mode() === 'dark' ? oneDark : []),
        this.editableCompartment.of(EditorView.editable.of(!this.readonly)),
        EditorView.lineWrapping,
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            const next = update.state.doc.toString();
            this.value = next;
            this.valueChange.emit(next);
          }
        })
      ]
    });

    this.view = new EditorView({
      state,
      parent: this.editorHost.nativeElement
    });

    if (this.highlightPosition !== null) {
      this.moveCursor(this.highlightPosition);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.view) {
      return;
    }

    if (changes['language'] && !changes['language'].firstChange) {
      this.view.dispatch({
        effects: this.languageCompartment.reconfigure(this.resolveLanguage())
      });
    }

    if (changes['readonly'] && !changes['readonly'].firstChange) {
      this.view.dispatch({
        effects: this.editableCompartment.reconfigure(EditorView.editable.of(!this.readonly))
      });
    }

    if (changes['value'] && changes['value'].currentValue !== this.view.state.doc.toString()) {
      const next = changes['value'].currentValue ?? '';
      this.view.dispatch({
        changes: { from: 0, to: this.view.state.doc.length, insert: next }
      });
    }

    if (changes['highlightPosition'] && this.highlightPosition !== null) {
      this.moveCursor(this.highlightPosition);
    }
  }

  ngOnDestroy(): void {
    this.view?.destroy();
  }

  onPlainInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    const next = target.value ?? '';
    this.value = next;
    this.valueChange.emit(next);
  }

  private resolveLanguage() {
    switch (this.language) {
      case 'json':
        return json();
      case 'yaml':
        return yaml();
      case 'javascript':
        return javascript();
      default:
        return [];
    }
  }

  private moveCursor(position: number): void {
    if (!this.view) {
      return;
    }
    const safe = Math.max(0, Math.min(position, this.view.state.doc.length));
    this.view.dispatch({
      selection: { anchor: safe },
      scrollIntoView: true
    });
  }
}

