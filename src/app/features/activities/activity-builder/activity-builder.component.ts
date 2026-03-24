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

  // Flashcard Temp State (Act 1, 2, 4, 7, 8)
  flashcardWord = signal('');
  flashcardImageUrl = signal('');
  // For Act 2: second image for pair
  flashcardWord2 = signal('');
  flashcardImageUrl2 = signal('');

  // Checklist / Opciones Múltiples (Act 3, 9, 10)
  checklistMainQ = signal('');
  checklistQuestions = signal<{text: string; isCorrect: boolean}[]>([]);
  newQuestionText = signal('');
  // For Act 9/10: educational level selection
  educationalLevel = signal<'preescolar' | 'primaria' | 'secundaria'>('primaria');

  // Escritura IA (Act 5)
  iaPrompt = signal('');

  // Plan de Acción (Act 6) — no config needed, it generates from history

  // Secuencias (Act 11)
  sequenceMainQ = signal('');
  sequenceSteps = signal<string[]>([]);
  newSequenceStepText = signal('');

  setActivityType(type: number) {
    this.activityType.set(type);
    // Auto-set dimension based on activity type per spec
    const dimMap: Record<number, ActivityDimension> = {
      1: 'FONOLOGIA', 2: 'FONOLOGIA',
      3: 'PRAGMATICA',
      4: 'MORFOSINTAXIS', 5: 'MORFOSINTAXIS',
      6: 'MORFOSINTAXIS',
      7: 'SEMANTICA', 8: 'SEMANTICA',
      9: 'DISCURSOS', 10: 'DISCURSOS',
      11: 'JUEGO'
    };
    if (dimMap[type]) this.dimension.set(dimMap[type]);
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

    if (type === 1 || type === 4 || type === 7 || type === 8) {
      // Standard flashcard
      specificConfig = { targetWord: this.flashcardWord(), imageUrl: this.flashcardImageUrl() };
    } else if (type === 2) {
      // Pares mínimos — two words/images
      specificConfig = {
        targetWord: this.flashcardWord(),
        imageUrl: this.flashcardImageUrl(),
        pairWord: this.flashcardWord2(),
        pairImageUrl: this.flashcardImageUrl2()
      };
    } else if (type === 3) {
      const options = this.checklistQuestions().map(q => q.text);
      const correctIndex = this.checklistQuestions().findIndex(q => q.isCorrect);
      specificConfig = { question: this.checklistMainQ(), options, correctIndex: correctIndex >= 0 ? correctIndex : 0 };
    } else if (type === 5) {
      specificConfig = { question: this.iaPrompt() };
    } else if (type === 6) {
      specificConfig = { title: this.activityTitle() };
    } else if (type === 9 || type === 10) {
      const options = this.checklistQuestions().map(q => q.text);
      const correctIndex = this.checklistQuestions().findIndex(q => q.isCorrect);
      specificConfig = {
        question: this.checklistMainQ(),
        options,
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
        educationalLevel: this.educationalLevel()
      };
    } else if (type === 11) {
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
      // Limpiar formulario
      this.activityTitle.set('');
      this.flashcardWord.set('');
      this.flashcardImageUrl.set('');
      this.flashcardWord2.set('');
      this.flashcardImageUrl2.set('');
      this.checklistMainQ.set('');
      this.checklistQuestions.set([]);
      this.iaPrompt.set('');
      this.sequenceMainQ.set('');
      this.sequenceSteps.set([]);
      // Navegar al engine para probar
      this.router.navigate(['/actividades/engine', id]);
    }
  }

  // Helper method for template
  isFlashcardType(): boolean {
    return [1, 2, 4, 7, 8].includes(this.activityType());
  }

  isChecklistType(): boolean {
    return [3, 9, 10].includes(this.activityType());
  }

  getTypeLabel(type: number): string {
    const labels: Record<number, string> = {
      1: 'Act 1 · Producción de Fonemas',
      2: 'Act 2 · Pares Mínimos',
      3: 'Act 3 · Checklist Pragmática',
      4: 'Act 4 · Tarjetas por Niveles',
      5: 'Act 5 · Análisis IA',
      6: 'Act 6 · Plan de Acción',
      7: 'Act 7 · La Comidita',
      8: 'Act 8 · Preguntas sobre Imagen',
      9: 'Act 9 · Conversación',
      10: 'Act 10 · Argumentación',
      11: 'Act 11 · Estadios de Juego'
    };
    return labels[type] || '';
  }
}
