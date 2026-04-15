import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PragItem  { id: string; text: string; }
interface PragCat   { id: string; label: string; icon: string; items: PragItem[]; }

const CATEGORIES: PragCat[] = [
  {
    id: 'deixis', label: 'Deixis y Gestos', icon: '👁️',
    items: [
      { id: 'd1', text: 'Voltea la cabeza hacia la persona que le habla' },
      { id: 'd2', text: 'Dirige su mirada hacia la persona que le habla' },
      { id: 'd3', text: 'Dirige su mirada hacia personas u objetos conocidos cuando son nombrados' },
      { id: 'd4', text: 'Señala con el dedo índice para pedir o mostrar algo' },
      { id: 'd5', text: 'Sigue la dirección de la mirada o señalamiento de otra persona' },
      { id: 'd6', text: 'Niega o afirma con movimiento de su cabeza' },
    ]
  },
  {
    id: 'paralingüistico', label: 'Aspectos Paralingüísticos', icon: '🔉',
    items: [
      { id: 'p1', text: 'Modula el volumen de su voz según el contexto' },
      { id: 'p2', text: 'Ajusta la velocidad del habla a la situación' },
      { id: 'p3', text: 'Usa entonación para expresar emociones (pregunta, exclamación)' },
      { id: 'p4', text: 'Mantiene una distancia apropiada al hablar con otros' },
      { id: 'p5', text: 'Usa gestos faciales para acompañar el mensaje' },
    ]
  },
  {
    id: 'primitivas', label: 'Intenciones Comunicativas Primitivas', icon: '🤲',
    items: [
      { id: 'i1', text: 'Pide un objeto con gesto o seña' },
      { id: 'i2', text: 'Da objetos cuando se le piden' },
      { id: 'i3', text: 'Expresa necesidad (ir al baño, comer, salir)' },
      { id: 'i4', text: 'Llama la atención de otra persona' },
      { id: 'i5', text: 'Rechaza o protesta ante una situación no deseada' },
      { id: 'i6', text: 'Imita acciones o vocalizaciones del interlocutor' },
    ]
  },
  {
    id: 'gramatical', label: 'Intenciones Comunicativas Basadas en Forma Gramatical', icon: '💬',
    items: [
      { id: 'g1', text: 'Saluda y se despide (hola, adiós)' },
      { id: 'g2', text: 'Usa fórmulas de cortesía (gracias, por favor, con permiso)' },
      { id: 'g3', text: 'Responde a preguntas cerradas (sí / no)' },
      { id: 'g4', text: 'Responde a preguntas abiertas (¿qué?, ¿dónde?, ¿quién?)' },
      { id: 'g5', text: 'Inicia una conversación' },
      { id: 'g6', text: 'Mantiene el tema de conversación' },
      { id: 'g7', text: 'Cierra o termina una conversación apropiadamente' },
    ]
  }
];

const SCALE_LABELS = ['No observado', 'En inicio', 'En proceso', 'Logrado'];
const SCALE_COLORS = ['neutral', 'inicio', 'proceso', 'logrado'];

interface ProfileItem { itemText: string; catLabel: string; score: number; }

@Component({
  selector: 'app-pragmatica-renderer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pragmatica-renderer.html',
  styleUrl:    './pragmatica-renderer.css'
})
export class PragmaticaRendererComponent {
  config      = input<any>();
  resultSaved = output<any>();

  phase        = signal<'EVALUATING' | 'PROFILE'>('EVALUATING');
  catIndex     = signal(0);

  // scores: itemId → 0|1|2|3|null
  scores       = signal<Record<string, number | null>>({});
  // observations per category id
  observations = signal<Record<string, string>>({});

  readonly categories = CATEGORIES;
  readonly scaleLabels = SCALE_LABELS;
  readonly scaleColors = SCALE_COLORS;
  readonly scaleRange  = [0, 1, 2, 3];

  get currentCat(): PragCat { return CATEGORIES[this.catIndex()]; }
  get totalCats(): number   { return CATEGORIES.length; }

  getScore(itemId: string): number | null {
    return this.scores()[itemId] ?? null;
  }

  setScore(itemId: string, val: number): void {
    this.scores.update(s => ({ ...s, [itemId]: val }));
  }

  getObs(catId: string): string {
    return this.observations()[catId] ?? '';
  }

  setObs(catId: string, val: string): void {
    this.observations.update(o => ({ ...o, [catId]: val }));
  }

  // All items in current category scored?
  catComplete(): boolean {
    return this.currentCat.items.every(it => this.getScore(it.id) !== null);
  }

  proceed(): void {
    if (!this.catComplete()) return;
    if (this.catIndex() + 1 >= this.totalCats) {
      this.phase.set('PROFILE');
    } else {
      this.catIndex.update(i => i + 1);
    }
  }

  // ---- Profile calculations ----
  catScore(cat: PragCat): number {
    return cat.items.reduce((sum, it) => sum + (this.scores()[it.id] ?? 0), 0);
  }

  catMax(cat: PragCat): number { return cat.items.length * 3; }

  get totalScore(): number {
    return CATEGORIES.reduce((sum, cat) => sum + this.catScore(cat), 0);
  }

  get totalMax(): number {
    return CATEGORIES.reduce((sum, cat) => sum + this.catMax(cat), 0);
  }

  get totalPercent(): number {
    return Math.round((this.totalScore / this.totalMax) * 100);
  }

  get priorities(): ProfileItem[] {
    const all: ProfileItem[] = [];
    CATEGORIES.forEach(cat =>
      cat.items.forEach(it => all.push({
        itemText: it.text,
        catLabel: cat.label,
        score: this.scores()[it.id] ?? 0
      }))
    );
    return all.sort((a, b) => a.score - b.score).slice(0, 2);
  }

  catPercent(cat: PragCat): number {
    return Math.round((this.catScore(cat) / this.catMax(cat)) * 100);
  }

  scoreLabel(s: number | null): string {
    return s !== null ? SCALE_LABELS[s] : '—';
  }

  scoreColor(s: number | null): string {
    return s !== null ? SCALE_COLORS[s] : 'neutral';
  }

  finalize(): void {
    const catResults = CATEGORIES.map(cat => ({
      id:          cat.id,
      label:       cat.label,
      score:       this.catScore(cat),
      maxScore:    this.catMax(cat),
      percent:     this.catPercent(cat),
      observation: this.getObs(cat.id),
      items: cat.items.map(it => ({ id: it.id, text: it.text, score: this.scores()[it.id] ?? 0 }))
    }));

    this.resultSaved.emit({
      totalScore:   this.totalScore,
      totalMax:     this.totalMax,
      totalPercent: this.totalPercent,
      priorities:   this.priorities,
      categories:   catResults
    });
  }
}
