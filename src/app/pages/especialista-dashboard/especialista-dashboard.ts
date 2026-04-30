import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanalizationService } from '../../core/services/canalization.service';
import { PsychoService } from '../../core/services/psycho.service';
import { CieService } from '../../core/services/cie.service';
import { CanalizationListItem, PsychoeducationalAssessmentListItem, CIEEvaluationListItem } from '../../core/models/api-models';

@Component({
  selector: 'app-especialista-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Panel del Especialista</h1>
        <p>Bandeja de canalizaciones, evaluaciones psicopedagógicas y tests especializados.</p>
      </header>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{{ pendingCanalizations.length }}</span>
          <span class="stat-label">Canalizaciones Pendientes</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ assessments.length }}</span>
          <span class="stat-label">Evaluaciones Realizadas</span>
        </div>
      </div>

      <section class="section-container">
        <h2>Bandeja de Canalizaciones Recibidas</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Solicitante</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let canal of pendingCanalizations">
                <td>{{ canal.studentName }}</td>
                <td>{{ canal.requesterName }}</td>
                <td>{{ canal.createdAt | date:'dd/MM/yyyy' }}</td>
                <td><button class="btn-action">Atender</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="section-container">
        <h2>Últimas Evaluaciones Psicopedagógicas</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Ciclo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ass of assessments.slice(0, 5)">
                <td>{{ ass.studentName }}</td>
                <td>{{ ass.schoolYearName }}</td>
                <td>{{ ass.status }}</td>
                <td><button class="btn-action">Editar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 2rem; }
    .dashboard-header { margin-bottom: 2rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .stat-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; }
    .stat-value { font-size: 2.5rem; font-weight: 700; color: #f59e0b; }
    .stat-label { color: #6b7280; font-size: 0.875rem; }
    .section-container { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 2rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th { text-align: left; padding: 0.75rem; border-bottom: 2px solid #f3f4f6; color: #374151; }
    td { padding: 0.75rem; border-bottom: 1px solid #f3f4f6; color: #4b5563; }
    .btn-action { background: #e5e7eb; border: none; padding: 0.5rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
    .btn-action:hover { background: #d1d5db; }
  `]
})
export class EspecialistaDashboard implements OnInit {
  canalizationService = inject(CanalizationService);
  psychoService = inject(PsychoService);
  cieService = inject(CieService);

  pendingCanalizations: CanalizationListItem[] = [];
  assessments: PsychoeducationalAssessmentListItem[] = [];

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.canalizationService.getCanalizations(0).subscribe(res => { // 0 = Pendiente
      this.pendingCanalizations = res;
    });
    this.psychoService.getAssessments().subscribe(res => {
      this.assessments = res;
    });
  }
}
