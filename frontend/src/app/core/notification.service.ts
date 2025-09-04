import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  type: NotificationType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _messages = new Subject<Notification>();
  readonly messages$ = this._messages.asObservable();

  success(message: string): void {
    this._messages.next({ type: 'success', message });
  }

  error(message: string): void {
    this._messages.next({ type: 'error', message });
  }

  info(message: string): void {
    this._messages.next({ type: 'info', message });
  }
}

