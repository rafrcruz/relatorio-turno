import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExportService {
  constructor(private readonly http: HttpClient) {}

  /** Requests a PDF export for the given context. */
  downloadPdf(areaId: number, date: string, shift: number): Observable<Blob> {
    return this.http.post('/api/export', { areaId, date, shift }, { responseType: 'blob' });
  }
}
