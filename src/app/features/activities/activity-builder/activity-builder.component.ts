import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivityConfigService, ActivityDimension } from '../../../core/services/activity-config.service';

@Component({
  selector: 'app-activity-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activity-builder.component.html',
  styleUrl: './activity-builder.component.css'
})
export class ActivityBuilderComponent {
  configService = inject(ActivityConfigService);
  router = inject(Router);

  activityTitle = signal('');
  dimension = signal<ActivityDimension>('FONOLOGIA');
  activityType = signal<number>(1);

  // Flashcard Temp State
  flashcardWord = signal('');
  flashcardImageUrl = signal('');

  // Checklist / Opciones Múltiples
  checklistMainQ = signal('');
  checklistQuestions = signal<{text: string; isCorrect: boolean}[]>([]);
  newQuestionText = signal('');

  // Escritura IA
  iaPrompt = signal('');

  // Secuencias
  sequenceMainQ = signal('');
  sequenceSteps = signal<string[]>([]);
  newSequenceStepText = signal('');

  setActivityType(type: number) {
    this.activityType.set(type);
  }

  // --- Opciones Múltiples ---
  addQuestion() {
    if (this.newQuestionText().trim()) {
      this.checklistQuestions.update(qs => [...qs, { text: this.newQuestionText(), isCorrect: false }]);
      this.newQuestionText.set('');
    }
  }

  removeQuestion(index: number) {
    this.checklistQuestions.update(qs => qs.filter((_, i) => i !== index));
  }

  toggleCorrect(index: number) {
    this.checklistQuestions.update(qs =>
      qs.map((q, i) => ({ ...q, isCorrect: i === index }))
    );
  }

  // --- Secuencias ---
  addSequenceStep() {
    if (this.newSequenceStepText().trim()) {
      this.sequenceSteps.update(ss => [...ss, this.newSequenceStepText()]);
      this.newSequenceStepText.set('');
    }
  }

  removeSequenceStep(index: number) {
    this.sequenceSteps.update(ss => ss.filter((_, i) => i !== index));
  }

  // --- Guardar ---
  saveConfiguration() {
    const id = 'act_' + Date.now();
    let specificConfig: any = {};

    const type = this.activityType();

    if ([1,2,4,7,8].includes(type)) {
      specificConfig = { targetWord: this.flashcardWord(), imageUrl: this.flashcardImageUrl() };
    } else if ([3,9,10].includes(type)) {
      const options = this.checklistQuestions().map(q => q.text);
      const correctIndex = this.checklistQuestions().findIndex(q => q.isCorrect);
      specificConfig = { question: this.checklistMainQ(), options, correctIndex: correctIndex >= 0 ? correctIndex : 0 };
    } else if (type === 5) {
      specificConfig = { question: this.iaPrompt() };
    } else if (type === 11) {
      // El orden en que el maestro los ingresa ES el orden correcto
      specificConfig = { question: this.sequenceMainQ(), steps: this.sequenceSteps() };
    }

    const saved = this.configService.saveActivity({
      id,
      title: this.activityTitle(),
      dimension: this.dimension(),
      activityType: type,
      config: specificConfig,
      createdAt: new Date()
    });

    if (saved) {
      // Limpiar formulario para crear otra
      this.activityTitle.set('');
      this.flashcardWord.set('');
      this.flashcardImageUrl.set('');
      this.checklistMainQ.set('');
      this.checklistQuestions.set([]);
      this.iaPrompt.set('');
      this.sequenceMainQ.set('');
      this.sequenceSteps.set([]);
      // Navegar al engine para probar
      this.router.navigate(['/actividades/engine', id]);
    }
  }
}
