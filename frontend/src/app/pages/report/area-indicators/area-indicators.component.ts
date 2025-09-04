import { Component, OnDestroy } from '@angular/core';
import { AppStateService, ReportContext } from '../../../core/app-state.service';
import { IndicatorsService, IndicatorData } from '../../../core/indicators.service';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-area-indicators',
  templateUrl: './area-indicators.component.html',
  styleUrls: ['./area-indicators.component.css']
})
export class AreaIndicatorsComponent implements OnDestroy {
  indicators$: Observable<IndicatorData[]>;
  loading = true;
  error = false;
  source = '';

  private destroy$ = new Subject<void>();

  constructor(private appState: AppStateService, private indicators: IndicatorsService) {
    this.indicators$ = this.appState.context$.pipe(
      tap(() => { this.loading = true; this.error = false; }),
      switchMap((ctx: ReportContext) => this.indicators.getIndicators(ctx.area, ctx.date, ctx.shift)),
      tap((list) => {
        this.loading = false;
        this.source = list[0]?.source || '';
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  retry(): void {
    this.appState.setArea(this.appState.context.area);
  }

  statusLabel(ind: IndicatorData): string {
    switch (ind.status) {
      case 'good':
        return 'Dentro da meta';
      case 'warning':
        return 'Atenção';
      case 'critical':
        return 'Crítico';
      default:
        return '';
    }
  }
}
