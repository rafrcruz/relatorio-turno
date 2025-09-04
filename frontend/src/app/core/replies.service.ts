import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Attachment } from './posts.service';

export interface Reply {
  id: number;
  postId: number;
  content: string;
  author: { id: number; name: string };
  createdAt: string;
  attachments: Attachment[];
}

export interface ReplyPage {
  replies: Reply[];
  total: number;
}

export interface ReplyCreate {
  content: string;
  attachments: File[];
}

@Injectable({ providedIn: 'root' })
export class RepliesService {
  private readonly createdSource = new Subject<Reply>();
  readonly created$ = this.createdSource.asObservable();

  constructor(private readonly http: HttpClient) {}

  list(postId: number, page = 1, pageSize = 5): Observable<ReplyPage> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));
    return this.http.get<ReplyPage>(`/api/posts/${postId}/replies`, { params });
  }

  create(postId: number, payload: ReplyCreate): Observable<Reply> {
    const form = new FormData();
    form.append('content', payload.content);
    for (const file of payload.attachments) {
      form.append('attachments', file);
    }
    return this.http
      .post<Reply>(`/api/posts/${postId}/replies`, form)
      .pipe(tap((r) => this.createdSource.next(r)));
  }
}
