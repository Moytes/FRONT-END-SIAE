import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timer-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timer-wrapper" [class.is-running]="isRunning()">
      <div class="timer-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <div class="time-display">{{ formattedTime() }}</div>
      <div class="timer-actions">
        <button class="action-btn play-btn" *ngIf="!isRunning()" (click)="start()" title="Iniciar Cronómetro">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </button>
        <button class="action-btn pause-btn" *ngIf="isRunning()" (click)="pause()" title="Pausar">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        </button>
        <button class="action-btn reset-btn" (click)="reset()" title="Reiniciar a Cero">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .timer-wrapper {
      display: inline-flex;
      align-items: center;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 50px;
      padding: 0.35rem 0.5rem 0.35rem 1rem;
      gap: 0.75rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .timer-wrapper.is-running {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }
    .timer-icon {
      color: #94a3b8;
      display: flex;
      align-items: center;
    }
    .timer-wrapper.is-running .timer-icon {
      color: #3b82f6;
      animation: pulse 2s infinite;
    }
    .time-display {
      font-size: 1.15rem;
      font-weight: 700;
      color: #334155;
      font-variant-numeric: tabular-nums;
      letter-spacing: 1px;
      min-width: 65px;
      text-align: center;
    }
    .timer-actions {
      display: flex;
      gap: 0.25rem;
    }
    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      background: #f1f5f9;
      color: #64748b;
    }
    .action-btn:hover { background: #e2e8f0; transform: scale(1.05); }
    .play-btn { color: #10b981; }
    .play-btn:hover { background: #d1fae5; color: #059669; }
    .pause-btn { color: #f59e0b; }
    .pause-btn:hover { background: #fef3c7; color: #d97706; }
    .reset-btn:hover { background: #fee2e2; color: #ef4444; }
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.6; }
      100% { opacity: 1; }
    }
  `]
})
export class TimerDisplayComponent implements OnDestroy {
  timeInSeconds = signal(0);
  isRunning = signal(false);
  private intervalId: any;

  formattedTime() {
    const min = Math.floor(this.timeInSeconds() / 60);
    const sec = this.timeInSeconds() % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  start() {
    if (this.isRunning()) return;
    this.isRunning.set(true);
    this.intervalId = setInterval(() => {
      this.timeInSeconds.update(v => v + 1);
    }, 1000);
  }

  pause() {
    this.isRunning.set(false);
    clearInterval(this.intervalId);
  }

  reset() {
    this.pause();
    this.timeInSeconds.set(0);
  }

  ngOnDestroy() {
    this.pause();
  }
}
