import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ActivityConfigService } from '../../core/services/activity-config.service';
import { NotificationService } from '../../core/services/notification.service';
import { StudentService } from '../../core/services/student.service';
import { NotificationItem } from '../../core/models/api-models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  authService = inject(AuthService);
  activityService = inject(ActivityConfigService);
  router = inject(Router);
  private notificationService = inject(NotificationService);
  private studentService = inject(StudentService);

  notifications = signal<NotificationItem[]>([]);
  totalStudents = signal(0);
  unreadNotifications = signal(0);

  get user() {
    return this.authService.currentUser();
  }

  get availableMissions() {
    return this.activityService.activities();
  }

  ngOnInit(): void {
    // Load notifications
    this.notificationService.getMyNotifications().subscribe({
      next: (notifs) => {
        this.notifications.set(notifs);
        this.unreadNotifications.set(notifs.filter(n => !n.isRead).length);
      },
      error: () => { /* silent fail */ }
    });

    // Load student count
    this.studentService.getStudents().subscribe({
      next: (students) => this.totalStudents.set(students.length),
      error: () => { /* silent fail */ }
    });
  }

  markNotificationRead(id: string): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        this.unreadNotifications.update(n => Math.max(0, n - 1));
      }
    });
  }

  playMission(id: string) {
    this.router.navigate(['/jugar', id]);
  }
}
