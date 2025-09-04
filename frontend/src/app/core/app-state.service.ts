import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ReportContext {
  area: string;
  date: string; // ISO yyyy-mm-dd
  shift: number; // 1,2 or 3
}

/**
 * Global application state for report context.
 * Maintains area, date and shift selections and keeps them in the URL.
 */
@Injectable({ providedIn: 'root' })
export class AppStateService {
  private readonly contextSubject: BehaviorSubject<ReportContext>;
  readonly context$;

  constructor() {
    const params = new URLSearchParams(window.location.search);
    const initial: ReportContext = {
      area: params.get('area') || 'Recebimento de Bauxita',
      date: params.get('date') || this.todayIso(),
      shift: this.parseShift(params.get('shift'))
    };
    this.contextSubject = new BehaviorSubject<ReportContext>(initial);
    this.context$ = this.contextSubject.asObservable();
    this.persist(initial);
  }

  get context(): ReportContext {
    return this.contextSubject.value;
  }

  setArea(area: string): void {
    this.update({ area });
  }

  setDate(date: string): void {
    this.update({ date });
  }

  setShift(shift: number): void {
    this.update({ shift: this.parseShift(String(shift)) });
  }

  private update(partial: Partial<ReportContext>): void {
    const next = { ...this.contextSubject.value, ...partial };
    this.contextSubject.next(next);
    this.persist(next);
  }

  private persist(ctx: ReportContext): void {
    const params = new URLSearchParams();
    params.set('area', ctx.area);
    params.set('date', ctx.date);
    params.set('shift', String(ctx.shift));
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }

  private todayIso(): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  }

  private parseShift(value: string | null): number {
    const num = Number(value);
    return num === 2 || num === 3 ? num : 1;
  }
}
