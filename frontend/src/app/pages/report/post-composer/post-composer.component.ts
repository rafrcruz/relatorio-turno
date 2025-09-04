import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AppStateService, ReportContext } from '../../../core/app-state.service';
import { AreasService, Area } from '../../../core/areas.service';
import { PostsService, PostType } from '../../../core/posts.service';
import DOMPurify from 'dompurify';

interface AttachmentView {
  file: File;
  url?: string;
  error?: string;
}

@Component({
  selector: 'app-post-composer',
  templateUrl: './post-composer.component.html',
  styleUrls: ['./post-composer.component.css']
})
export class PostComposerComponent implements OnInit {
  @ViewChild('editor') editor!: ElementRef<HTMLDivElement>;

  ctx!: ReportContext;
  areas: Area[] = [];
  type: PostType = 'ANNOTATION';
  attachments: AttachmentView[] = [];
  message = '';
  sending = false;

  private readonly draftKey = 'post-draft';

  constructor(
    private appState: AppStateService,
    private readonly areasService: AreasService,
    private posts: PostsService
  ) {}

  ngOnInit(): void {
    this.appState.context$.subscribe((c) => (this.ctx = c));
    this.areasService.getAreasWithIds().subscribe((areas) => (this.areas = areas));
    this.restoreDraft();
  }

  format(cmd: string): void {
    document.execCommand(cmd, false);
  }

  formatLink(): void {
    const url = prompt('URL');
    if (url) document.execCommand('createLink', false, url);
  }

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
    }
  }

  onDrop(evt: DragEvent): void {
    evt.preventDefault();
    if (evt.dataTransfer) {
      this.addFiles(Array.from(evt.dataTransfer.files));
    }
  }

  onPaste(evt: ClipboardEvent): void {
    const items = evt.clipboardData?.files;
    if (items && items.length) {
      this.addFiles(Array.from(items));
    }
  }

  private addFiles(files: File[]): void {
    for (const file of files) {
      const total = this.attachments.reduce((sum, a) => sum + a.file.size, 0);
      if (file.size > 20 * 1024 * 1024) {
        this.message = `Arquivo muito grande: ${file.name}`;
        continue;
      }
      if (total + file.size > 50 * 1024 * 1024) {
        this.message = 'Limite total de anexos excedido';
        break;
      }
      if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)) {
        this.message = `Tipo de arquivo não suportado: ${file.name}`;
        continue;
      }
      const exists = this.attachments.some(
        (a) => a.file.name === file.name && a.file.size === file.size
      );
      if (exists) {
        this.message = `Arquivo duplicado ignorado: ${file.name}`;
        continue;
      }
      const view: AttachmentView = { file };
      if (file.type.startsWith('image/')) {
        view.url = URL.createObjectURL(file);
      }
      this.attachments.push(view);
    }
  }

  removeAttachment(att: AttachmentView): void {
    this.attachments = this.attachments.filter((a) => a !== att);
  }

  async publish(): Promise<void> {
    if (!this.ctx.area || !this.ctx.date || !this.ctx.shift) {
      this.message = 'Defina área, data e turno para publicar.';
      return;
    }
    const area = this.areas.find((a) => a.name === this.ctx.area);
    if (!area) {
      this.message = 'Área inválida.';
      return;
    }
    const html = this.editor.nativeElement.innerHTML.trim();
    if (!html) {
      this.message = 'Conteúdo vazio.';
      return;
    }
    const sanitized = DOMPurify.sanitize(html);
    this.sending = true;
    this.message = '';
    this.saveDraft();
    this.posts
      .create({
        areaId: area.id,
        date: this.ctx.date,
        shift: this.ctx.shift,
        type: this.type,
        content: sanitized,
        attachments: this.attachments.map((a) => a.file),
      })
      .subscribe({
        next: () => {
          this.message = 'Publicação criada.';
          this.editor.nativeElement.innerHTML = '';
          this.type = 'ANNOTATION';
          this.attachments = [];
          this.clearDraft();
          this.sending = false;
        },
        error: () => {
          this.message = 'Falha ao publicar.';
          this.sending = false;
        },
      });
  }

  saveDraft(): void {
    const html = this.editor?.nativeElement?.innerHTML || '';
    const draft = { type: this.type, content: html };
    localStorage.setItem(this.draftKey, JSON.stringify(draft));
  }

  restoreDraft(): void {
    const raw = localStorage.getItem(this.draftKey);
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        this.type = draft.type || 'ANNOTATION';
        setTimeout(() => {
          if (this.editor) this.editor.nativeElement.innerHTML = draft.content || '';
        });
      } catch {
        /* ignore */
      }
    }
  }

  clearDraft(): void {
    localStorage.removeItem(this.draftKey);
  }
}
