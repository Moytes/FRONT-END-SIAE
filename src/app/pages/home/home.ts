import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ActivityConfigService, ActivityConfig } from '../../core/services/activity-config.service';
import { NotificationService } from '../../core/services/notification.service';
import { StudentService } from '../../core/services/student.service';
import { NotificationItem, UserRole } from '../../core/models/api-models';

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
    // Docentes van directamente a Mis Lecciones
    if (this.authService.currentUser()?.role === UserRole.DOCENTE) {
      this.router.navigate(['/lecciones']);
      return;
    }

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

  deleteMission(id: string, event: MouseEvent) {
    event.stopPropagation();
    if (confirm('¿Eliminar esta actividad?')) {
      this.activityService.deleteActivity(id);
    }
  }

  getActivityTypeLabel(type: number): string {
    const labels: Record<number, string> = {
      1: 'Fonemas', 2: 'Pares Mínimos', 3: 'Pragmática',
      4: 'Tarjetas', 5: 'Análisis IA', 6: 'Plan de Acción',
      7: 'Vocabulario', 8: 'Semántica', 9: 'Lista de Cotejo',
      10: 'Debate', 11: 'Paso a Paso'
    };
    return labels[type] ?? 'Actividad';
  }

  getActivityDescription(m: ActivityConfig): string {
    const descs: Record<number, string> = {
      1: 'Practica la producción de sonidos del habla con retroalimentación guiada.',
      2: 'Distingue pares de palabras similares para afinar tu percepción auditiva.',
      3: 'Evalúa habilidades pragmáticas y de comunicación social.',
      4: 'Aprende vocabulario nuevo con tarjetas visuales interactivas.',
      5: 'Expresa ideas libremente con apoyo de inteligencia artificial.',
      6: 'Desarrolla un plan personalizado de metas y acciones.',
      7: 'Amplía tu vocabulario con imágenes y contexto.',
      8: 'Explora relaciones semánticas entre palabras.',
      9: 'Completa una lista de habilidades del lenguaje.',
      10: 'Practica el discurso argumentativo y reflexivo.',
      11: 'Sigue instrucciones paso a paso para completar la tarea.'
    };
    return descs[m.activityType] ?? 'Completa esta actividad y avanza en tu aprendizaje.';
  }

  getDifficulty(type: number): number {
    if ([4, 9].includes(type)) return 1;
    if ([2, 5, 6].includes(type)) return 3;
    return 2;
  }

  getDifficultyLabel(type: number): string {
    const d = this.getDifficulty(type);
    return d === 1 ? 'Fácil' : d === 2 ? 'Medio' : 'Avanzado';
  }

  starRange = [1, 2, 3];

  getActivityIcon(m: ActivityConfig): string {
    if (m.config?.imageUrl) return m.config.imageUrl;
    const icons: Record<string, string> = {
      FONOLOGIA:     'https://cdn-icons-png.flaticon.com/512/1995/1995574.png',
      SEMANTICA:     'https://cdn-icons-png.flaticon.com/512/3208/3208536.png',
      MORFOSINTAXIS: 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png',
      PRAGMATICA:    'https://cdn-icons-png.flaticon.com/512/1041/1041916.png',
      DISCURSOS:     'https://cdn-icons-png.flaticon.com/512/1067/1067357.png',
      JUEGO:         'https://cdn-icons-png.flaticon.com/512/3208/3208745.png'
    };
    return icons[m.dimension] ?? 'https://cdn-icons-png.flaticon.com/512/3208/3208536.png';
  }
}
