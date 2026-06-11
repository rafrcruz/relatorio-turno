import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import DOMPurify from 'dompurify';
import { AppStateService } from '../../../../core/app-state.service';
import { NotificationService } from '../../../../core/notification.service';
import { Attachment } from '../../../../core/posts.service';
import { IndicatorNotesService } from '../../../../core/indicator-notes.service';
import { MergedIndicator } from '../../../../core/indicator-notes.service';

interface NewAttachment {
  file: File;
  url?: string;
}

/**
 * Editor de Apontamento de um indicador (texto rico + anexos), coerente com o
 * composer de posts. Faz upsert por contexto (área/data/turno) e permite
 * remover anexos existentes durante a edição.
 */
@Component({
  selector: 'app-indicator-note-editor',
  templateUrl: './indicator-note-editor.component.html'
})
export class IndicatorNoteEditorComponent implements OnInit {
  @Input() indicator!: MergedIndicator;
  @Input() areaId!: number;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  content = '';
  existing: Attachment[] = [];
  newAttachments: NewAttachment[] = [];
  sending = false;

  modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'blockquote', 'code-block', 'clean']
    ]
  };

  constructor(
    private readonly appState: AppStateService,
    private readonly notes: IndicatorNotesService,
    private readonly notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.content = this.indicator.note?.content || '';
    this.existing = [...(this.indicator.note?.attachments || [])];
  }

  get title(): string {
    return this.indicator.note?.hasApontamento ? 'Editar apontamento' : 'Adicionar apontamento';
  }

  get pendingRequired(): boolean {
    return this.indicator.focusWithoutNote;
  }

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.addFiles(Array.from(input.files));
  }

  onDrop(evt: DragEvent): void {
    evt.preventDefault();
    if (evt.dataTransfer) this.addFiles(Array.from(evt.dataTransfer.files));
  }

  onPaste(evt: ClipboardEvent): void {
    const items = evt.clipboardData?.files;
    if (items?.length) this.addFiles(Array.from(items));
  }

  private addFiles(files: File[]): void {
    for (const file of files) {
      const total = this.newAttachments.reduce((sum, a) => sum + a.file.size, 0);
      if (file.size > 20 * 1024 * 1024) {
        this.notify.error(`Arquivo muito grande: ${file.name}`);
        continue;
      }
      if (total + file.size > 50 * 1024 * 1024) {
        this.notify.error('Limite total de anexos excedido');
        break;
      }
      if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)) {
        this.notify.error(`Tipo de arquivo não suportado: ${file.name}`);
        continue;
      }
      const view: NewAttachment = { file };
      if (file.type.startsWith('image/')) view.url = URL.createObjectURL(file);
      this.newAttachments.push(view);
    }
  }

  removeNew(att: NewAttachment): void {
    this.newAttachments = this.newAttachments.filter((a) => a !== att);
  }

  removeExisting(att: Attachment): void {
    this.notes.deleteAttachment(att.id).subscribe({
      next: () => {
        this.existing = this.existing.filter((a) => a.id !== att.id);
        this.notify.success('Anexo removido.');
        this.saved.emit();
      },
      error: () => this.notify.error('Falha ao remover anexo.')
    });
  }

  save(): void {
    const ctx = this.appState.context;
    if (!this.areaId) {
      this.notify.error('Área inválida.');
      return;
    }
    const sanitized = DOMPurify.sanitize(this.content || '');
    if (this.pendingRequired && !DOMPurify.sanitize(this.content || '', { ALLOWED_TAGS: [] }).trim() && this.newAttachments.length === 0 && this.existing.length === 0) {
      this.notify.error('Informe um apontamento para indicador em Foco.');
      return;
    }
    this.sending = true;
    this.notes
      .upsert({
        areaId: this.areaId,
        indicatorCode: this.indicator.code,
        date: ctx.date,
        shift: ctx.shift,
        content: sanitized,
        includedInHandover: this.indicator.note?.includedInHandover,
        attachments: this.newAttachments.map((a) => a.file)
      })
      .subscribe({
        next: () => {
          this.notify.success('Apontamento salvo.');
          this.newAttachments = [];
          this.sending = false;
          this.saved.emit();
          this.closed.emit();
        },
        error: () => {
          this.notify.error('Falha ao salvar apontamento.');
          this.sending = false;
        }
      });
  }

  cancel(): void {
    this.closed.emit();
  }
}
