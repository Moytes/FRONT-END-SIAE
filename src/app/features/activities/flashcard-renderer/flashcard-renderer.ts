import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpLevelSelectorComponent } from '../../../shared/components/help-level-selector/help-level-selector.component';
import { ObservationInputComponent } from '../../../shared/components/observation-input/observation-input.component';
import { TimerDisplayComponent } from '../../../shared/components/timer-display/timer-display.component';

export interface FlashcardResult {
  evaluation: 'LOGRADO' | 'EN_PROCESO' | 'OMISION' | 'POSICION';
  helpLevel: number | null;
  observation: string;
  timeSeconds: number; // mock
}

@Component({
  selector: 'app-flashcard-renderer',
  standalone: true,
  imports: [CommonModule, HelpLevelSelectorComponent, ObservationInputComponent, TimerDisplayComponent],
  templateUrl: './flashcard-renderer.html',
  styleUrl: './flashcard-renderer.css',
})
export class FlashcardRenderer {
  config = input<any>();
  resultSaved = output<FlashcardResult>();

  evaluation = signal<'LOGRADO' | 'EN_PROCESO' | 'OMISION' | 'POSICION' | null>(null);
  helpLevel = signal<number | null>(null);
  observation = signal<string>('');

  setEval(val: 'LOGRADO' | 'EN_PROCESO' | 'OMISION' | 'POSICION') {
    this.evaluation.set(val);
  }

  canSave(): boolean {
    return this.evaluation() !== null && this.helpLevel() !== null;
  }

  finish() {
    if (!this.canSave()) return;
    this.resultSaved.emit({
      evaluation: this.evaluation()!,
      helpLevel: this.helpLevel(),
      observation: this.observation(),
      timeSeconds: 0 
    });
  }
}
