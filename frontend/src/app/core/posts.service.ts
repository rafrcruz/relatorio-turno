import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

export type PostType = 'ANNOTATION' | 'URGENCY' | 'PENDENCY';

export interface Attachment {
  id: number;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface Post {
  id: number;
  areaId: number;
  date: string;
  shift: number;
  type: PostType;
  content: string;
  author: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
  _count: { replies: number };
}

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
  private readonly createdSource = new Subject<any>();
  /** Emits newly created posts so that lists can refresh. */
  readonly created$ = this.createdSource.asObservable();

  constructor(private readonly http: HttpClient) {}

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

  /** Retrieves posts for the given context and type. */
  list(areaId: number, date: string, shift: number, type: PostType, page = 1, pageSize = 10): Observable<Post[]> {
    const params = new HttpParams()
      .set('areaId', String(areaId))
      .set('date', date)
      .set('shift', String(shift))
      .set('type', type)
      .set('page', String(page))
      .set('pageSize', String(pageSize));
    return this.http.get<Post[]>('/api/posts', { params });
  }

  /** Returns post counts grouped by type for the context. */
  summary(areaId: number, date: string, shift: number): Observable<any[]> {
    const params = new HttpParams()
      .set('areaId', String(areaId))
      .set('date', date)
      .set('shift', String(shift));
    return this.http.get<any[]>('/api/summary', { params });
  }

  /** Retrieves a single post by id. */
  get(id: number): Observable<Post> {
    return this.http.get<Post>(`/api/posts/${id}`);
  }
}
