import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-observation-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="observation-container">
      <div class="obs-header" (click)="toggleOpen()">
        <span class="obs-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="title-icon"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          Notas Clínicas Temporales
        </span>
        <button class="obs-toggle-btn">
          <svg *ngIf="!isOpen()" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          <svg *ngIf="isOpen()" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
        </button>
      </div>
      <div class="obs-body" *ngIf="isOpen()">
        <textarea 
          [(ngModel)]="tempNote" 
          placeholder="Anota comportamientos compensatorios, estrategias propias del analizado o contexto de la evaluación de manera cualitativa..."
          class="obs-textarea">
        </textarea>
        <div class="obs-footer-actions">
           <button class="obs-save-btn" (click)="saveNote()">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
             Archivar Observación
           </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .observation-container {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      margin-top: 1rem;
      transition: all 0.3s ease;
    }
    .obs-header {
      padding: 0.85rem 1.25rem;
      background: linear-gradient(to right, #f8fafc, #f1f5f9);
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }
    .obs-title {
      font-weight: 700;
      color: #334155;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .title-icon {
      color: #0ea5e9;
    }
    .obs-toggle-btn {
      background: transparent;
      border: none;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      border-radius: 6px;
    }
    .obs-toggle-btn:hover { background: #e2e8f0; color: #0f172a; }
    .obs-body {
      padding: 1.25rem;
      border-top: 1px solid #e2e8f0;
      animation: slideDown 0.3s ease-out forwards;
    }
    .obs-textarea {
      width: 100%;
      min-height: 110px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 1rem;
      font-family: inherit;
      resize: vertical;
      font-size: 0.95rem;
      color: #1e293b;
      background: #f8fafc;
      transition: all 0.2s;
    }
    .obs-textarea:focus {
      outline: none;
      border-color: #0ea5e9;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
    }
    .obs-footer-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 0.75rem;
    }
    .obs-save-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
      padding: 0.6rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .obs-save-btn:hover { 
      background: #0ea5e9; 
      color: white;
      border-color: #0284c7;
      box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.3);
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ObservationInputComponent {
  isOpen = signal(false);
  tempNote = '';
  noteSaved = output<string>();

  toggleOpen() {
    this.isOpen.update(v => !v);
  }

  saveNote() {
    if (this.tempNote.trim()) {
      this.noteSaved.emit(this.tempNote);
      alert('Nota guardada temporalmente (Mock)');
      this.tempNote = '';
      this.isOpen.set(false);
    }
  }
}
