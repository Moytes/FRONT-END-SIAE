import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  StudentHistorial,
  EstadoAsignacion
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
          <button class="btn-primary" (click)="openCanalizacionModal()">
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
            <span class="stat-value text-emerald-600">{{ students().length }}</span>
            <span class="stat-label">Mis Alumnos</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper bg-amber-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-value text-amber-600">{{ canalizations().length }}</span>
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
            <button class="btn-text" *ngIf="students().length > 10" (click)="showAllStudents.set(!showAllStudents())">
              {{ showAllStudents() ? 'Ver menos' : 'Ver todos' }}
            </button>
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
                <tr *ngIf="students().length === 0">
                  <td colspan="4" class="empty-state">
                    No tienes alumnos inscritos actualmente.
                  </td>
                </tr>
                <tr *ngFor="let student of (showAllStudents() ? students() : students().slice(0, 10))">
                  <td>
                    <div class="user-cell">
                      <div class="user-avatar">{{ student.name.charAt(0) }}{{ (student.fatherLastName || ' ').charAt(0) }}</div>
                      <span class="font-medium">{{ student.name }} {{ student.fatherLastName }} {{ student.motherLastName }}</span>
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
            <button class="btn-text" *ngIf="canalizations().length > 5" (click)="showAllCanalizations.set(!showAllCanalizations())">
              {{ showAllCanalizations() ? 'Ver menos' : 'Ver historial' }}
            </button>
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
                <tr *ngIf="canalizations().length === 0">
                  <td colspan="4" class="empty-state">
                    No hay canalizaciones recientes.
                  </td>
                </tr>
                <tr *ngFor="let canal of (showAllCanalizations() ? canalizations() : canalizations().slice(0, 5))">
                  <td class="font-medium text-gray-800">{{ canal.alumnoNombre }}</td>
                  <td>
                    <span class="badge badge-purple">{{ canal.areaNombre }}</span>
                  </td>
                  <td>
                    <div class="max-w-xs">
                      {{ canal.motivo || 'Sin motivo especificado' }}
                    </div>
                  </td>
                  <td>
                    <span class="badge"
                          [ngClass]="{
                            'badge-yellow': canal.estado === Status.Pendiente,
                            'badge-blue': canal.estado === Status.Recibida,
                            'badge-purple': canal.estado === Status.EnProceso,
                            'badge-green': canal.estado === Status.Cerrada
                          }">
                      {{ getStatusLabel(canal.estado) }}
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
            <input type="search" class="filter-select filter-search" placeholder="Buscar por palabra clave..."
                   [(ngModel)]="filterQ" (ngModelChange)="onFilterQChange()" [ngModelOptions]="{standalone: true}">
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
                <tr *ngFor="let m of catalogo()" class="catalogo-row">
                  <td class="font-medium text-gray-800">{{ m.titulo }}</td>
                  <td><span class="badge badge-blue">{{ m.tipoNombre }}</span></td>
                  <td><span class="badge badge-purple">{{ getAreaName(m.attentionAreaId) }}</span></td>
                  <td><span class="badge" [ngClass]="nivelBadgeClass(m.nivelDesempeno)">{{ getNivelLabel(m.nivelDesempeno) }}</span></td>
                  <td class="text-right">
                    <div class="row-actions">
                      <button class="btn-action" (click)="openDetalleModal(m)">Ver detalle</button>
                      <button class="btn-action btn-action-primary" (click)="openAsignarModal(m)">Asignar</button>
                    </div>
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
                      <select class="form-input estado-select"
                              [ngModel]="al.estado"
                              (ngModelChange)="cambiarEstadoAsignacion(al, $event)"
                              [ngModelOptions]="{standalone: true}">
                        <option *ngFor="let e of estadosAsignacion" [ngValue]="e">{{ getEstadoLabel(e) }}</option>
                      </select>
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

    <!-- Modal: nueva canalización -->
    <div class="modal-overlay" *ngIf="showCanalizacionModal()">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Nueva Canalización</h3>
          <button class="close-btn" (click)="closeCanalizacionModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Alumno</label>
            <select class="form-input" [(ngModel)]="canalizacionAlumnoId" [ngModelOptions]="{standalone: true}" required>
              <option value="" disabled>Seleccionar alumno...</option>
              <option *ngFor="let s of students()" [ngValue]="s.id">{{ s.name }} {{ s.fatherLastName }} {{ s.motherLastName }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Área de atención</label>
            <select class="form-input" [(ngModel)]="canalizacionAreaId" [ngModelOptions]="{standalone: true}">
              <option [ngValue]="undefined">Sin especificar</option>
              <option *ngFor="let a of attentionAreas()" [ngValue]="+a.id">{{ a.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Motivo (obligatorio)</label>
            <textarea class="form-input" rows="3" [(ngModel)]="canalizacionMotivo" [ngModelOptions]="{standalone: true}"></textarea>
          </div>
          <div class="form-group">
            <label>Acciones en el aula (opcional)</label>
            <textarea class="form-input" rows="2" [(ngModel)]="canalizacionAccionesAula" [ngModelOptions]="{standalone: true}"></textarea>
          </div>
          <p *ngIf="!activeSchoolYearId" class="empty-state-inline">No hay ciclo escolar activo.</p>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" (click)="closeCanalizacionModal()">Cancelar</button>
            <button type="button" class="btn-primary"
                    [disabled]="!canalizacionAlumnoId || !canalizacionMotivo.trim() || !activeSchoolYearId || canalizacionSaving()"
                    (click)="confirmCanalizacion()">
              {{ canalizacionSaving() ? 'Guardando...' : 'Registrar canalización' }}
            </button>
          </div>
        </div>
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
            <label>Alumnos <span class="label-count" *ngIf="selectedStudentIds.size > 0">({{ selectedStudentIds.size }} seleccionado{{ selectedStudentIds.size === 1 ? '' : 's' }})</span></label>
            <div class="student-checklist">
              <label *ngFor="let s of students()" class="student-check-item">
                <input type="checkbox" [checked]="selectedStudentIds.has(s.id)" (change)="toggleStudent(s.id)">
                {{ s.name }} {{ s.fatherLastName }} {{ s.motherLastName }}
              </label>
              <p *ngIf="students().length === 0" class="empty-state">No tienes alumnos inscritos.</p>
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

    <!-- Modal: detalle de actividad del catálogo -->
    <div class="modal-overlay" *ngIf="showDetalleModal()">
      <div class="modal-box modal-box-lg" *ngIf="materialDetalle() as m">
        <div class="modal-header modal-header-detalle">
          <div>
            <h3>{{ m.titulo }}</h3>
            <div class="detalle-badges">
              <span class="badge badge-blue">{{ m.tipoNombre }}</span>
              <span class="badge badge-purple">{{ getAreaName(m.attentionAreaId) }}</span>
              <span class="badge" [ngClass]="nivelBadgeClass(m.nivelDesempeno)">{{ getNivelLabel(m.nivelDesempeno) }}</span>
            </div>
          </div>
          <button class="close-btn" (click)="closeDetalleModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="detalle-meta" *ngIf="m.duracionEstimadaMin || m.perfilRecomendado">
            <div class="detalle-meta-item" *ngIf="m.duracionEstimadaMin">
              <span class="info-label">Duración estimada</span>
              <span class="info-value">⏱ {{ m.duracionEstimadaMin }} min</span>
            </div>
            <div class="detalle-meta-item" *ngIf="m.perfilRecomendado">
              <span class="info-label">Perfil recomendado</span>
              <span class="info-value">{{ m.perfilRecomendado }}</span>
            </div>
          </div>
          <div class="detalle-block" *ngIf="m.descripcion">
            <h4>Descripción</h4>
            <p class="detail-text">{{ m.descripcion }}</p>
          </div>
          <div class="detalle-block detalle-block-blue" *ngIf="m.instruccionesAplicacion">
            <h4>Instrucciones de aplicación</h4>
            <p class="detail-text">{{ m.instruccionesAplicacion }}</p>
          </div>
          <div class="detalle-block detalle-block-purple" *ngIf="m.materialesNecesarios">
            <h4>Materiales necesarios</h4>
            <p class="detail-text">{{ m.materialesNecesarios }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" (click)="closeDetalleModal()">Cerrar</button>
            <button type="button" class="btn-primary" (click)="asignarDesdeDetalle()">Asignar a alumnos</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: expediente del alumno (historial, área de apoyo, PDF) -->
    <div class="modal-overlay" *ngIf="showExpedienteModal()">
      <div class="modal-box modal-box-lg">
        <div class="modal-header">
          <h3>Expediente de {{ expedienteAlumno()?.name }} {{ expedienteAlumno()?.fatherLastName }} {{ expedienteAlumno()?.motherLastName }}</h3>
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

            <div class="info-section">
              <h4>Evaluaciones (resumen)</h4>
              <p *ngIf="!(h.evaluacionesResumen?.length)" class="empty-state-inline">Sin evaluaciones registradas.</p>
              <ul class="plain-list" *ngIf="h.evaluacionesResumen?.length">
                <li *ngFor="let ev of h.evaluacionesResumen">
                  {{ ev.fecha | date:'dd/MM/yyyy' }} — {{ ev.tipo }}
                  <span class="text-gray-500" *ngIf="ev.estado">({{ ev.estado }})</span>
                </li>
              </ul>
            </div>

            <div class="info-section">
              <h4>Observaciones del docente</h4>
              <p *ngIf="!(h.observaciones?.length)" class="empty-state-inline">Sin observaciones registradas.</p>
              <ul class="obs-list" *ngIf="h.observaciones?.length">
                <li *ngFor="let obs of h.observaciones" class="obs-item">
                  <div class="obs-meta">
                    <span class="font-medium">{{ obs.docenteNombre || 'Docente' }}</span>
                    <span class="text-gray-500">{{ obs.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <p class="detail-text">{{ obs.texto }}</p>
                </li>
              </ul>
              <div class="form-group obs-form">
                <label>Nueva observación</label>
                <textarea class="form-input" rows="3" [(ngModel)]="nuevaObservacionTexto" [ngModelOptions]="{standalone: true}"></textarea>
                <button type="button" class="btn-primary obs-save"
                        [disabled]="!nuevaObservacionTexto.trim() || observacionSaving()"
                        (click)="guardarObservacion()">
                  {{ observacionSaving() ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </div>

            <div class="info-section">
              <h4>Plan de acción / Actividades asignadas</h4>
              <p *ngIf="!(h.actividades?.length)" class="empty-state-inline">Sin actividades asignadas registradas.</p>
              <div class="table-responsive" *ngIf="h.actividades?.length">
                <table class="data-table compact-table">
                  <thead>
                    <tr>
                      <th>Actividad</th>
                      <th>Asignación</th>
                      <th>Límite</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let act of h.actividades">
                      <td class="font-medium">{{ act.materialTitulo }}</td>
                      <td>{{ act.fechaAsignacion | date:'dd/MM/yyyy' }}</td>
                      <td>{{ act.fechaLimite ? (act.fechaLimite | date:'dd/MM/yyyy') : '—' }}</td>
                      <td>
                        <span class="badge" [ngClass]="getEstadoBadgeClass(act.estado)">{{ getEstadoLabel(act.estado) }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
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

    .dashboard-header {
      display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;
      padding: 1.5rem 1.75rem; border-radius: 20px;
      background: rgba(255, 255, 255, 0.55);
      -webkit-backdrop-filter: blur(20px) saturate(150%);
      backdrop-filter: blur(20px) saturate(150%);
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
    }
    @media (min-width: 768px) { .dashboard-header { flex-direction: row; justify-content: space-between; align-items: flex-end; } }

    .page-title { font-size: 1.875rem; font-weight: 800; color: #111111; margin: 0 0 0.5rem 0; line-height: 1.2; }
    .page-subtitle { color: #111111; font-size: 1rem; margin: 0; }

    .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; background-color: var(--primary); color: white; border: none; padding: 0.625rem 1.25rem; border-radius: 0.5rem; font-weight: 500; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-sm); }
    .btn-primary:hover {
      background-color: var(--primary-hover); transform: translateY(-1px); box-shadow: var(--shadow-md);
      -webkit-backdrop-filter: blur(8px) saturate(150%); backdrop-filter: blur(8px) saturate(150%);
      box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4);
    }
    .btn-primary:active { transform: translateY(0); }
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

    /* Una sola columna siempre: "Mis Alumnos Inscritos" y "Últimas Canalizaciones" apiladas,
       cada una a todo el ancho disponible, en vez de partir la pantalla a la mitad. */
    .dashboard-content { display: grid; grid-template-columns: 1fr; gap: 2rem; }
    .span-2 { grid-column: 1 / -1; }

    .section-card { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--gray-100); overflow: hidden; display: flex; flex-direction: column; }
    .section-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--gray-100); display: flex; justify-content: space-between; align-items: center; background-color: #ffffff; }
    .section-title { font-size: 1.125rem; font-weight: 700; color: var(--gray-900); margin: 0; }

    .filters-row { display: flex; flex-wrap: wrap; gap: 0.75rem; padding: 1rem 1.5rem 0; }
    .filter-select { padding: 0.5rem 0.75rem; border: 1px solid var(--gray-300); border-radius: 8px; font-size: 0.875rem; }
    .filter-search { flex: 1; min-width: 200px; }

    .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; flex: 1; }
    /* white-space:nowrap vivía en .data-table completo: forzaba nombres/motivos largos a
       una sola línea, así que contra el ancho fijo de la tarjeta se veían cortados en vez
       de acomodarse. Se deja nowrap solo en los encabezados (cortos, en mayúsculas) y se
       permite wrap normal en el contenido de las celdas. */
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { padding: 0.875rem 1.5rem; background-color: var(--gray-50); font-size: 0.75rem; font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--gray-200); white-space: nowrap; }
    .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--gray-100); font-size: 0.875rem; color: var(--gray-600); vertical-align: middle; white-space: normal; }
    .data-table tbody tr:last-child td { border-bottom: none; }
    .data-table tbody tr:hover { background-color: #f8fafc; }

    /* Catálogo de actividades: más aire por fila (antes 1rem) y Tipo/Área/Nivel como badges
       en vez de texto plano pegado, para que no se lean todos los valores corridos uno tras
       otro. Los botones de acción pasan de apilados-sin-espacio a una fila con separación y
       "Asignar" como acción primaria (rellena) frente a "Ver detalle" secundaria. */
    .catalogo-row td { padding-top: 1.15rem; padding-bottom: 1.15rem; }
    .row-actions { display: inline-flex; align-items: center; gap: 0.5rem; }
    .btn-action-primary { background: var(--primary); border-color: var(--primary); color: white; }
    .btn-action-primary:hover { background: #4338ca; border-color: #4338ca; color: white; }

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
    /* El body global de la app pinta texto blanco (pensado para el fondo oscuro del login) y
       se hereda aquí si no se fija un color explícito — el título quedaba blanco sobre el
       modal blanco, invisible salvo al seleccionarlo con el mouse. */
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--gray-100); }
    .modal-header h3 { margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--gray-900); }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--gray-500); }
    .modal-body { padding: 1.5rem; }
    /* Mismo bug del body global (color: #ffffff) heredado por labels y texto plano de los
       formularios de estos modales — "Alumnos", "Fecha límite", los nombres del checklist,
       etc. quedaban blancos sobre el modal blanco. */
    .form-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group label { color: var(--gray-700); font-weight: 600; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.03em; }
    .label-count { color: var(--primary); font-weight: 700; text-transform: none; letter-spacing: normal; }
    .form-input { padding: 0.6rem 0.75rem; border: 1px solid var(--gray-300); border-radius: 8px; font-size: 0.9rem; color: var(--gray-900); }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
    .student-checklist { max-height: 220px; overflow-y: auto; border: 1px solid var(--gray-200); border-radius: 8px; padding: 0.4rem; display: flex; flex-direction: column; gap: 0.15rem; }
    .student-check-item { display: flex; align-items: center; gap: 0.65rem; padding: 0.5rem 0.6rem; font-size: 0.9rem; color: var(--gray-800); border-radius: 8px; cursor: pointer; transition: background-color 0.15s; }
    .student-check-item:hover { background-color: var(--gray-50); }
    .student-check-item input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer; }

    .modal-box-lg { max-width: 640px; }
    .info-section { margin-bottom: 1.25rem; }
    .info-section h4 { font-size: 0.85rem; font-weight: 700; color: var(--gray-700); margin: 0 0 0.5rem; text-transform: uppercase; letter-spacing: 0.03em; }
    .tag-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .plain-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.9rem; color: var(--gray-700); }
    .empty-state-inline { color: var(--gray-500); font-size: 0.85rem; margin: 0; }
    .detail-text { font-size: 0.9rem; color: var(--gray-700); margin: 0; white-space: pre-wrap; }

    /* Detalle de actividad (modal "ver más" del catálogo) */
    .modal-header-detalle { align-items: flex-start; background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%); }
    .modal-header-detalle h3 { margin-bottom: 0.55rem; }
    .detalle-badges { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .detalle-meta { display: flex; flex-wrap: wrap; gap: 1.5rem; padding: 0.85rem 1rem; margin-bottom: 1.25rem; background: var(--gray-50); border-radius: 10px; border: 1px solid var(--gray-100); }
    .detalle-meta-item { display: flex; flex-direction: column; gap: 0.15rem; }
    .info-label { font-size: 0.7rem; font-weight: 700; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.04em; }
    .info-value { font-size: 0.9rem; color: var(--gray-800); font-weight: 500; }
    .detalle-block { margin-bottom: 1.1rem; padding: 0.85rem 1rem; border-radius: 10px; background: var(--gray-50); border-left: 3px solid var(--gray-300); }
    .detalle-block h4 { font-size: 0.78rem; font-weight: 700; color: var(--gray-600); margin: 0 0 0.4rem; text-transform: uppercase; letter-spacing: 0.04em; }
    .detalle-block-blue { background: #eff6ff; border-left-color: #3b82f6; }
    .detalle-block-blue h4 { color: #1d4ed8; }
    .detalle-block-purple { background: #f5f3ff; border-left-color: #8b5cf6; }
    .detalle-block-purple h4 { color: #7c3aed; }
    .compact-table { margin-top: 0.35rem; }
    .estado-select { max-width: 11rem; padding: 0.35rem 0.5rem; font-size: 0.85rem; }
    .obs-list { list-style: none; padding: 0; margin: 0 0 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .obs-item { border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.65rem 0.85rem; }
    .obs-meta { display: flex; justify-content: space-between; gap: 0.5rem; font-size: 0.85rem; margin-bottom: 0.35rem; }
    .obs-form { margin-top: 0.5rem; }
    .obs-save { margin-top: 0.5rem; }
  `]
})
export class DocenteDashboard implements OnInit {
  canalizationService = inject(CanalizationService);
  catalogService = inject(CatalogService);
  materialService = inject(MaterialService);
  assignmentService = inject(AssignmentService);
  docenteService = inject(DocenteService);

  // Expose enum to template
  Status = CanalizationStatus;

  // La app usa detección de cambios zoneless: mutar estas dos como propiedades planas
  // dentro del callback async de loadData() no garantiza un re-render (dependía de que
  // OTRA señal se actualizara después y arrastrara un CD pass que las revelara de rebote —
  // por eso "canalizations" a veces sí pintaba y "students" no, según qué llamada ganara
  // la carrera de red). Señales explícitas.
  students = signal<StudentListItem[]>([]);
  canalizations = signal<CanalizationListItem[]>([]);

  showAllStudents = signal(false);
  showAllCanalizations = signal(false);

  attentionAreas = signal<AttentionArea[]>([]);
  catalogo = signal<MaterialListItem[]>([]);
  misAsignaciones = signal<Asignacion[]>([]);
  activeSchoolYearId?: number;

  filterAreaId?: number;
  filterNivel?: string;
  filterQ = '';
  private filterQTimer?: ReturnType<typeof setTimeout>;

  // Modal: detalle catálogo
  showDetalleModal = signal(false);
  materialDetalle = signal<MaterialListItem | null>(null);

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
  nuevaObservacionTexto = '';
  observacionSaving = signal(false);

  readonly estadosAsignacion: EstadoAsignacion[] = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADO', 'EVALUADO'];

  showCanalizacionModal = signal(false);
  canalizacionAlumnoId = '';
  canalizacionAreaId?: number;
  canalizacionMotivo = '';
  canalizacionAccionesAula = '';
  canalizacionSaving = signal(false);

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.docenteService.getAlumnos().subscribe(res => {
      this.students.set(res);
    });
    this.canalizationService.getCanalizations().subscribe(res => {
      this.canalizations.set(res);
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
      nivelDesempeno: this.filterNivel,
      q: this.filterQ.trim() || undefined
    }).subscribe(res => this.catalogo.set(res));
  }

  onFilterQChange() {
    if (this.filterQTimer) clearTimeout(this.filterQTimer);
    this.filterQTimer = setTimeout(() => this.loadCatalogo(), 350);
  }

  openDetalleModal(material: MaterialListItem) {
    this.materialDetalle.set(material);
    this.showDetalleModal.set(true);
  }

  closeDetalleModal() {
    this.showDetalleModal.set(false);
    this.materialDetalle.set(null);
  }

  asignarDesdeDetalle() {
    const m = this.materialDetalle();
    if (!m) return;
    this.closeDetalleModal();
    this.openAsignarModal(m);
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'badge-yellow';
      case 'EN_PROGRESO': return 'badge-blue';
      case 'COMPLETADO':
      case 'EVALUADO': return 'badge-green';
      default: return 'badge-purple';
    }
  }

  loadMisAsignaciones() {
    this.assignmentService.getMisAsignaciones().subscribe(res => this.misAsignaciones.set(res));
  }

  getStatusLabel(status: CanalizationStatus): string {
    switch(status) {
      case CanalizationStatus.Pendiente: return 'Pendiente';
      case CanalizationStatus.Recibida: return 'Recibida';
      case CanalizationStatus.EnProceso: return 'En proceso';
      case CanalizationStatus.Cerrada: return 'Cerrada';
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

  nivelBadgeClass(nivel?: string): string {
    switch (nivel) {
      case 'INICIAL': return 'badge-yellow';
      case 'EN_PROCESO': return 'badge-blue';
      case 'LOGRADO': return 'badge-green';
      default: return 'badge-pink';
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
    const s = this.students().find(st => st.id === alumnoId);
    return s ? `${s.name} ${s.fatherLastName} ${s.motherLastName || ''}`.trim() : alumnoId;
  }

  // ---- Canalización ----

  openCanalizacionModal() {
    this.canalizacionAlumnoId = '';
    this.canalizacionAreaId = undefined;
    this.canalizacionMotivo = '';
    this.canalizacionAccionesAula = '';
    this.showCanalizacionModal.set(true);
  }

  closeCanalizacionModal() {
    if (this.canalizacionSaving()) return;
    this.showCanalizacionModal.set(false);
  }

  confirmCanalizacion() {
    if (!this.canalizacionAlumnoId || !this.canalizacionMotivo.trim() || !this.activeSchoolYearId) return;

    this.canalizacionSaving.set(true);
    this.canalizationService.createCanalization({
      alumnoId: this.canalizacionAlumnoId,
      cicloId: this.activeSchoolYearId,
      areaCanaliza: this.canalizacionAreaId,
      motivo: this.canalizacionMotivo.trim(),
      accionesAula: this.canalizacionAccionesAula.trim() || undefined
    }).subscribe({
      next: () => {
        this.canalizacionSaving.set(false);
        this.closeCanalizacionModal();
        this.canalizationService.getCanalizations().subscribe(res => {
          this.canalizations.set(res);
        });
        alert('Canalización registrada correctamente.');
      },
      error: err => {
        this.canalizacionSaving.set(false);
        alert(err.error?.message || 'No se pudo registrar la canalización.');
      }
    });
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
    this.nuevaObservacionTexto = '';
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

  private reloadExpedienteHistorial() {
    const student = this.expedienteAlumno();
    if (!student) return;
    this.docenteService.getHistorial(student.id).subscribe({
      next: (data) => this.expedienteHistorial.set(data),
      error: () => {}
    });
  }

  guardarObservacion() {
    const student = this.expedienteAlumno();
    const texto = this.nuevaObservacionTexto.trim();
    if (!student || !texto) return;

    this.observacionSaving.set(true);
    this.docenteService.addObservacion(student.id, {
      texto,
      schoolYearId: this.activeSchoolYearId
    }).subscribe({
      next: () => {
        this.observacionSaving.set(false);
        this.nuevaObservacionTexto = '';
        this.reloadExpedienteHistorial();
      },
      error: (err) => {
        this.observacionSaving.set(false);
        alert(err.error?.message || 'No se pudo guardar la observación.');
      }
    });
  }

  cambiarEstadoAsignacion(item: AsignacionAlumnoItem, estado: EstadoAsignacion) {
    if (item.estado === estado) return;
    const prev = item.estado;
    item.estado = estado;
    this.assignmentService.setEstado(item.id, estado).subscribe({
      next: () => this.loadMisAsignaciones(),
      error: (err) => {
        item.estado = prev;
        alert(err.error?.message || 'No se pudo actualizar el estado.');
      }
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
