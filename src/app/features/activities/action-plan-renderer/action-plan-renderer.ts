import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservationInputComponent } from '../../../shared/components/observation-input/observation-input.component';

@Component({
  selector: 'app-action-plan-renderer',
  standalone: true,
  imports: [CommonModule, ObservationInputComponent],
  templateUrl: './action-plan-renderer.html',
  styleUrl: './action-plan-renderer.css',
})
export class ActionPlanRenderer {
  config = input<any>();
  resultSaved = output<any>();

  isGenerating = signal(false);
  generatedPlan = signal<any>(null);
  observation = signal<string>('');

  generatePlan() {
    this.isGenerating.set(true);
    // Mock cruzamiento de datos
    setTimeout(() => {
      this.isGenerating.set(false);
      this.generatedPlan.set({
        criticalAreas: [
          { 
            name: 'Identificación de Dífonos Vocálicos', 
            helpLevelStr: 'Apoyo Físico Total (Nivel 5)',
            suggestions: ['Incentivar el modelado lento', 'Uso de apoyos visuales de boca'] 
          },
          { 
            name: 'Concordancia de Género (Morf)', 
            helpLevelStr: 'Pista Verbal (Nivel 2)',
            suggestions: ['Juegos de roles con marcadores', 'Oraciones repetitivas con corrección incidental'] 
          }
        ]
      });
    }, 1500);
  }

  finish() {
    this.resultSaved.emit({
      plan: this.generatedPlan(),
      obs: this.observation()
    });
  }
}
