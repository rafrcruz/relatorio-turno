import { Component, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { AppStateService, ReportContext } from '../../../core/app-state.service';
import { PostsService, PostType, Post } from '../../../core/posts.service';
import { AreasService } from '../../../core/areas.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnDestroy, OnChanges {
  @Input() type!: PostType;
  @Input() title!: string;
  @Input() highlightId?: number;

  posts: Post[] = [];
  count = 0;
  loading = true;
  error = false;
  private page = 1;
  private ctx!: ReportContext;
  private areaMap = new Map<string, number>();
  private destroy$ = new Subject<void>();

  constructor(
    private readonly appState: AppStateService,
    private readonly postsService: PostsService,
    private readonly areas: AreasService,
  ) {
    this.areas.getAreasWithIds().pipe(takeUntil(this.destroy$)).subscribe((areas) => {
      for (const a of areas) this.areaMap.set(a.name, a.id);
      if (this.ctx) this.reset();
    });

    this.appState.context$.pipe(takeUntil(this.destroy$)).subscribe((c) => {
      this.ctx = c;
      this.reset();
    });

    this.postsService.created$.pipe(takeUntil(this.destroy$)).subscribe((post: Post) => {
      const areaName = [...this.areaMap.entries()].find(([, id]) => id === post.areaId)?.[0];
      const dateIso = post.date.substring(0,10);
      if (post.type === this.type && areaName === this.ctx.area && dateIso === this.ctx.date && post.shift === this.ctx.shift) {
        this.reset();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['highlightId']) {
      this.scrollToHighlight();
    }
  }

  private reset(): void {
    this.page = 1;
    this.posts = [];
    this.loadCount();
    this.loadPage();
  }

  private loadCount(): void {
    const areaId = this.areaMap.get(this.ctx.area) || 0;
    this.postsService.summary(areaId, this.ctx.date, this.ctx.shift).subscribe({
      next: (list) => {
        const entry = list.find((e) => e.type === this.type);
        this.count = entry? entry._count._all : 0;
      },
      error: () => {}
    });
  }

  private loadPage(): void {
    const areaId = this.areaMap.get(this.ctx.area) || 0;
    this.loading = true;
    this.error = false;
    this.postsService.list(areaId, this.ctx.date, this.ctx.shift, this.type, this.page).subscribe({
      next: (posts) => {
        this.posts = this.posts.concat(posts);
        this.loading = false;
        this.scrollToHighlight();
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  loadMore(): void {
    this.page++;
    this.loadPage();
  }

  retry(): void {
    this.reset();
  }

  copyLink(post: Post): void {
    const url = `${window.location.pathname}?area=${encodeURIComponent(this.ctx.area)}&date=${this.ctx.date}&shift=${this.ctx.shift}#post-${post.id}`;
    navigator.clipboard.writeText(url);
  }

  trackById(_: number, item: Post): number {
    return item.id;
  }

  typeLabel(): string {
    switch (this.type) {
      case 'URGENCY':
        return 'Urgência';
      case 'PENDENCY':
        return 'Pendência';
      default:
        return 'Anotação';
    }
  }

  tagClass(): string {
    switch (this.type) {
      case 'URGENCY':
        return 'bg-bauxite text-white';
      case 'PENDENCY':
        return 'bg-warm text-black';
      default:
        return 'bg-hydro-blue text-white';
    }
  }

  private scrollToHighlight(): void {
    if (!this.highlightId) return;
    setTimeout(() => {
      const el = document.getElementById(`post-${this.highlightId}`);
      if (el) {
        el.scrollIntoView();
        el.classList.add('ring', 'ring-hydro-light-blue');
        setTimeout(() => el.classList.remove('ring', 'ring-hydro-light-blue'), 2000);
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
