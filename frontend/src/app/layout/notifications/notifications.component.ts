import { Component, OnInit } from '@angular/core';
import { Notification, NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  messages: Notification[] = [];

  constructor(private readonly notifier: NotificationService) {}

  ngOnInit(): void {
    this.notifier.messages$.subscribe((m) => {
      this.messages.push(m);
      setTimeout(() => this.remove(m), 3000);
    });
  }

  remove(m: Notification): void {
    this.messages = this.messages.filter((msg) => msg !== m);
  }
}

