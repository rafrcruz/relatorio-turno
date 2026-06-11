import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Attachment } from './posts.service';
import { IndicatorData, IndicatorsService } from './indicators.service';
import { AreasService } from './areas.service';

/** Apontamento + marcação de passagem de um indicador, por contexto. */
export interface IndicatorNote {
  id: number;
  areaId: number;
  indicatorCode: string;
  date: string;
  shift: number;
  content: string;
  hasApontamento: boolean;
  includedInHandover: boolean;
  author?: { id: number; name: string };
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface IndicatorNoteUpsert {
  areaId: number;
  indicatorCode: string;
  date: string;
  shift: number;
  content: string;
  includedInHandover?: boolean;
  attachments?: File[];
}

/** Indicator (status from client) joined with its persisted note (backend). */
export interface MergedIndicator extends IndicatorData {
  note: IndicatorNote | null;
  /** Entra no resumo de passagem: Atenção/Foco (automático) ou marcado manualmente. */
  inHandover: boolean;
  /** Foco sem apontamento de conteúdo: pendência forte. */
  focusWithoutNote: boolean;
}

@Injectable({ providedIn: 'root' })
export class IndicatorNotesService {
  private readonly changedSource = new Subject<void>();
  /** Emits whenever a note/mark changes so views can refresh. */
  readonly changed$ = this.changedSource.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly indicators: IndicatorsService,
    private readonly areas: AreasService
  ) {}

  /**
   * Loads indicators (mock) joined with notes (backend) for a context.
   * Resolves the areaId from the area name; falls back to empty notes if the
   * backend is unavailable so the dedicated view still renders the indicators.
   */
  observeMerged(area: string, date: string, shift: number): Observable<MergedIndicator[]> {
    return this.areas.getAreasWithIds().pipe(
      switchMap((areas) => {
        const areaId = areas.find((a) => a.name === area)?.id;
        const indicators$ = this.indicators.getIndicators(area, date, shift);
        const notes$ = areaId
          ? this.list(areaId, date, shift).pipe(catchError(() => of([] as IndicatorNote[])))
          : of([] as IndicatorNote[]);
        return combineLatest([indicators$, notes$]).pipe(
          map(([inds, notes]) => this.merge(inds, notes))
        );
      })
    );
  }

  /** Resolves the numeric areaId for an area name (for write operations). */
  resolveAreaId(area: string): Observable<number | undefined> {
    return this.areas.getAreasWithIds().pipe(map((areas) => areas.find((a) => a.name === area)?.id));
  }

  /** Lists notes for the given context. */
  list(areaId: number, date: string, shift: number): Observable<IndicatorNote[]> {
    const params = new HttpParams()
      .set('areaId', String(areaId))
      .set('date', date)
      .set('shift', String(shift));
    return this.http.get<IndicatorNote[]>(`${environment.apiUrl}/api/indicator-notes`, { params });
  }

  /** Creates or updates the note/mark of an indicator in a context. */
  upsert(payload: IndicatorNoteUpsert): Observable<IndicatorNote> {
    const form = new FormData();
    form.append('areaId', String(payload.areaId));
    form.append('indicatorCode', payload.indicatorCode);
    form.append('date', payload.date);
    form.append('shift', String(payload.shift));
    form.append('content', payload.content ?? '');
    if (payload.includedInHandover !== undefined) {
      form.append('includedInHandover', String(payload.includedInHandover));
    }
    for (const file of payload.attachments ?? []) {
      form.append('attachments', file);
    }
    return this.http
      .post<IndicatorNote>(`${environment.apiUrl}/api/indicator-notes`, form)
      .pipe(tap(() => this.changedSource.next()));
  }

  /** Toggles the handover mark of an existing note. */
  toggleHandover(id: number, includedInHandover: boolean): Observable<IndicatorNote> {
    return this.http
      .patch<IndicatorNote>(`${environment.apiUrl}/api/indicator-notes/${id}/handover`, { includedInHandover })
      .pipe(tap(() => this.changedSource.next()));
  }

  /** Deletes a note (and its attachments). */
  delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiUrl}/api/indicator-notes/${id}`)
      .pipe(tap(() => this.changedSource.next()));
  }

  /** Deletes a single attachment during note edition. */
  deleteAttachment(id: number): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiUrl}/api/attachments/${id}`)
      .pipe(tap(() => this.changedSource.next()));
  }

  /**
   * Joins indicators (status from client) with notes (backend) by code.
   * Derives inHandover and focusWithoutNote — the single source of truth for
   * both the dedicated view and the handover summary.
   */
  merge(indicators: IndicatorData[], notes: IndicatorNote[]): MergedIndicator[] {
    const byCode = new Map<string, IndicatorNote>();
    for (const note of notes) byCode.set(note.indicatorCode, note);
    return indicators.map((ind) => {
      const note = byCode.get(ind.code) ?? null;
      const focusWithoutNote = ind.status === 'foco' && !note?.hasApontamento;
      const inHandover =
        ind.status === 'atencao' || ind.status === 'foco' || !!note?.includedInHandover;
      return { ...ind, note, inHandover, focusWithoutNote };
    });
  }
}
