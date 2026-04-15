import { Component, input, output, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FonemaItem {
  fonema: string;
  word: string;
  imageUrl: string;
  wordPosition: 'INICIAL' | 'MEDIA' | 'FINAL';
}

interface FonemaItemResult {
  fonema: string;
  word: string;
  result: 'SIN_ERROR' | 'OMISION' | 'SUSTITUCION' | 'DISTORSION';
  errorPosition: 'INICIAL' | 'MEDIA' | 'FINAL' | null;
  timeSeconds: number;
  helpLevel: number;
  observation: string;
}

type EvalResult = 'SIN_ERROR' | 'OMISION' | 'SUSTITUCION' | 'DISTORSION';
type ErrorPos = 'INICIAL' | 'MEDIA' | 'FINAL';

@Component({
  selector: 'app-fonema-renderer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fonema-renderer.html',
  styleUrl: './fonema-renderer.css'
})
export class FonemaRendererComponent implements OnInit, OnDestroy {
  config = input<any>();
  resultSaved = output<any>();

  phase = signal<'EVALUATING' | 'PROFILE'>('EVALUATING');
  currentIndex = signal(0);
  savedResults = signal<FonemaItemResult[]>([]);

  currentEval = signal<EvalResult | null>(null);
  currentErrorPos = signal<ErrorPos | null>(null);
  currentHelpLevel = signal<number | null>(null);
  currentObservation = signal('');

  timerSeconds = signal(0);
  private intervalId: any;

  helpLevelLabels = ['Ninguno', 'Supervisión', 'Motivación verbal', 'Modelado', 'Guía física', 'Préstamo de voz'];
  helpLevelRange = [0, 1, 2, 3, 4, 5];

  get items(): FonemaItem[] {
    return this.config()?.items ?? [];
  }

  get currentItem(): FonemaItem | null {
    const idx = this.currentIndex();
    return idx < this.items.length ? this.items[idx] : null;
  }

  get totalItems(): number {
    return this.items.length;
  }

  get profile(): { consolidados: string[]; requierenIntervencion: string[] } {
    const fonemaStatus = new Map<string, boolean>();
    this.savedResults().forEach(r => {
      const prevFailed = fonemaStatus.has(r.fonema) && !fonemaStatus.get(r.fonema);
      if (!prevFailed) {
        fonemaStatus.set(r.fonema, r.result === 'SIN_ERROR');
      }
    });
    const consolidados: string[] = [];
    const requierenIntervencion: string[] = [];
    fonemaStatus.forEach((ok, f) => (ok ? consolidados : requierenIntervencion).push(f));
    return { consolidados, requierenIntervencion };
  }

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  private startTimer(): void {
    clearInterval(this.intervalId);
    this.timerSeconds.set(0);
    this.intervalId = setInterval(() => this.timerSeconds.update(v => v + 1), 1000);
  }

  private stopTimer(): void {
    clearInterval(this.intervalId);
  }

  setEval(val: EvalResult): void {
    this.currentEval.set(val);
    if (val === 'SIN_ERROR') this.currentErrorPos.set(null);
  }

  setErrorPos(pos: ErrorPos): void {
    this.currentErrorPos.set(pos);
  }

  setHelpLevel(level: number): void {
    this.currentHelpLevel.set(this.currentHelpLevel() === level ? null : level);
  }

  needsErrorPos(): boolean {
    const e = this.currentEval();
    return e !== null && e !== 'SIN_ERROR';
  }

  canProceed(): boolean {
    if (!this.currentEval()) return false;
    if (this.needsErrorPos() && !this.currentErrorPos()) return false;
    if (this.currentHelpLevel() === null) return false;
    return true;
  }

  proceed(): void {
    if (!this.canProceed() || !this.currentItem) return;
    this.stopTimer();

    const result: FonemaItemResult = {
      fonema: this.currentItem.fonema,
      word: this.currentItem.word,
      result: this.currentEval()!,
      errorPosition: this.currentErrorPos(),
      timeSeconds: this.timerSeconds(),
      helpLevel: this.currentHelpLevel()!,
      observation: this.currentObservation()
    };

    this.savedResults.update(r => [...r, result]);

    if (this.currentIndex() + 1 >= this.totalItems) {
      this.phase.set('PROFILE');
    } else {
      this.currentIndex.update(i => i + 1);
      this.currentEval.set(null);
      this.currentErrorPos.set(null);
      this.currentHelpLevel.set(null);
      this.currentObservation.set('');
      this.startTimer();
    }
  }

  finalize(): void {
    this.resultSaved.emit({
      phonemeGroup: this.config()?.phonemeGroup ?? '',
      results: this.savedResults(),
      profile: this.profile
    });
  }

  formattedTime(): string {
    const s = this.timerSeconds();
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  }

  resultLabel(r: string): string {
    const map: Record<string, string> = {
      SIN_ERROR: 'Sin Error', OMISION: 'Omisión',
      SUSTITUCION: 'Sustitución', DISTORSION: 'Distorsión'
    };
    return map[r] ?? r;
  }
}
