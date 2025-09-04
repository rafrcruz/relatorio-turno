import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Area {
  id: number;
  name: string;
}

/**
 * Provides the list of operational areas. Attempts to load from API and
 * falls back to a static list when the backend is unavailable.
 */
@Injectable({ providedIn: 'root' })
export class AreasService {
  private readonly fallbackAreas: Area[] = [
    { id: 1, name: 'Recebimento de Bauxita' },
    { id: 2, name: 'Digestão' },
    { id: 3, name: 'Clarificação' },
    { id: 4, name: 'Filtro Prensa' },
    { id: 5, name: 'Precipitação' },
    { id: 6, name: 'Calcinação' },
    { id: 7, name: 'Vapor e Utilidades' },
    { id: 8, name: 'Águas e Efluentes' },
    { id: 9, name: 'Automação e Energia' },
    { id: 10, name: 'Porto' },
    { id: 11, name: 'Meio Ambiente' }
  ];

  constructor(private readonly http: HttpClient) {}

  /** Returns areas with id and name, using fallback data when API fails. */
  getAreasWithIds(): Observable<Area[]> {
    return this.http.get<Area[]>('/api/areas').pipe(
      map((areas) => (areas && areas.length ? areas : this.fallbackAreas)),
      catchError(() => of(this.fallbackAreas))
    );
  }

  /** Returns only area names with graceful fallback. */
  getAreas(): Observable<string[]> {
    return this.getAreasWithIds().pipe(map((areas) => areas.map((a) => a.name)));
  }
}
