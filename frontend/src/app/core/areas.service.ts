import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Provides the list of operational areas. Attempts to load from API and
 * falls back to a static list when the backend is unavailable.
 */
@Injectable({ providedIn: 'root' })
export class AreasService {
  private readonly fallbackAreas: string[] = [
    'Recebimento de Bauxita',
    'Digestão',
    'Clarificação',
    'Filtro Prensa',
    'Precipitação',
    'Calcinação',
    'Vapor e Utilidades',
    'Águas e Efluentes',
    'Automação e Energia',
    'Porto',
    'Meio Ambiente'
  ];

  constructor(private http: HttpClient) {}

  /** Returns operational areas with graceful fallback. */
  getAreas(): Observable<string[]> {
    return this.http.get<string[]>('/api/areas').pipe(
      map((areas) => (areas && areas.length ? areas : this.fallbackAreas)),
      catchError(() => of(this.fallbackAreas))
    );
  }
}
