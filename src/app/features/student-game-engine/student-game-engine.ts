import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityConfig } from '../../core/services/activity-config.service';
import { AlumnoPortalService } from '../../core/services/alumno-portal.service';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-student-game-engine',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './student-game-engine.html',
  styleUrl: './student-game-engine.css'
})
export class StudentGameEngineComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  alumnoPortalService = inject(AlumnoPortalService);

  // Id del AlumnoTrabajo (no del material) — es lo que recibe la ruta /jugar/:id
  // y lo que hace falta para marcar el trabajo como completado en el backend.
  private trabajoId: number | null = null;

  mission = signal<ActivityConfig | null>(null);
  gameState = signal<'INTRO' | 'PLAYING' | 'WIN' | 'WRONG'>('INTRO');

  progress = signal<number>(10);
  showSuccessAnim = signal<boolean>(false);
  selectedOption = signal<number | null>(null);

  // Para Tipo 11 (Secuencias)
  orderedSteps = signal<{id: number, text: string}[]>([]);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) {
        this.router.navigate(['/']);
        return;
      }

      this.trabajoId = +id;
      this.alumnoPortalService.getTrabajo(this.trabajoId).subscribe({
        next: (trabajo) => {
          const found = this.parseContenido(trabajo.asignacion.material.contenidoJson);
          if (!found) {
            alert('Esta actividad no tiene contenido jugable configurado.');
            this.router.navigate(['/']);
            return;
          }

          this.mission.set(found);
          // Si es de tipo Secuencia (11), preparamos los pasos desordenados
          if (found.activityType === 11 && found.config?.steps) {
            const steps = found.config.steps.map((text: string, i: number) => ({ id: i, text }));
            // Mezclado simple para el juego
            this.orderedSteps.set(steps.sort(() => Math.random() - 0.5));
          }
        },
        error: () => this.router.navigate(['/'])
      });
    });
  }

  private parseContenido(contenidoJson: string | undefined): ActivityConfig | null {
    if (!contenidoJson) return null;
    try {
      const parsed = JSON.parse(contenidoJson);
      return {
        id: String(this.trabajoId),
        title: '',
        activityType: parsed.activityType,
        dimension: parsed.dimension,
        config: parsed.config,
        createdAt: new Date()
      };
    } catch {
      return null;
    }
  }

  startMission() {
    this.gameState.set('PLAYING');
    // Animamos la barra al iniciar
    setTimeout(() => this.progress.set(50), 300);
  }

  selectOption(idx: number) {
    this.selectedOption.set(idx);
  }

  verifyOption() {
    const correctIdx = this.mission()?.config?.correctIndex;
    if (correctIdx !== undefined && this.selectedOption() === correctIdx) {
      this.completeMission();
    } else {
      // Respuesta incorrecta → sacudir
      this.gameState.set('WRONG');
      setTimeout(() => this.gameState.set('PLAYING'), 800);
    }
  }

  // --- Lógica de Secuencias (Kanban / Drag & Drop) ---
  drop(event: CdkDragDrop<{id: number, text: string}[]>) {
    this.orderedSteps.update(list => {
      moveItemInArray(list, event.previousIndex, event.currentIndex);
      return [...list];
    });
  }

  verifySequence() {
    const isCorrect = this.orderedSteps().every((step, i) => step.id === i);
    if (isCorrect) {
      this.completeMission();
    } else {
      this.gameState.set('WRONG');
      setTimeout(() => this.gameState.set('PLAYING'), 800);
    }
  }

  completeMission() {
    this.showSuccessAnim.set(true);
    this.progress.set(100);

    if (this.trabajoId) {
      this.alumnoPortalService.completarTrabajo(this.trabajoId).subscribe({
        error: (err) => console.error('No se pudo registrar el trabajo como completado', err)
      });
    }

    // Simula una pequeña pausa para ver la animación antes de la victoria
    setTimeout(() => {
      this.gameState.set('WIN');
      this.showSuccessAnim.set(false);
    }, 1200);
  }

  /**
   * Maps activity type (1-11) to game screen type for the template ngSwitch.
   * FLASHCARD = Act 1, 4, 7, 8 (single card with image+word)
   * PAIR = Act 2 (two images side by side for minimal pairs)
   * OPTIONS = Act 3, 9, 10 (multiple choice / checklist)
   * TEXT = Act 5 (free text / IA analysis)
   * PLAN = Act 6 (action plan - informational)
   * SEQUENCE = Act 11 (drag & drop ordering)
   */
  getGameType(): string {
    const type = this.mission()?.activityType;
    if (type === 2) return 'PAIR';
    if ([1, 4, 7, 8].includes(type!)) return 'FLASHCARD';
    if ([3, 9, 10].includes(type!)) return 'OPTIONS';
    if (type === 5) return 'TEXT';
    if (type === 6) return 'PLAN';
    if (type === 11) return 'SEQUENCE';
    return 'FLASHCARD'; // fallback
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
