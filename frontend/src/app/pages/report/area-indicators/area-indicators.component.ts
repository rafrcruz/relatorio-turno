import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AppStateService } from '../../../core/app-state.service';
import { IndicatorNotesService, MergedIndicator } from '../../../core/indicator-notes.service';
import { IndicatorStatus } from '../../../core/indicators.service';

/**
 * Resumo de passagem na visão principal: exibe apenas indicadores em Atenção,
 * em Foco ou marcados manualmente para a passagem. Não lista todos os indicadores.
 */
@Component({
  selector: 'app-area-indicators',
  templateUrl: './area-indicators.component.html',
  styleUrls: ['./area-indicators.component.css']
})
export class AreaIndicatorsComponent implements OnInit, OnDestroy {
  @Output() openAll = new EventEmitter<void>();

  handover: MergedIndicator[] = [];
  loading = true;
  expandedCode: string | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly appState: AppStateService,
    private readonly notes: IndicatorNotesService
  ) {}

  ngOnInit(): void {
    combineLatest([this.appState.context$, this.notes.changed$.pipe(startWith(undefined))])
      .pipe(
        tap(() => (this.loading = true)),
        switchMap(([ctx]) => this.notes.observeMerged(ctx.area, ctx.date, ctx.shift)),
        takeUntil(this.destroy$)
      )
      .subscribe((list) => {
        this.handover = list.filter((i) => i.inHandover);
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleContent(i: MergedIndicator): void {
    if (!i.note?.hasApontamento) return;
    this.expandedCode = this.expandedCode === i.code ? null : i.code;
  }

  statusLabel(status: IndicatorStatus): string {
    switch (status) {
      case 'na_meta':
        return 'Na meta';
      case 'atencao':
        return 'Atenção';
      case 'foco':
        return 'Foco';
      default:
        return 'Sem valor';
    }
  }

  noteLabel(i: MergedIndicator): string {
    if (i.focusWithoutNote) return 'Foco sem apontamento';
    if (i.note?.hasApontamento) return 'Com apontamento';
    return 'Sem apontamento';
  }

  handoverReason(i: MergedIndicator): string {
    if (i.status === 'atencao' || i.status === 'foco') return 'Automático por status';
    return 'Incluído manualmente';
  }

  trackByCode(_: number, i: MergedIndicator): string {
    return i.code;
  }
}
