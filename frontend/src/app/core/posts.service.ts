import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

export type PostType = 'ANNOTATION' | 'URGENCY' | 'PENDENCY';

export interface PostCreate {
  areaId: number;
  date: string;
  shift: number;
  type: PostType;
  content: string;
  attachments: File[];
}

@Injectable({ providedIn: 'root' })
export class PostsService {
  private createdSource = new Subject<any>();
  /** Emits newly created posts so that lists can refresh. */
  readonly created$ = this.createdSource.asObservable();

  constructor(private http: HttpClient) {}

  /** Sends a new post to the backend API. */
  create(payload: PostCreate): Observable<any> {
    const form = new FormData();
    form.append('areaId', String(payload.areaId));
    form.append('date', payload.date);
    form.append('shift', String(payload.shift));
    form.append('type', payload.type);
    form.append('content', payload.content);
    for (const file of payload.attachments) {
      form.append('attachments', file);
    }
    return this.http.post<any>('/api/posts', form).pipe(
      tap((post) => this.createdSource.next(post))
    );
  }
}
