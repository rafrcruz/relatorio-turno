import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Notification, NotificationService, NotificationType } from '../../core/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
  animations: [
    trigger('slideNotif', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class NotificationsComponent implements OnInit {
  messages: Notification[] = [];

  constructor(private readonly notifier: NotificationService) {}

  ngOnInit(): void {
    this.notifier.messages$.subscribe((m) => {
      this.messages.push(m);
      setTimeout(() => this.remove(m), 4000);
    });
  }

  remove(m: Notification): void {
    this.messages = this.messages.filter((msg) => msg !== m);
  }

  iconName(type: NotificationType): string {
    switch (type) {
      case 'success': return 'circle-check';
      case 'error':   return 'circle-x';
      default:        return 'info';
    }
  }
}
