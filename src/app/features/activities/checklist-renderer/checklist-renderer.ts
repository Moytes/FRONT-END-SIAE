import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpLevelSelectorComponent } from '../../../shared/components/help-level-selector/help-level-selector.component';
import { ObservationInputComponent } from '../../../shared/components/observation-input/observation-input.component';

@Component({
  selector: 'app-checklist-renderer',
  standalone: true,
  imports: [CommonModule, HelpLevelSelectorComponent, ObservationInputComponent],
  templateUrl: './checklist-renderer.html',
  styleUrl: './checklist-renderer.css',
})
export class ChecklistRenderer {
  config = input<any>();
  resultSaved = output<any>();
  
  isTeleprompter = signal(false);
  currentIndex = signal(0);
  
  answers = signal<Record<number, string>>({});
  helpLevel = signal<number | null>(null);
  observation = signal<string>('');

  get currentQuestion() {
    const questions = this.config()?.questions || [];
    return questions[this.currentIndex()];
  }

  toggleTeleprompter() {
    this.isTeleprompter.update(v => !v);
  }

  setAnswer(index: number, val: string) {
    this.answers.update(a => ({...a, [index]: val}));
    if (this.isTeleprompter() && this.currentIndex() < (this.config()?.questions?.length || 0) - 1) {
      this.currentIndex.update(i => i + 1);
    }
  }

  setEval(val: string) {
    this.setAnswer(this.currentIndex(), val);
  }

  finish() {
    this.resultSaved.emit({ answers: this.answers(), help: this.helpLevel(), obs: this.observation() });
  }
}
