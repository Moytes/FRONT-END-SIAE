import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityConfigService, ActivityConfig } from '../../core/services/activity-config.service';
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
  activityService = inject(ActivityConfigService);

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
      if (id) {
        const found = this.activityService.getActivity(id);
        if (found) {
          this.mission.set(found);
          // Si es de tipo Secuencia (11), preparamos los pasos desordenados
          if (found.activityType === 11 && found.config?.steps) {
            const steps = found.config.steps.map((text: string, i: number) => ({ id: i, text }));
            // Mezclado simple para el juego
            this.orderedSteps.set(steps.sort(() => Math.random() - 0.5));
          }
        } else {
          this.router.navigate(['/']);
        }
      }
    });
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
    
    // Simula una pequeña pausa para ver la animación antes de la victoria
    setTimeout(() => {
      this.gameState.set('WIN');
      this.showSuccessAnim.set(false);
      
      // Lanzar confeti nativo de JS si quisiéramos (mock para MVP)
      console.log('¡Efecto especial de Victoria ejecutado!');
    }, 1200);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
