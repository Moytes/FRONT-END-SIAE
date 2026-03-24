import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HelpLevelSelectorComponent } from '../../../shared/components/help-level-selector/help-level-selector.component';
import { ObservationInputComponent } from '../../../shared/components/observation-input/observation-input.component';

interface MorphIndicator {
  name: string;
  status: 'detected' | 'in_process' | 'not_observed';
  details: string;
}

@Component({
  selector: 'app-aianalysis-renderer',
  standalone: true,
  imports: [CommonModule, FormsModule, HelpLevelSelectorComponent, ObservationInputComponent],
  templateUrl: './aianalysis-renderer.html',
  styleUrl: './aianalysis-renderer.css',
})
export class AianalysisRenderer {
  config = input<any>();
  resultSaved = output<any>();

  transcription = signal('');
  isAnalyzing = signal(false);
  analysisResult = signal<{ indicators: MorphIndicator[]; priorities: string[]; insufficient: boolean } | null>(null);

  helpLevel = signal<number | null>(null);
  observation = signal<string>('');

  triggerAnalysis() {
    const text = this.transcription().trim();
    if (!text) return;

    // Regla del spec: si el texto tiene menos de 3 palabras
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 3) {
      this.analysisResult.set({
        indicators: [],
        priorities: [],
        insufficient: true
      });
      return;
    }

    this.isAnalyzing.set(true);

