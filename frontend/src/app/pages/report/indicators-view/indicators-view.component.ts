import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription, combineLatest } from 'rxjs';
import { startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AppStateService } from '../../../core/app-state.service';
import { NotificationService } from '../../../core/notification.service';
import { IndicatorNotesService, MergedIndicator } from '../../../core/indicator-notes.service';
import { IndicatorsService, IndicatorStatus, ReferenceBand } from '../../../core/indicators.service';

type IndicatorFilter = 'todos' | 'na_meta' | 'atencao' | 'foco' | 'pendencia' | 'passagem';

/**
 * Visão dedicada de indicadores: lista todos os indicadores do contexto com
 * status, referência, contadores, filtros e busca. Permite registrar apontamento
 * e marcar indicadores para a passagem de turno.
 */
@Component({
  selector: 'app-indicators-view',
  templateUrl: './indicators-view.component.html',
  styleUrls: ['./indicators-view.component.css']
})
export class IndicatorsViewComponent implements OnInit, OnDestroy {
  all: MergedIndicator[] = [];
  loading = true;
  areaId?: number;

  activeFilter: IndicatorFilter = 'todos';
  searchTerm = '';
  expandedCode: string | null = null;

  private readonly destroy$ = new Subject<void>();
  private areaSub?: Subscription;

  constructor(
    private readonly appState: AppStateService,
    private readonly notes: IndicatorNotesService,
    private readonly indicators: IndicatorsService,
    private readonly notify: NotificationService
  ) {}

  ngOnInit(): void {
    combineLatest([this.appState.context$, this.notes.changed$.pipe(startWith(undefined))])
      .pipe(
        tap(() => (this.loading = true)),
        switchMap(([ctx]) => this.notes.observeMerged(ctx.area, ctx.date, ctx.shift)),
        takeUntil(this.destroy$)
      )
      .subscribe((list) => {
        this.all = list;
        this.loading = false;
      });

    this.areaSub = this.appState.context$
      .pipe(
        switchMap((ctx) => this.notes.resolveAreaId(ctx.area)),
        takeUntil(this.destroy$)
      )
      .subscribe((id) => (this.areaId = id));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.areaSub?.unsubscribe();
  }

  // ----- Counters -----
  get total(): number {
    return this.all.length;
  }
  countByStatus(status: IndicatorStatus): number {
    return this.all.filter((i) => i.status === status).length;
  }
  get focoSemApontamento(): number {
    return this.all.filter((i) => i.focusWithoutNote).length;
  }
  get inHandoverCount(): number {
    return this.all.filter((i) => i.inHandover).length;
  }

  // ----- Filtering / search -----
  get filtered(): MergedIndicator[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.all
      .filter((i) => this.matchesFilter(i))
      .filter((i) => !term || i.name.toLowerCase().includes(term));
  }

  private matchesFilter(i: MergedIndicator): boolean {
    switch (this.activeFilter) {
      case 'na_meta':
      case 'atencao':
      case 'foco':
        return i.status === this.activeFilter;
      case 'pendencia':
        return i.focusWithoutNote;
      case 'passagem':
        return i.inHandover;
      default:
        return true;
    }
  }

  setFilter(f: IndicatorFilter): void {
    this.activeFilter = f;
  }

  clearSearchAndFilter(): void {
    this.searchTerm = '';
    this.setFilter('todos');
  }

  get hasSearchOrFilter(): boolean {
    return this.activeFilter !== 'todos' || !!this.searchTerm.trim();
  }

  // ----- Reference / status display -----
  describe(i: MergedIndicator): ReferenceBand[] {
    return this.indicators.describeReference(i.reference, i.unit);
  }

  referenceSummary(i: MergedIndicator): string {
    return this.describe(i).map((b) => `${b.label}: ${b.range}`).join(' | ');
  }

  formattedValue(i: MergedIndicator): string {
    if (i.value === null) return '-';
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(i.value);
  }

  noteLabel(i: MergedIndicator): string {
    if (i.focusWithoutNote) return 'Pendente';
    if (i.note?.hasApontamento) return 'Com apontamento';
    return 'Sem apontamento';
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

  // ----- Apontamento editor -----
  toggleEditor(i: MergedIndicator): void {
    this.expandedCode = this.expandedCode === i.code ? null : i.code;
  }
  closeEditor(): void {
    this.expandedCode = null;
  }

  isEditing(i: MergedIndicator): boolean {
    return this.expandedCode === i.code;
  }

  // ----- Handover mark -----
  toggleHandover(i: MergedIndicator): void {
    if (this.areaId == null) {
      this.notify.error('Área inválida.');
      return;
    }
    const ctx = this.appState.context;
    if (i.note) {
      this.notes.toggleHandover(i.note.id, !i.note.includedInHandover).subscribe({
        error: () => this.notify.error('Falha ao atualizar a passagem.')
      });
    } else {
      this.notes
        .upsert({
          areaId: this.areaId,
          indicatorCode: i.code,
          date: ctx.date,
          shift: ctx.shift,
          content: '',
          includedInHandover: true
        })
        .subscribe({ error: () => this.notify.error('Falha ao marcar para passagem.') });
    }
  }

  /** Atenção/Foco entram automaticamente; só Na meta depende da marcação manual. */
  isAutoHandover(i: MergedIndicator): boolean {
    return i.status === 'atencao' || i.status === 'foco';
  }

  trackByCode(_: number, i: MergedIndicator): string {
    return i.code;
  }
}
