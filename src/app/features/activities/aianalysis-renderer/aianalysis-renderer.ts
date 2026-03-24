import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HelpLevelSelectorComponent } from '../../../shared/components/help-level-selector/help-level-selector.component';
import { ObservationInputComponent } from '../../../shared/components/observation-input/observation-input.component';

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
  analysisResult = signal<any>(null);
  
  helpLevel = signal<number | null>(null);
  observation = signal<string>('');

  triggerAnalysis() {
    if (!this.transcription().trim()) return;
    this.isAnalyzing.set(true);
    
    // Simulación de latencia de IA para el MVP
    setTimeout(() => {
      this.isAnalyzing.set(false);
      this.analysisResult.set({
        findings: [
          { status: 'warn', text: 'Uso irregular de artículos definidos.' },
          { status: 'ok', text: 'Presencia de verbos transitivos en tiempo presente.' },
          { status: 'warn', text: 'Ausencia de conectores de subordinación.' }
        ]
      });
    }, 2000);
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
