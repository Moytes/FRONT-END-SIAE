import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ObservationInputComponent } from '../../../shared/components/observation-input/observation-input.component';

interface Strategy {
  description: string;
  helpLevel: number;
  helpName: string;
  materials: string;
  indicator: string;
  status: 'pending' | 'logrado' | 'parcial' | 'no_logrado';
}

interface PriorityArea {
  name: string;
  strategies: Strategy[];
}

const HELP_LEVELS: Record<number, string> = {
  0: 'Sin ayuda',
  1: 'Supervisión',
  2: 'Motivación verbal o gestual',
  3: 'Modelado',
  4: 'Ayuda física parcial',
  5: 'Ayuda física total'
};

@Component({
  selector: 'app-action-plan-renderer',
  standalone: true,
  imports: [CommonModule, FormsModule, ObservationInputComponent],
  templateUrl: './action-plan-renderer.html',
  styleUrl: './action-plan-renderer.css',
})
export class ActionPlanRenderer {
  config = input<any>();
  resultSaved = output<any>();

  isGenerating = signal(false);
  generatedPlan = signal<{ areas: PriorityArea[]; period: string } | null>(null);
  observation = signal<string>('');
  showAddForm = signal<number | null>(null);
  newStrategyDesc = '';
  newStrategyMaterials = '';
  newStrategyIndicator = '';
  newStrategyHelp = 2;

  helpLevels = HELP_LEVELS;

  generatePlan() {
    this.isGenerating.set(true);
    setTimeout(() => {
      this.isGenerating.set(false);
      this.generatedPlan.set({
        period: 'Marzo – Abril 2026',
        areas: [
          {
            name: 'Conectores de Cohesión (Morfosintaxis)',
            strategies: [
              {
                description: 'Uso de cuentos secuenciados con conectores visuales (tarjetas "porque", "entonces", "y")',
                helpLevel: 3,
                helpName: 'Modelado',
                materials: 'Tarjetas de conectores, cuentos ilustrados, pizarra magnética',
                indicator: 'El alumno utiliza al menos 2 conectores diferentes en una narrativa de 3+ oraciones',
                status: 'pending'
              },
              {
                description: 'Juego de completar oraciones con el conector correcto a partir de opciones visuales',
                helpLevel: 2,
                helpName: 'Motivación verbal o gestual',
                materials: 'Fichas de completar, imágenes de apoyo',
                indicator: 'Selecciona el conector apropiado en 4 de 5 intentos',
                status: 'pending'
              }
            ]
          },
          {
            name: 'Pronombres Personales y Posesivos (Morfosintaxis)',
            strategies: [
              {
                description: 'Juego de roles con muñecos donde se practiquen pronombres (yo, tú, él, ella) en contexto natural',
                helpLevel: 2,
                helpName: 'Motivación verbal o gestual',
                materials: 'Muñecos, escenarios de juego simbólico, tarjetas con pronombres',
                indicator: 'El alumno usa correctamente al menos 3 pronombres diferentes durante el juego libre',
                status: 'pending'
              }
            ]
          }
        ]
      });
    }, 1500);
  }

  toggleStatus(areaIdx: number, stratIdx: number) {
    const plan = this.generatedPlan();
    if (!plan) return;
    const current = plan.areas[areaIdx].strategies[stratIdx].status;
    const next: Strategy['status'] =
      current === 'pending' ? 'logrado' :
      current === 'logrado' ? 'parcial' :
      current === 'parcial' ? 'no_logrado' :
      'pending';
    plan.areas[areaIdx].strategies[stratIdx].status = next;
    this.generatedPlan.set({ ...plan });
  }

  getStatusLabel(s: string): string {
    if (s === 'logrado') return '✅ Logrado';
    if (s === 'parcial') return '🔶 Parcial';
    if (s === 'no_logrado') return '❌ No logrado';
    return '⬜ Pendiente';
  }

  getStatusClass(s: string): string {
    if (s === 'logrado') return 'st-logrado';
    if (s === 'parcial') return 'st-parcial';
    if (s === 'no_logrado') return 'st-no-logrado';
    return 'st-pending';
  }

  openAddStrategy(areaIdx: number) {
    this.showAddForm.set(areaIdx);
    this.newStrategyDesc = '';
    this.newStrategyMaterials = '';
    this.newStrategyIndicator = '';
    this.newStrategyHelp = 2;
  }

  addStrategy(areaIdx: number) {
    if (!this.newStrategyDesc.trim()) return;
    const plan = this.generatedPlan();
    if (!plan) return;
    plan.areas[areaIdx].strategies.push({
      description: this.newStrategyDesc,
      helpLevel: this.newStrategyHelp,
      helpName: HELP_LEVELS[this.newStrategyHelp],
      materials: this.newStrategyMaterials || 'Por definir',
      indicator: this.newStrategyIndicator || 'Por definir',
      status: 'pending'
    });
    this.generatedPlan.set({ ...plan });
    this.showAddForm.set(null);
  }

  removeStrategy(areaIdx: number, stratIdx: number) {
    const plan = this.generatedPlan();
    if (!plan) return;
    plan.areas[areaIdx].strategies.splice(stratIdx, 1);
    this.generatedPlan.set({ ...plan });
  }

  finish() {
    this.resultSaved.emit({
      plan: this.generatedPlan(),
      obs: this.observation()
    });
  }
}
