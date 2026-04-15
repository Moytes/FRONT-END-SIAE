import { Component, input, output, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ParMinimo {
  word1: string;
  image1: string;
  word2: string;
  image2: string;
}

interface ParResult {
  word1: string;
  word2: string;
  comprension: 'COMPRENDE' | 'NO_COMPRENDE';
  articulacion: 'CORRECTA' | 'CON_DIFICULTAD' | 'NO_ARTICULA';
  helpLevel: number;
  observation: string;
  timeSeconds: number;
}

type Comprension  = 'COMPRENDE' | 'NO_COMPRENDE';
type Articulacion = 'CORRECTA'  | 'CON_DIFICULTAD' | 'NO_ARTICULA';

@Component({
  selector: 'app-pares-renderer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pares-renderer.html',
  styleUrl:    './pares-renderer.css'
})
export class ParesRendererComponent implements OnInit, OnDestroy {
  config      = input<any>();
  resultSaved = output<any>();

  phase        = signal<'EVALUATING' | 'SUMMARY'>('EVALUATING');
  currentIndex = signal(0);
  savedResults = signal<ParResult[]>([]);

  currentComprension  = signal<Comprension  | null>(null);
  currentArticulacion = signal<Articulacion | null>(null);
  currentHelpLevel    = signal<number | null>(null);
  currentObservation  = signal('');

  timerSeconds = signal(0);
  private intervalId: any;

  helpLevelLabels = ['Ninguno', 'Supervisión', 'Motivación verbal', 'Modelado', 'Guía física', 'Préstamo de voz'];
  helpLevelRange  = [0, 1, 2, 3, 4, 5];

  get pairs(): ParMinimo[] {
    return this.config()?.pairs ?? [];
  }

  get currentPar(): ParMinimo | null {
    const idx = this.currentIndex();
    return idx < this.pairs.length ? this.pairs[idx] : null;
  }

  get totalPairs(): number { return this.pairs.length; }

  get stats() {
    const r = this.savedResults();
    const comprenden  = r.filter(x => x.comprension  === 'COMPRENDE').length;
    const correctas   = r.filter(x => x.articulacion === 'CORRECTA').length;
    const dificultad  = r.filter(x => x.articulacion === 'CON_DIFICULTAD').length;
    const noArticula  = r.filter(x => x.articulacion === 'NO_ARTICULA').length;
    return { comprenden, noComprenden: r.length - comprenden, correctas, dificultad, noArticula };
  }

  ngOnInit(): void   { this.startTimer(); }
  ngOnDestroy(): void { clearInterval(this.intervalId); }

  private startTimer(): void {
    clearInterval(this.intervalId);
    this.timerSeconds.set(0);
    this.intervalId = setInterval(() => this.timerSeconds.update(v => v + 1), 1000);
  }

  private stopTimer(): void { clearInterval(this.intervalId); }

  setComprension (val: Comprension ): void { this.currentComprension.set(val);  }
  setArticulacion(val: Articulacion): void { this.currentArticulacion.set(val); }
  setHelpLevel   (level: number)    : void {
    this.currentHelpLevel.set(this.currentHelpLevel() === level ? null : level);
  }

  canProceed(): boolean {
    return this.currentComprension() !== null &&
           this.currentArticulacion() !== null &&
           this.currentHelpLevel()    !== null;
  }

  proceed(): void {
    if (!this.canProceed() || !this.currentPar) return;
    this.stopTimer();

    const result: ParResult = {
      word1:        this.currentPar.word1,
      word2:        this.currentPar.word2,
      comprension:  this.currentComprension()!,
      articulacion: this.currentArticulacion()!,
      helpLevel:    this.currentHelpLevel()!,
      observation:  this.currentObservation(),
      timeSeconds:  this.timerSeconds()
    };

    this.savedResults.update(r => [...r, result]);

    if (this.currentIndex() + 1 >= this.totalPairs) {
      this.phase.set('SUMMARY');
    } else {
      this.currentIndex.update(i => i + 1);
      this.currentComprension.set(null);
      this.currentArticulacion.set(null);
      this.currentHelpLevel.set(null);
      this.currentObservation.set('');
      this.startTimer();
    }
  }

  finalize(): void {
    this.resultSaved.emit({
      pairSetLabel: this.config()?.pairSetLabel ?? '',
      results:      this.savedResults(),
      stats:        this.stats
    });
  }

  formattedTime(): string {
    const s = this.timerSeconds();
    return `${Math.floor(s / 60).toString().padStart(2,'0')}:${(s % 60).toString().padStart(2,'0')}`;
  }

  articulacionLabel(a: string): string {
    const map: Record<string, string> = {
      CORRECTA: 'Correcta', CON_DIFICULTAD: 'Con dificultad', NO_ARTICULA: 'No articula'
    };
    return map[a] ?? a;
  }

  comprensionLabel(c: string): string {
    return c === 'COMPRENDE' ? 'Comprende' : 'No comprende';
  }
}
