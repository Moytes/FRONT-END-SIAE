import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-level-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="help-level-container">
      <h4 class="title-label">Nivel de Ayuda Requerido</h4>
      <div class="levels-flex">
        <button 
          *ngFor="let level of [0,1,2,3,4,5]" 
          (click)="selectLevel(level)"
          [class.selected]="selectedLevel() === level"
          class="level-btn"
          [attr.aria-label]="'Nivel de ayuda ' + level">
          {{ level }}
        </button>
      </div>
      <p class="desc-text" *ngIf="selectedLevel() !== null">
        {{ getLevelDescription(selectedLevel()!) }}
      </p>
    </div>
  `,
  styles: [`
    .help-level-container {
      background: #f8fafc;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);
    }
    .title-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: #64748b;
      margin-top: 0;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .levels-flex {
      display: flex;
      gap: 0.6rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .level-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px solid #cbd5e1;
      background: #ffffff;
      color: #64748b;
      font-weight: 700;
      font-size: 1.15rem;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .level-btn:hover {
      border-color: #94a3b8;
      background: #f1f5f9;
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .level-btn.selected {
      background: #8b5cf6; /* Púrpura vibrante institucional */
      color: #ffffff;
      border-color: #7c3aed;
      box-shadow: 0 4px 10px rgba(139, 92, 246, 0.4);
      transform: scale(1.1);
      z-index: 10;
    }
    .desc-text {
      font-size: 0.8rem;
      color: #6366f1;
      margin-top: 0.75rem;
      margin-bottom: 0;
      font-weight: 600;
      font-style: italic;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class HelpLevelSelectorComponent {
  selectedLevel = signal<number | null>(null);
  levelChange = output<number>();

  selectLevel(level: number) {
    this.selectedLevel.set(level);
    this.levelChange.emit(level);
  }

  getLevelDescription(level: number): string {
    switch(level) {
      case 0: return 'Cero ayuda / Independiente. El alumno logra el objetivo por sí mismo.';
      case 1: return 'Pista Visual Mínima. Requiere señalar o mostrar un apoyo sutil.';
      case 2: return 'Pista Verbal. Se brinda una instrucción hablada o recordatorio.';
      case 3: return 'Modelado / Apoyo Directo. El maestro demuestra la acción requerida.';
      case 4: return 'Apoyo Físico Parcial. Se guía levemente para iniciar la acción.';
      case 5: return 'Apoyo Físico Total. Manipulación mano sobre mano.';
      default: return '';
    }
  }
}
