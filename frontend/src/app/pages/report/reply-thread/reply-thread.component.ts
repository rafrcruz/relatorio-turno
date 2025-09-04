import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { QuillEditorComponent } from 'ngx-quill';
import { Subject, takeUntil } from 'rxjs';
import DOMPurify from 'dompurify';
import { Post } from '../../../core/posts.service';
import { RepliesService, Reply } from '../../../core/replies.service';
import { NotificationService } from '../../../core/notification.service';

interface AttachmentView {
  file: File;
  url?: string;
  error?: string;
}

@Component({
  selector: 'app-reply-thread',
  templateUrl: './reply-thread.component.html',
  styleUrls: ['./reply-thread.component.css']
})
export class ReplyThreadComponent implements OnInit, OnDestroy {
  @Input() post!: Post;
  @ViewChild('editor') editor!: QuillEditorComponent;

  replies: Reply[] = [];
  loading = false;
  error = false;
  page = 1;
  pageSize = 5;
  total = 0;
  showForm = false;
  sending = false;
    attachments: AttachmentView[] = [];
    modalImageUrl?: string;
    content = '';
    modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'blockquote', 'code-block', 'clean']
    ]
  };

  private readonly destroy$ = new Subject<void>();

    constructor(private readonly repliesService: RepliesService, private readonly notify: NotificationService) {}

  ngOnInit(): void {
    this.load();
    this.repliesService.created$
      .pipe(takeUntil(this.destroy$))
      .subscribe((r) => {
        if (r.postId === this.post.id && !this.replies.some((rr) => rr.id === r.id)) {
          this.replies.push(r);
          this.post._count.replies++;
          this.total++;
        }
      });
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.repliesService.list(this.post.id, this.page, this.pageSize).subscribe({
      next: (res) => {
        this.replies = this.replies.concat(res.replies);
        this.total = res.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  loadMore(): void {
    this.page++;
    this.load();
  }

  toggleComposer(): void {
    this.showForm = !this.showForm;
    if (this.showForm) {
      setTimeout(() => this.editor?.quillEditor?.focus());
    }
  }

  openImage(url: string): void {
    this.modalImageUrl = url;
  }

  closeImage(): void {
    this.modalImageUrl = undefined;
  }

  onContentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target instanceof HTMLImageElement) {
      this.openImage(target.src);
    }
  }

  deleteReply(r: Reply): void {
    if (!confirm('Excluir esta resposta?')) return;
      this.repliesService.delete(this.post.id, r.id).subscribe({
        next: () => {
          this.replies = this.replies.filter((rr) => rr.id !== r.id);
          this.post._count.replies--;
          this.total--;
          this.notify.success('Resposta excluída.');
        },
        error: () => this.notify.error('Falha ao excluir resposta.'),
      });
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
      const total = this.attachments.reduce((sum, a) => sum + a.file.size, 0);
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
      const exists = this.attachments.some((a) => a.file.name === file.name && a.file.size === file.size);
      if (exists) {
        this.notify.info(`Arquivo duplicado ignorado: ${file.name}`);
        continue;
      }
      const view: AttachmentView = { file };
      if (file.type.startsWith('image/')) view.url = URL.createObjectURL(file);
      this.attachments.push(view);
    }
  }

  removeAttachment(att: AttachmentView): void {
    this.attachments = this.attachments.filter((a) => a !== att);
  }

  send(): void {
    const html = this.content.trim();
    if (!html && this.attachments.length === 0) {
      this.notify.error('Conteúdo vazio.');
      return;
    }
    const sanitized = DOMPurify.sanitize(html);
    this.sending = true;
    this.repliesService
      .create(this.post.id, { content: sanitized, attachments: this.attachments.map((a) => a.file) })
      .subscribe({
          next: () => {
            this.content = '';
            this.attachments = [];
            this.showForm = false;
            this.sending = false;
            this.notify.success('Resposta enviada.');
          },
          error: () => {
            this.notify.error('Falha ao enviar.');
            this.sending = false;
          }
        });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
