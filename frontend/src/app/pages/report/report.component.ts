import { Component } from '@angular/core';
import { AppStateService, ReportContext } from '../../core/app-state.service';
import { Observable } from 'rxjs';
import { PostsService, PostType } from '../../core/posts.service';
import { AreasService, Area } from '../../core/areas.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent {
  readonly context$: Observable<ReportContext> = this.appState.context$;

  highlightId?: number;
  highlightType?: PostType;
  otherContext?: ReportContext;
  private areas: Area[] = [];

  constructor(private appState: AppStateService, private posts: PostsService, private areasService: AreasService) {
    this.areasService.getAreasWithIds().subscribe((areas) => {
      this.areas = areas;
      this.checkDeepLink();
    });
  }

  private checkDeepLink(): void {
    const match = window.location.hash.match(/post-(\d+)/);
    if (!match) return;
    const id = Number(match[1]);
    this.posts.get(id).subscribe({
      next: (post) => {
        const areaName = this.areas.find((a) => a.id === post.areaId)?.name || '';
        const dateIso = post.date.substring(0, 10);
        const ctx = this.appState.context;
        this.highlightId = id;
        this.highlightType = post.type;
        if (ctx.area !== areaName || ctx.date !== dateIso || ctx.shift !== post.shift) {
          this.otherContext = { area: areaName, date: dateIso, shift: post.shift };
        }
      },
      error: () => {}
    });
  }

  changeContext(): void {
    if (this.otherContext) {
      this.appState.setArea(this.otherContext.area);
      this.appState.setDate(this.otherContext.date);
      this.appState.setShift(this.otherContext.shift);
      this.otherContext = undefined;
    }
  }
}
