import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-specialist-reports-mockup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './specialist-reports-mockup.html',
  styleUrl: './specialist-reports-mockup.css',
})
export class SpecialistReportsMockup {
  activeTab = 'overview';
  
  reports = [
    { id: 'overview', name: 'Vista General', icon: 'activity' },
    { id: 'students', name: 'Seguimiento de Alumnos', icon: 'users' },
    { id: 'cie', name: 'Evaluaciones CIE', icon: 'file-text' },
    { id: 'tea', name: 'Alertas TEA', icon: 'alert-triangle' },
    { id: 'activities', name: 'Rendimiento Actividades', icon: 'award' }
  ];

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
