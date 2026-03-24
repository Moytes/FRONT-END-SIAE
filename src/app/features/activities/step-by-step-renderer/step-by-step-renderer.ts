import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpLevelSelectorComponent } from '../../../shared/components/help-level-selector/help-level-selector.component';
import { ObservationInputComponent } from '../../../shared/components/observation-input/observation-input.component';

@Component({
  selector: 'app-step-by-step-renderer',
  standalone: true,
  imports: [CommonModule, HelpLevelSelectorComponent, ObservationInputComponent],
  templateUrl: './step-by-step-renderer.html',
  styleUrl: './step-by-step-renderer.css',
})
export class StepByStepRenderer {
  config = input<any>();
  resultSaved = output<any>();

  currentStepIndex = signal(0);
  stepAnswers = signal<Record<number, { status: string }>>({});
  
  helpLevel = signal<number | null>(null);
  observation = signal<string>('');

  setStep(index: number) {
    if (index <= this.config()?.steps?.length - 1) {
      this.currentStepIndex.set(index);
    }
  }

  markCurrent(status: string) {
    this.stepAnswers.update(ans => ({ ...ans, [this.currentStepIndex()]: { status } }));
  }

  nextStep() {
    if (this.currentStepIndex() < (this.config()?.steps?.length || 0) - 1) {
      this.currentStepIndex.update(i => i + 1);
    }
  }

  prevStep() {
    if (this.currentStepIndex() > 0) {
      this.currentStepIndex.update(i => i - 1);
    }
  }

  finish() {
    this.resultSaved.emit({
      steps: this.stepAnswers(),
      help: this.helpLevel(),
      obs: this.observation()
    });
  }
}
