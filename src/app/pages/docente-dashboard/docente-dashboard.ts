import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../core/services/student.service';
import { CanalizationService } from '../../core/services/canalization.service';
import { StudentListItem, CanalizationListItem, CanalizationStatus } from '../../core/models/api-models';

@Component({
  selector: 'app-docente-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container animate-fade-in">
      <header class="dashboard-header">
        <div>
          <h1 class="page-title">Panel del Docente</h1>
          <p class="page-subtitle">Gestión y seguimiento de alumnos, inscripciones y solicitudes de canalización.</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Nueva Canalización
          </button>
        </div>
      </header>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-wrapper bg-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-value text-emerald-600">{{ students.length }}</span>
            <span class="stat-label">Mis Alumnos</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper bg-amber-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-value text-amber-600">{{ canalizations.length }}</span>
            <span class="stat-label">Canalizaciones Activas</span>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <section class="section-card">
          <div class="section-header">
            <h2 class="section-title">Mis Alumnos Inscritos</h2>
            <button class="btn-text">Ver todos</button>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>CURP</th>
                  <th>Género</th>
                  <th class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="students.length === 0">
                  <td colspan="4" class="empty-state">
                    No tienes alumnos inscritos actualmente.
                  </td>
                </tr>
                <tr *ngFor="let student of students.slice(0, 10)">
                  <td>
                    <div class="user-cell">
                      <div class="user-avatar">{{ student.name.charAt(0) }}{{ (student.fatherLastName || ' ').charAt(0) }}</div>
                      <span class="font-medium">{{ student.name }} {{ student.fatherLastName }}</span>
                    </div>
                  </td>
                  <td><span class="text-mono">{{ student.curp || 'N/A' }}</span></td>
                  <td>
                    <span class="badge" [ngClass]="student.gender === 1 ? 'badge-blue' : 'badge-pink'">
                      {{ student.gender === 1 ? 'Masculino' : 'Femenino' }}
                    </span>
                  </td>
                  <td class="text-right">
                    <button class="btn-action" title="Ver Expediente">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                      Expediente
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="section-card">
          <div class="section-header">
            <h2 class="section-title">Últimas Canalizaciones</h2>
            <button class="btn-text">Ver historial</button>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Área de Atención</th>
                  <th>Motivo Principal</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="canalizations.length === 0">
                  <td colspan="4" class="empty-state">
                    No hay canalizaciones recientes.
                  </td>
                </tr>
                <tr *ngFor="let canal of canalizations.slice(0, 5)">
                  <td class="font-medium text-gray-800">{{ canal.studentName }}</td>
                  <td>
                    <span class="badge badge-purple">{{ canal.attentionAreaName }}</span>
                  </td>
                  <td>
                    <div class="max-w-xs truncate" [title]="canal.reason || 'Sin motivo'">
                      {{ canal.reason || 'Sin motivo especificado' }}
                    </div>
                  </td>
                  <td>
                    <span class="badge" 
                          [ngClass]="{
                            'badge-yellow': canal.status === Status.Pendiente,
                            'badge-green': canal.status === Status.Activa,
                            'badge-red': canal.status === Status.Cerrada
                          }">
                      {{ getStatusLabel(canal.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    /* Variables y utilidades */
    :host {
      --primary: #4f46e5;
      --primary-hover: #4338ca;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-300: #d1d5db;
      --gray-500: #6b7280;
      --gray-600: #4b5563;
      --gray-700: #374151;
      --gray-800: #1f2937;
      --gray-900: #111827;
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      --radius-lg: 0.75rem;
    }

    /* Animaciones */
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Contenedor Principal */
    .dashboard-container {
      padding: 1.5rem;
      max-width: 1600px;
      margin: 0 auto;
      color: var(--gray-800);
      font-family: system-ui, -apple-system, sans-serif;
    }

    @media (min-width: 768px) {
      .dashboard-container {
        padding: 2rem;
      }
    }

    /* Header */
    .dashboard-header {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    @media (min-width: 768px) {
      .dashboard-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-end;
      }
    }

    .page-title {
      font-size: 1.875rem;
      font-weight: 800;
      color: var(--gray-900);
      margin: 0 0 0.5rem 0;
      line-height: 1.2;
    }

    .page-subtitle {
      color: var(--gray-500);
      font-size: 1rem;
      margin: 0;
    }

    /* Botones */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background-color: var(--primary);
      color: white;
      border: none;
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: var(--shadow-sm);
    }
    .btn-primary:hover {
      background-color: var(--primary-hover);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    .btn-text {
      background: transparent;
      border: none;
      color: var(--primary);
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.375rem;
      transition: background 0.2s;
    }
    .btn-text:hover {
      background: var(--gray-100);
      color: var(--primary-hover);
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      background: white;
      border: 1px solid var(--gray-200);
      color: var(--gray-700);
      padding: 0.375rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: var(--shadow-sm);
    }
    .btn-action:hover {
      background: var(--gray-50);
      border-color: var(--gray-300);
      color: var(--gray-900);
    }

    /* Tarjetas de Estadísticas */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-100);
      display: flex;
      align-items: center;
      gap: 1.25rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .stat-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .bg-emerald-100 { background-color: #d1fae5; }
    .text-emerald-600 { color: #059669; }
    .bg-amber-100 { background-color: #fef3c7; }
    .text-amber-600 { color: #d97706; }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 2.25rem;
      font-weight: 800;
      line-height: 1.1;
    }

    .stat-label {
      color: var(--gray-500);
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 0.25rem;
    }

    /* Grid de Contenido (Tablas) */
    .dashboard-content {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    @media (min-width: 1024px) {
      .dashboard-content {
        grid-template-columns: 1fr 1fr;
      }
    }

    .section-card {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-100);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .section-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #ffffff;
    }

    .section-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--gray-900);
      margin: 0;
    }

    /* Tablas */
    .table-responsive {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      flex: 1;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      white-space: nowrap;
    }

    .data-table th {
      padding: 0.875rem 1.5rem;
      background-color: var(--gray-50);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--gray-200);
    }

    .data-table td {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);
      font-size: 0.875rem;
      color: var(--gray-600);
      vertical-align: middle;
    }

    .data-table tbody tr:last-child td {
      border-bottom: none;
    }

    .data-table tbody tr:hover {
      background-color: #f8fafc;
    }

    /* Utilidades de celdas */
    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .font-medium { font-weight: 500; }
    .text-gray-800 { color: var(--gray-800); }
    .text-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; letter-spacing: 0.5px; }
    .text-right { text-align: right; }
    
    .max-w-xs { max-width: 250px; }
    .truncate { 
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: inline-block;
      vertical-align: middle;
    }

    .empty-state {
      text-align: center;
      padding: 3rem !important;
      color: var(--gray-500);
    }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      line-height: 1.25;
    }

    .badge-blue { background-color: #dbeafe; color: #1e40af; }
    .badge-pink { background-color: #fce7f3; color: #be185d; }
    .badge-purple { background-color: #f3e8ff; color: #7e22ce; }
    
    .badge-yellow { background-color: #fef3c7; color: #d97706; }
    .badge-green { background-color: #d1fae5; color: #059669; }
    .badge-red { background-color: #fee2e2; color: #dc2626; }
  `]
})
export class DocenteDashboard implements OnInit {
  studentService = inject(StudentService);
  canalizationService = inject(CanalizationService);

  // Expose enum to template
  Status = CanalizationStatus;

  students: StudentListItem[] = [];
  canalizations: CanalizationListItem[] = [];

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.studentService.getStudents().subscribe(res => {
      this.students = res;
    });
    this.canalizationService.getCanalizations().subscribe(res => {
      this.canalizations = res;
    });
  }

  getStatusLabel(status: CanalizationStatus): string {
    switch(status) {
      case CanalizationStatus.Pendiente: return 'Pendiente';
      case CanalizationStatus.Activa: return 'Atendida';
      case CanalizationStatus.Cerrada: return 'Rechazada';
      default: return 'Desconocido';
    }
  }
}

