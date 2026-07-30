import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../core/services/student.service';
import { CanalizationService } from '../../core/services/canalization.service';
import { CatalogService } from '../../core/services/catalog.service';
import { MaterialService } from '../../core/services/material.service';
import { AssignmentService } from '../../core/services/assignment.service';
import { DocenteService } from '../../core/services/docente.service';
import {
  StudentListItem,
  CanalizationListItem,
  CanalizationStatus,
  MaterialListItem,
  AttentionArea,
  Asignacion,
  AsignacionAlumnoItem,
  StudentHistorial
} from '../../core/models/api-models';

@Component({
  selector: 'app-docente-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container animate-fade-in">
      <header class="dashboard-header">
        <div>
          <h1 class="page-title">Panel del Docente</h1>
          <p class="page-subtitle">Gestión y seguimiento de alumnos, actividades asignadas y solicitudes de canalización.</p>
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
        <div class="stat-card">
          <div class="stat-icon-wrapper bg-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-600"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-value text-emerald-600">{{ misAsignaciones().length }}</span>
            <span class="stat-label">Actividades Asignadas</span>
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
                    <button class="btn-action" title="Ver Expediente" (click)="abrirExpediente(student)">
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

        <section class="section-card span-2">
          <div class="section-header">
            <h2 class="section-title">Catálogo de Actividades (por especialistas)</h2>
          </div>
          <div class="filters-row">
            <select class="filter-select" [(ngModel)]="filterAreaId" (ngModelChange)="loadCatalogo()">
              <option [ngValue]="undefined">Todas las áreas de apoyo</option>
              <option *ngFor="let a of attentionAreas()" [ngValue]="+a.id">{{ a.name }}</option>
            </select>
            <select class="filter-select" [(ngModel)]="filterNivel" (ngModelChange)="loadCatalogo()">
              <option [ngValue]="undefined">Todos los niveles de desempeño</option>
              <option value="INICIAL">Inicial</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="LOGRADO">Logrado</option>
            </select>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Área de Apoyo</th>
                  <th>Nivel</th>
                  <th class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="catalogo().length === 0">
                  <td colspan="5" class="empty-state">No hay actividades publicadas que coincidan con el filtro.</td>
                </tr>
                <tr *ngFor="let m of catalogo()">
                  <td class="font-medium text-gray-800">{{ m.titulo }}</td>
                  <td>{{ m.tipoNombre }}</td>
                  <td>{{ getAreaName(m.attentionAreaId) }}</td>
                  <td>{{ getNivelLabel(m.nivelDesempeno) }}</td>
                  <td class="text-right">
                    <button class="btn-action" (click)="openAsignarModal(m)">Asignar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="section-card span-2">
          <div class="section-header">
            <h2 class="section-title">Mis Asignaciones</h2>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Actividad</th>
                  <th>Fecha límite</th>
                  <th>Alumno</th>
                  <th>Estado</th>
                  <th class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="misAsignaciones().length === 0">
                  <td colspan="5" class="empty-state">No has asignado actividades todavía.</td>
                </tr>
                <ng-container *ngFor="let a of misAsignaciones()">
                  <tr *ngFor="let al of a.alumnos">
                    <td class="font-medium text-gray-800">{{ a.material.titulo }}</td>
                    <td>{{ a.fechaLimite ? (a.fechaLimite | date:'dd/MM/yyyy') : 'Sin fecha' }}</td>
                    <td>{{ getStudentName(al.alumnoId) }}</td>
                    <td>
                      <span class="badge"
                            [ngClass]="{
                              'badge-yellow': al.estado === 'PENDIENTE',
                              'badge-blue': al.estado === 'EN_PROGRESO',
                              'badge-green': al.estado === 'COMPLETADO' || al.estado === 'EVALUADO'
                            }">
                        {{ getEstadoLabel(al.estado) }}
                      </span>
                    </td>
                    <td class="text-right">
                      <button class="btn-action" (click)="openCalificarModal(al)">
                        {{ al.retroalimentacion ? 'Editar retroalimentación' : 'Calificar' }}
                      </button>
                    </td>
                  </tr>
                </ng-container>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>

    <!-- Modal: asignar actividad -->
    <div class="modal-overlay" *ngIf="showAsignarModal()">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Asignar "{{ materialAAsignar()?.titulo }}"</h3>
          <button class="close-btn" (click)="closeAsignarModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Alumnos</label>
            <div class="student-checklist">
              <label *ngFor="let s of students" class="student-check-item">
                <input type="checkbox" [checked]="selectedStudentIds.has(s.id)" (change)="toggleStudent(s.id)">
                {{ s.name }} {{ s.fatherLastName }}
              </label>
              <p *ngIf="students.length === 0" class="empty-state">No tienes alumnos inscritos.</p>
            </div>
          </div>
          <div class="form-group">
            <label>Fecha límite (opcional)</label>
            <input type="date" class="form-input" [(ngModel)]="asignarFechaLimite" [ngModelOptions]="{standalone: true}">
          </div>
          <div class="form-group">
            <label>Instrucciones (opcional)</label>
            <textarea class="form-input" rows="3" [(ngModel)]="asignarInstrucciones" [ngModelOptions]="{standalone: true}"></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" (click)="closeAsignarModal()">Cancelar</button>
            <button type="button" class="btn-primary" [disabled]="selectedStudentIds.size === 0 || asignarSaving()" (click)="confirmAsignar()">
              Asignar a {{ selectedStudentIds.size }} alumno(s)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: calificar / retroalimentación -->
    <div class="modal-overlay" *ngIf="showCalificarModal()">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Retroalimentación</h3>
          <button class="close-btn" (click)="closeCalificarModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Retroalimentación para el alumno</label>
            <textarea class="form-input" rows="4" [(ngModel)]="calificarTexto" [ngModelOptions]="{standalone: true}"></textarea>
          </div>
          <div class="form-group">
            <label>Calificación / observaciones (opcional)</label>
            <input type="text" class="form-input" [(ngModel)]="calificarNota" [ngModelOptions]="{standalone: true}">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" (click)="closeCalificarModal()">Cancelar</button>
            <button type="button" class="btn-primary" [disabled]="!calificarTexto.trim() || calificarSaving()" (click)="confirmCalificar()">Guardar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: expediente del alumno (historial, área de apoyo, PDF) -->
    <div class="modal-overlay" *ngIf="showExpedienteModal()">
      <div class="modal-box modal-box-lg">
        <div class="modal-header">
          <h3>Expediente de {{ expedienteAlumno()?.name }} {{ expedienteAlumno()?.fatherLastName }}</h3>
          <button class="close-btn" (click)="closeExpedienteModal()">×</button>
        </div>
        <div class="modal-body">
          <p *ngIf="loadingExpediente()" class="empty-state">Cargando expediente...</p>

          <div *ngIf="!loadingExpediente() && expedienteHistorial() as h">
            <div class="info-section">
              <h4>Área de apoyo identificada</h4>
              <p *ngIf="h.attentionAreas.length === 0" class="empty-state-inline">Sin áreas de apoyo registradas.</p>
              <div class="tag-row">
                <span class="badge badge-purple" *ngFor="let a of h.attentionAreas">{{ a.attentionAreaName }}</span>
              </div>
            </div>

            <div class="info-section">
              <h4>Discapacidades / diagnósticos</h4>
              <p *ngIf="h.disabilities.length === 0" class="empty-state-inline">Sin diagnósticos registrados.</p>
              <ul class="plain-list">
                <li *ngFor="let d of h.disabilities">{{ d.disabilityName }} <span class="text-gray-500">({{ d.schoolYearName }})</span></li>
              </ul>
            </div>

            <div class="info-section">
              <h4>Historial de inscripciones</h4>
              <ul class="plain-list">
                <li *ngFor="let r of h.student.registrations">{{ r.schoolYearName }} — {{ r.groupName }} ({{ r.schoolName }})</li>
              </ul>
            </div>
          </div>

          <p *ngIf="!loadingExpediente() && !expedienteHistorial()" class="empty-state">No se pudo cargar el historial de este alumno.</p>

          <div class="modal-footer">
            <button type="button" class="btn-ghost" (click)="closeExpedienteModal()">Cerrar</button>
            <button type="button" class="btn-primary" [disabled]="descargandoPdf()" (click)="descargarPdfExpediente()">
              {{ descargandoPdf() ? 'Descargando...' : 'Descargar reporte PDF' }}
            </button>
          </div>
        </div>
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

    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .dashboard-container { padding: 1.5rem; max-width: 1600px; margin: 0 auto; color: var(--gray-800); font-family: system-ui, -apple-system, sans-serif; }
    @media (min-width: 768px) { .dashboard-container { padding: 2rem; } }

    .dashboard-header { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
    @media (min-width: 768px) { .dashboard-header { flex-direction: row; justify-content: space-between; align-items: flex-end; } }

    .page-title { font-size: 1.875rem; font-weight: 800; color: var(--gray-900); margin: 0 0 0.5rem 0; line-height: 1.2; }
    .page-subtitle { color: var(--gray-500); font-size: 1rem; margin: 0; }

    .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; background-color: var(--primary); color: white; border: none; padding: 0.625rem 1.25rem; border-radius: 0.5rem; font-weight: 500; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-sm); }
    .btn-primary:hover { background-color: var(--primary-hover); transform: translateY(-1px); box-shadow: var(--shadow-md); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .btn-text { background: transparent; border: none; color: var(--primary); font-weight: 600; font-size: 0.875rem; cursor: pointer; padding: 0.5rem; border-radius: 0.375rem; transition: background 0.2s; }
    .btn-text:hover { background: var(--gray-100); color: var(--primary-hover); }

    .btn-ghost { background: transparent; border: 1px solid var(--gray-300); padding: 0.6rem 1.1rem; border-radius: 8px; cursor: pointer; }

    .btn-action { display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem; background: white; border: 1px solid var(--gray-200); color: var(--gray-700); padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-sm); }
    .btn-action:hover { background: var(--gray-50); border-color: var(--gray-300); color: var(--gray-900); }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--gray-100); display: flex; align-items: center; gap: 1.25rem; transition: transform 0.2s, box-shadow 0.2s; }
    .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .stat-icon-wrapper { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .bg-emerald-100 { background-color: #d1fae5; } .text-emerald-600 { color: #059669; }
    .bg-amber-100 { background-color: #fef3c7; } .text-amber-600 { color: #d97706; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 2.25rem; font-weight: 800; line-height: 1.1; }
    .stat-label { color: var(--gray-500); font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.25rem; }

    .dashboard-content { display: grid; grid-template-columns: 1fr; gap: 2rem; }
    @media (min-width: 1024px) { .dashboard-content { grid-template-columns: 1fr 1fr; } }
    .span-2 { grid-column: 1 / -1; }

    .section-card { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--gray-100); overflow: hidden; display: flex; flex-direction: column; }
    .section-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--gray-100); display: flex; justify-content: space-between; align-items: center; background-color: #ffffff; }
    .section-title { font-size: 1.125rem; font-weight: 700; color: var(--gray-900); margin: 0; }

    .filters-row { display: flex; gap: 0.75rem; padding: 1rem 1.5rem 0; }
    .filter-select { padding: 0.5rem 0.75rem; border: 1px solid var(--gray-300); border-radius: 8px; font-size: 0.875rem; }

    .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; flex: 1; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; white-space: nowrap; }
    .data-table th { padding: 0.875rem 1.5rem; background-color: var(--gray-50); font-size: 0.75rem; font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--gray-200); }
    .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--gray-100); font-size: 0.875rem; color: var(--gray-600); vertical-align: middle; }
    .data-table tbody tr:last-child td { border-bottom: none; }
    .data-table tbody tr:hover { background-color: #f8fafc; }

    .user-cell { display: flex; align-items: center; gap: 0.75rem; }
    .user-avatar { width: 32px; height: 32px; border-radius: 50%; background-color: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; letter-spacing: 1px; }

    .font-medium { font-weight: 500; }
    .text-gray-800 { color: var(--gray-800); }
    .text-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; letter-spacing: 0.5px; }
    .text-right { text-align: right; }

    .max-w-xs { max-width: 250px; }
    .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-block; vertical-align: middle; }

    .empty-state { text-align: center; padding: 3rem !important; color: var(--gray-500); }

    .badge { display: inline-flex; align-items: center; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; line-height: 1.25; }
    .badge-blue { background-color: #dbeafe; color: #1e40af; }
    .badge-pink { background-color: #fce7f3; color: #be185d; }
    .badge-purple { background-color: #f3e8ff; color: #7e22ce; }
    .badge-yellow { background-color: #fef3c7; color: #d97706; }
    .badge-green { background-color: #d1fae5; color: #059669; }
    .badge-red { background-color: #fee2e2; color: #dc2626; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-box { background: white; border-radius: 12px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--gray-100); }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--gray-500); }
    .modal-body { padding: 1.5rem; }
    .form-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.35rem; }
    .form-input { padding: 0.6rem 0.75rem; border: 1px solid var(--gray-300); border-radius: 8px; font-size: 0.9rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
    .student-checklist { max-height: 200px; overflow-y: auto; border: 1px solid var(--gray-200); border-radius: 8px; padding: 0.5rem; }
    .student-check-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.25rem; font-size: 0.9rem; }

    .modal-box-lg { max-width: 640px; }
    .info-section { margin-bottom: 1.25rem; }
    .info-section h4 { font-size: 0.85rem; font-weight: 700; color: var(--gray-700); margin: 0 0 0.5rem; text-transform: uppercase; letter-spacing: 0.03em; }
    .tag-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .plain-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.9rem; color: var(--gray-700); }
    .empty-state-inline { color: var(--gray-500); font-size: 0.85rem; margin: 0; }
  `]
})
export class DocenteDashboard implements OnInit {
  studentService = inject(StudentService);
  canalizationService = inject(CanalizationService);
  catalogService = inject(CatalogService);
  materialService = inject(MaterialService);
  assignmentService = inject(AssignmentService);
  docenteService = inject(DocenteService);

  // Expose enum to template
  Status = CanalizationStatus;

  students: StudentListItem[] = [];
  canalizations: CanalizationListItem[] = [];

  attentionAreas = signal<AttentionArea[]>([]);
  catalogo = signal<MaterialListItem[]>([]);
  misAsignaciones = signal<Asignacion[]>([]);
  activeSchoolYearId?: number;

  filterAreaId?: number;
  filterNivel?: string;

  // Modal: asignar
  showAsignarModal = signal(false);
  materialAAsignar = signal<MaterialListItem | null>(null);
  selectedStudentIds = new Set<string>();
  asignarFechaLimite = '';
  asignarInstrucciones = '';
  asignarSaving = signal(false);

  // Modal: calificar
  showCalificarModal = signal(false);
  calificandoItem = signal<AsignacionAlumnoItem | null>(null);
  calificarTexto = '';
  calificarNota = '';
  calificarSaving = signal(false);

  // Modal: expediente del alumno
  showExpedienteModal = signal(false);
  expedienteAlumno = signal<StudentListItem | null>(null);
  expedienteHistorial = signal<StudentHistorial | null>(null);
  loadingExpediente = signal(false);
  descargandoPdf = signal(false);

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
    this.catalogService.getAttentionAreas().subscribe(res => this.attentionAreas.set(res));
    this.catalogService.getSchoolYears(true).subscribe(res => {
      if (res.length > 0) this.activeSchoolYearId = +res[0].id;
    });
    this.loadCatalogo();
    this.loadMisAsignaciones();
  }

  loadCatalogo() {
    this.materialService.getMateriales({
      attentionAreaId: this.filterAreaId,
      nivelDesempeno: this.filterNivel
    }).subscribe(res => this.catalogo.set(res));
  }

  loadMisAsignaciones() {
    this.assignmentService.getMisAsignaciones().subscribe(res => this.misAsignaciones.set(res));
  }

  getStatusLabel(status: CanalizationStatus): string {
    switch(status) {
      case CanalizationStatus.Pendiente: return 'Pendiente';
      case CanalizationStatus.Activa: return 'Atendida';
      case CanalizationStatus.Cerrada: return 'Rechazada';
      default: return 'Desconocido';
    }
  }

  getAreaName(attentionAreaId?: number): string {
    if (!attentionAreaId) return '—';
    return this.attentionAreas().find(a => +a.id === attentionAreaId)?.name || '—';
  }

  getNivelLabel(nivel?: string): string {
    switch (nivel) {
      case 'INICIAL': return 'Inicial';
      case 'EN_PROCESO': return 'En proceso';
      case 'LOGRADO': return 'Logrado';
      default: return '—';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_PROGRESO': return 'En progreso';
      case 'COMPLETADO': return 'Completado';
      case 'EVALUADO': return 'Evaluado';
      default: return estado;
    }
  }

  getStudentName(alumnoId: string): string {
    const s = this.students.find(st => st.id === alumnoId);
    return s ? `${s.name} ${s.fatherLastName}` : alumnoId;
  }

  // ---- Asignar ----

  openAsignarModal(material: MaterialListItem) {
    this.materialAAsignar.set(material);
    this.selectedStudentIds.clear();
    this.asignarFechaLimite = '';
    this.asignarInstrucciones = '';
    this.showAsignarModal.set(true);
  }

  closeAsignarModal() {
    this.showAsignarModal.set(false);
  }

  toggleStudent(studentId: string) {
    if (this.selectedStudentIds.has(studentId)) {
      this.selectedStudentIds.delete(studentId);
    } else {
      this.selectedStudentIds.add(studentId);
    }
  }

  confirmAsignar() {
    const material = this.materialAAsignar();
    if (!material || this.selectedStudentIds.size === 0) return;

    if (!this.activeSchoolYearId) {
      alert('No hay un ciclo escolar activo configurado.');
      return;
    }

    this.asignarSaving.set(true);
    this.assignmentService.createAsignacion({
      materialId: material.id,
      alumnosIds: Array.from(this.selectedStudentIds),
      cicloId: this.activeSchoolYearId,
      fechaLimite: this.asignarFechaLimite || undefined,
      instrucciones: this.asignarInstrucciones || undefined
    }).subscribe({
      next: () => {
        this.asignarSaving.set(false);
        this.closeAsignarModal();
        this.loadMisAsignaciones();
        alert('Actividad asignada exitosamente.');
      },
      error: (err) => {
        this.asignarSaving.set(false);
        alert(err.error?.message || 'No se pudo asignar la actividad.');
      }
    });
  }

  // ---- Calificar ----

  openCalificarModal(item: AsignacionAlumnoItem) {
    this.calificandoItem.set(item);
    this.calificarTexto = item.retroalimentacion || '';
    this.calificarNota = '';
    this.showCalificarModal.set(true);
  }

  closeCalificarModal() {
    this.showCalificarModal.set(false);
  }

  confirmCalificar() {
    const item = this.calificandoItem();
    if (!item || !this.calificarTexto.trim()) return;

    this.calificarSaving.set(true);
    this.assignmentService.setRetroalimentacion(item.id, {
      retroalimentacion: this.calificarTexto,
      calificacionManual: this.calificarNota || undefined
    }).subscribe({
      next: () => {
        this.calificarSaving.set(false);
        this.closeCalificarModal();
        this.loadMisAsignaciones();
      },
      error: (err) => {
        this.calificarSaving.set(false);
        alert(err.error?.message || 'No se pudo guardar la retroalimentación.');
      }
    });
  }

  abrirExpediente(student: StudentListItem) {
    this.expedienteAlumno.set(student);
    this.expedienteHistorial.set(null);
    this.showExpedienteModal.set(true);
    this.loadingExpediente.set(true);

    this.docenteService.getHistorial(student.id).subscribe({
      next: (data) => {
        this.expedienteHistorial.set(data);
        this.loadingExpediente.set(false);
      },
      error: () => this.loadingExpediente.set(false)
    });
  }

  closeExpedienteModal() {
    this.showExpedienteModal.set(false);
    this.expedienteAlumno.set(null);
    this.expedienteHistorial.set(null);
  }

  descargarPdfExpediente() {
    const student = this.expedienteAlumno();
    if (!student) return;

    this.descargandoPdf.set(true);
    const nombreArchivo = `reporte-${student.name}-${student.fatherLastName}.pdf`.replace(/\s+/g, '_');
    this.docenteService.descargarReportePdf(student.id, nombreArchivo).subscribe({
      next: () => this.descargandoPdf.set(false),
      error: () => {
        this.descargandoPdf.set(false);
        alert('No se pudo descargar el reporte.');
      }
    });
  }
}