    setTimeout(() => {
      this.isAnalyzing.set(false);
      const indicators = this.analyzeMorphosyntax(text);
      const priorities = this.getPriorities(indicators);
      this.analysisResult.set({ indicators, priorities, insufficient: false });
    }, 1800);
  }

  private analyzeMorphosyntax(text: string): MorphIndicator[] {
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);

    // 1. Sustantivos — detectar palabras comunes (mock heurístico)
    const commonNouns = ['perro', 'gato', 'casa', 'mesa', 'niño', 'niña', 'árbol', 'pelota', 'comida', 'agua', 'mamá', 'papá', 'carro', 'flor', 'sol', 'luna', 'pan', 'leche', 'escuela', 'amigo'];
    const foundNouns = words.filter(w => commonNouns.some(n => w.includes(n)));

    // 2. Pronombres personales y posesivos
    const pronouns = ['yo', 'tú', 'él', 'ella', 'nosotros', 'ellos', 'ellas', 'me', 'te', 'se', 'nos', 'mi', 'tu', 'su', 'mío', 'tuyo', 'suyo'];
    const foundPronouns = words.filter(w => pronouns.includes(w));

    // 3. Artículos
    const articles = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'este', 'esta', 'estos', 'estas', 'ese', 'esa'];
    const foundArticles = words.filter(w => articles.includes(w));

    // 4. Palabras interrogativas
    const interrogatives = ['qué', 'quién', 'cómo', 'dónde', 'cuándo', 'por qué', 'cuál', 'cuánto'];
    const foundInterrog = interrogatives.filter(q => lower.includes(q));

    // 5. Verbos (buscar terminaciones comunes)
    const verbEndings = ['ar', 'er', 'ir', 'ó', 'aba', 'ando', 'iendo', 'ado', 'ido', 'é', 'aste', 'amos', 'an', 'es', 'emos'];
    const foundVerbs = words.filter(w => w.length > 2 && verbEndings.some(e => w.endsWith(e)));
    const hasPast = words.some(w => /aba$|ó$|aste$|aron$|ido$|ado$/.test(w));
    const hasFuture = lower.includes('voy a') || lower.includes('va a') || words.some(w => /ré$|rás$|rá$|remos$|rán$/.test(w));
    const verbTime = hasPast ? 'pasado detectado' : hasFuture ? 'futuro detectado' : 'presente detectado';

    // 6. Adjetivos y adverbios
    const adjAdv = ['grande', 'pequeño', 'bonito', 'feo', 'rojo', 'azul', 'verde', 'rápido', 'lento', 'mucho', 'poco', 'muy', 'bien', 'mal', 'aquí', 'allá', 'después', 'antes', 'siempre', 'nunca'];
    const foundAdj = words.filter(w => adjAdv.some(a => w.includes(a)));

    // 7. Tipo de oración
    const hasSubjectVerb = foundNouns.length > 0 && foundVerbs.length > 0;
    const isCompound = lower.includes(' y ') || lower.includes(' pero ') || lower.includes(' porque ') || lower.includes(' que ');

    // 8. Concordancia (simplificado)
    const hasArticleNoun = foundArticles.length > 0 && foundNouns.length > 0;

    // 9. Conectores
    const connectors = ['y', 'o', 'pero', 'porque', 'entonces', 'también', 'además', 'sin embargo', 'aunque', 'cuando'];
    const foundConnectors = connectors.filter(c => lower.includes(` ${c} `) || lower.startsWith(c + ' '));

    const indicators: MorphIndicator[] = [
      {
        name: 'Sustantivos comunes y propios',
        status: foundNouns.length > 0 ? 'detected' : 'not_observed',
        details: foundNouns.length > 0 ? `Encontrados: ${foundNouns.join(', ')}` : 'No se detectaron sustantivos'
      },
      {
        name: 'Pronombres personales y posesivos',
        status: foundPronouns.length > 0 ? 'detected' : 'not_observed',
        details: foundPronouns.length > 0 ? `Encontrados: ${foundPronouns.join(', ')}` : 'No se detectaron pronombres'
      },
      {
        name: 'Artículos definidos, indefinidos y demostrativos',
        status: foundArticles.length > 0 ? 'detected' : foundArticles.length === 0 && words.length > 5 ? 'in_process' : 'not_observed',
        details: foundArticles.length > 0 ? `Encontrados: ${foundArticles.join(', ')}` : 'No se detectaron artículos'
      },
      {
        name: 'Palabras interrogativas',
        status: foundInterrog.length > 0 ? 'detected' : 'not_observed',
        details: foundInterrog.length > 0 ? `Encontradas: ${foundInterrog.join(', ')}` : 'No se detectaron interrogativas'
      },
      {
        name: 'Verbos (tiempo verbal)',
        status: foundVerbs.length > 0 ? 'detected' : 'not_observed',
        details: foundVerbs.length > 0 ? `Encontrados: ${foundVerbs.slice(0, 3).join(', ')} — Tiempo: ${verbTime}` : 'No se detectaron verbos'
      },
      {
        name: 'Adjetivos y adverbios',
        status: foundAdj.length > 0 ? 'detected' : 'not_observed',
        details: foundAdj.length > 0 ? `Encontrados: ${foundAdj.join(', ')}` : 'No se detectaron adjetivos ni adverbios'
      },
      {
        name: 'Tipo de oración (simple/compuesta)',
        status: hasSubjectVerb ? 'detected' : 'in_process',
        details: isCompound ? 'Oración compuesta detectada' : hasSubjectVerb ? 'Oración simple (sujeto + predicado)' : 'Estructura oracional incompleta'
      },
      {
        name: 'Concordancia de género y número',
        status: hasArticleNoun ? 'detected' : 'in_process',
        details: hasArticleNoun ? 'Se observa concordancia entre artículo y sustantivo' : 'No se puede verificar concordancia (faltan artículos o sustantivos)'
      },
      {
        name: 'Conectores de cohesión',
        status: foundConnectors.length > 0 ? 'detected' : 'not_observed',
        details: foundConnectors.length > 0 ? `Encontrados: ${foundConnectors.join(', ')}` : 'No se detectaron conectores de cohesión'
      }
    ];

    return indicators;
  }

  private getPriorities(indicators: MorphIndicator[]): string[] {
    return indicators
      .filter(i => i.status === 'not_observed')
      .slice(0, 2)
      .map(i => `${i.name}: ${i.details}`);
  }

  getStatusIcon(status: string): string {
    if (status === 'detected') return '✅';
    if (status === 'in_process') return '⚠️';
    return '❌';
  }

  getStatusLabel(status: string): string {
    if (status === 'detected') return 'Detectado';
    if (status === 'in_process') return 'En proceso';
    return 'No observado';
  }

  get detectedCount(): number {
    return this.analysisResult()?.indicators.filter(i => i.status === 'detected').length || 0;
  }
  get inProcessCount(): number {
    return this.analysisResult()?.indicators.filter(i => i.status === 'in_process').length || 0;
  }
  get notObservedCount(): number {
    return this.analysisResult()?.indicators.filter(i => i.status === 'not_observed').length || 0;
  }

  canSave(): boolean {
    return this.analysisResult() !== null && this.helpLevel() !== null;
  }

  finish() {
    this.resultSaved.emit({
      transcription: this.transcription(),
      analysis: this.analysisResult(),
      help: this.helpLevel(),
      obs: this.observation()
    });
  }
}
