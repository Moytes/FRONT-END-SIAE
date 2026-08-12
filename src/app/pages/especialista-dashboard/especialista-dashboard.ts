import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CanalizationService } from '../../core/services/canalization.service';
import { PsychoService } from '../../core/services/psycho.service';
import { ReportService } from '../../core/services/report.service';
import { MaterialService } from '../../core/services/material.service';
import { CatalogService } from '../../core/services/catalog.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../services/auth.service';
import {
  CanalizationListItem,
  CanalizationStatus,
  AttendCanalizationRequest,
  PsychoeducationalAssessmentListItem,
  MaterialListItem,
  AddMaterialRequest,
  MaterialType,
  AttentionArea,
  CIESummaryItem,
  TEAAlertItem,
  CitaListItem,
  ScheduleAppointmentRequest
} from '../../core/models/api-models';

type AttendCanalizationForm = Omit<AttendCanalizationRequest, 'derivarAreaId'> & {
  derivarAreaId?: number;
};

@Component({
  selector: 'app-especialista-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-text">
          <h1>Panel del Especialista</h1>
          <p>Revisa canalizaciones, alertas TEA, evaluaciones y el catálogo de actividades de apoyo.</p>
        </div>
        <div class="header-actions">
          <a class="header-link" routerLink="/reportes-especialista" [queryParams]="{tab: 'tea'}">Monitor TEA</a>
          <a class="header-link" routerLink="/reportes-especialista">Centro de Reportes</a>
          <div class="user-chip" *ngIf="currentUser as user">
            <img class="avatar-img" [src]="user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.name + '+' + user.fatherLastName" alt="Avatar de {{ user.name }}">
            <span class="user-name">{{ user.name }} {{ user.fatherLastName }}</span>
          </div>
        </div>
      </header>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon icon-orange">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </div>
          <span class="stat-value">{{ pendingCount() }}</span>
          <span class="stat-label">Canalizaciones Pendientes</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon icon-green">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <span class="stat-value">{{ assessments.length }}</span>
          <span class="stat-label">Evaluaciones Psicopedagógicas</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon icon-blue">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <span class="stat-value">{{ cieCount() }}</span>
          <span class="stat-label">Tests CIE Aplicados</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon icon-red">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8-6.1.1 4.9 3.8-1.8 5.9 5-3.5 5 3.5-1.8-5.9 4.9-3.8-6.1-.1z"/></svg>
          </div>
          <span class="stat-value">{{ teaActiveCount() }}</span>
          <span class="stat-label">Alertas TEA Activas</span>
        </div>
      </div>

      <section class="section-container">
        <div class="section-header">
          <h2>Bandeja de Canalizaciones Recibidas</h2>
          <span class="section-hint">{{ inboxCanalizations().length }} activas</span>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Área</th>
                <th>Solicitante</th>
                <th>Fecha</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let canal of inboxCanalizations()">
                <td>{{ canal.alumnoNombre }}</td>
                <td>{{ canal.areaNombre || '—' }}</td>
                <td>{{ canal.solicitanteNombre || '—' }}</td>
                <td>{{ canal.createdAt | date:'dd/MM/yyyy' }}</td>
                <td class="motivo-cell" [title]="canal.motivo">{{ canal.motivo }}</td>
                <td>
                  <span class="status-pill"
                        [class.pill-yellow]="canal.estado === Status.Pendiente"
                        [class.pill-blue]="canal.estado === Status.Recibida"
                        [class.pill-purple]="canal.estado === Status.EnProceso"
                        [class.pill-green]="canal.estado === Status.Cerrada">
                    {{ getCanalizationStatusLabel(canal.estado) }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button class="btn-action" *ngIf="canal.estado === Status.Pendiente" [disabled]="updatingCanalizationId() === canal.id" (click)="openCanalizationModal(canal)">Atender</button>
                  <button class="btn-action" *ngIf="canal.estado === Status.Recibida || canal.estado === Status.EnProceso" [disabled]="updatingCanalizationId() === canal.id" (click)="cerrarCanalizacion(canal)">Cerrar</button>
                  <a class="btn-action link-action" *ngIf="canal.alumnoId" [routerLink]="['/especialista/alumnos', canal.alumnoId, 'expediente']">Ver expediente</a>
                </td>
              </tr>
              <tr *ngIf="inboxCanalizations().length === 0">
                <td colspan="7" class="empty-row">No tienes canalizaciones pendientes de atender.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="section-container">
        <div class="section-header">
          <h2>Últimas Evaluaciones Psicopedagógicas</h2>
          <button class="btn-primary assessment-button" routerLink="/especialista/evaluaciones/nueva">
            + Nueva Evaluación
          </button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Ciclo</th>
                <th>Estado</th>
                <th>Avance</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ass of assessments.slice(0, 8)">
                <td>{{ ass.studentName }}</td>
                <td>{{ ass.schoolYearName }}</td>
                <td>
                  <span class="status-pill" [ngClass]="getAssessmentStatusClass(ass.status)">
                    {{ getAssessmentStatusLabel(ass.status) }}
                  </span>
                </td>
                <td>
                  <div class="progress-inline">
                    <div class="progress-track"><div class="progress-bar" [style.width.%]="getAssessmentProgress(ass.status)"></div></div>
                    <span>{{ getAssessmentProgress(ass.status) }}%</span>
                  </div>
                </td>
                <td>
                  <button class="btn-action" [routerLink]="['/especialista/evaluaciones', ass.id]">Continuar</button>
                  <a class="btn-action link-action" *ngIf="ass.studentId" [routerLink]="['/especialista/alumnos', ass.studentId, 'expediente']">Ver expediente</a>
                </td>
              </tr>
              <tr *ngIf="assessments.length === 0">
                <td colspan="5" class="empty-row">Aún no hay evaluaciones registradas.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="section-container">
        <div class="section-header">
          <h2>Agenda de citas</h2>
          <button class="btn-primary" (click)="openCitaModal()">+ Agendar Cita</button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cita of upcomingCitas()">
                <td>{{ cita.alumnoNombre }}</td>
                <td>{{ cita.fecha | date:'dd/MM/yyyy' }}</td>
                <td>{{ cita.hora }}</td>
                <td>{{ cita.tipoCita }}</td>
                <td>
                  <span class="status-pill"
                        [class.pill-yellow]="cita.estado === 'PROGRAMADA'"
                        [class.pill-green]="cita.estado === 'REALIZADA'"
                        [class.pill-gray]="cita.estado === 'CANCELADA'">
                    {{ getCitaEstadoLabel(cita.estado) }}
                  </span>
                </td>
                <td class="actions-cell">
                  <select class="estado-select" [ngModel]="cita.estado" (ngModelChange)="changeCitaEstado(cita, $event)"
                          [disabled]="updatingCitaId() === cita.id">
                    <option value="PROGRAMADA">Programada</option>
                    <option value="REALIZADA">Realizada</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                  <a class="btn-action link-action" [routerLink]="['/especialista/alumnos', cita.alumnoId, 'expediente']">Expediente</a>
                </td>
              </tr>
              <tr *ngIf="upcomingCitas().length === 0">
                <td colspan="6" class="empty-row">No hay citas próximas en el rango seleccionado.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="section-container">
        <div class="section-header">
          <h2>Catálogo de Actividades Especializadas</h2>
          <button class="btn-primary" (click)="openMaterialModal()">+ Nueva Actividad</button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Área de Apoyo</th>
                <th>Nivel de Desempeño</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of materiales()">
                <td>{{ m.titulo }}</td>
                <td>{{ m.tipoNombre }}</td>
                <td>{{ getAreaName(m.attentionAreaId) }}</td>
                <td>{{ getNivelLabel(m.nivelDesempeno) }}</td>
                <td>
                  <span class="status-pill" [class.pill-green]="m.publicado" [class.pill-gray]="!m.publicado">
                    {{ m.publicado ? 'Publicado' : 'Borrador' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button class="btn-action" (click)="openMaterialModal(m)">Editar</button>
                  <button class="btn-action" (click)="togglePublicado(m)">
                    {{ m.publicado ? 'Despublicar' : 'Publicar' }}
                  </button>
                  <button class="btn-action btn-danger" (click)="darDeBajaMaterial(m)">Dar de baja</button>
                </td>
              </tr>
              <tr *ngIf="materiales().length === 0">
                <td colspan="6" class="empty-row">Aún no has creado ninguna actividad.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- Modal atender canalización -->
    <div class="modal-overlay canalization-overlay" *ngIf="showCanalizationModal()" role="presentation">
      <section class="modal-box canalization-modal" role="dialog" aria-modal="true" aria-labelledby="attend-modal-title">
        <div class="modal-header">
          <h3 id="attend-modal-title">Atender Canalización</h3>
          <button type="button" class="close-btn close-btn-circle" (click)="closeCanalizationModal()" aria-label="Cerrar">×</button>
        </div>
        <div class="modal-body" *ngIf="selectedCanalization() as canal">
          <div class="student-info-card">
            <div class="student-avatar">{{ getInitials(canal.alumnoNombre) }}</div>
            <div class="student-info">
              <strong>{{ canal.alumnoNombre }}</strong>
              <span>{{ getStudentMeta(canal) }}</span>
            </div>
          </div>

          <p class="canalization-context">
            Solicitado por: <strong>{{ canal.solicitanteNombre || 'Sin especificar' }}</strong>
            <span>·</span> Fecha: <strong>{{ canal.fecha | date:'dd/MM/yyyy' }}</strong>
            <span>·</span> Motivo: <strong>{{ canal.motivo }}</strong>
          </p>

          <form (ngSubmit)="submitCanalization()" #attendFormRef="ngForm">
            <div class="form-row">
              <div class="form-group">
                <label for="tipoAtencion">Tipo de Atención</label>
                <select id="tipoAtencion" name="tipoAtencion" [(ngModel)]="canalizationForm.tipoAtencion" class="form-select" required>
                  <option value="" disabled>Seleccionar...</option>
                  <option value="VALORACION_INICIAL">Valoración inicial</option>
                  <option value="ENTREVISTA">Entrevista</option>
                  <option value="INTERVENCION_INDIVIDUAL">Intervención individual</option>
                  <option value="INTERVENCION_GRUPAL">Intervención grupal</option>
                  <option value="SEGUIMIENTO">Seguimiento</option>
                </select>
              </div>
              <div class="form-group">
                <label for="fechaAtencion">Fecha de Atención</label>
                <input id="fechaAtencion" type="date" name="fechaAtencion" [(ngModel)]="canalizationForm.fechaAtencion" class="form-input" required>
              </div>
            </div>

            <div class="form-group">
              <label for="observacionesClinicas">Observaciones Clínicas Iniciales</label>
              <textarea id="observacionesClinicas" name="observacionesClinicas" [(ngModel)]="canalizationForm.observacionesClinicas"
                        class="form-input clinical-notes" rows="5"
                        placeholder="Describe hallazgos iniciales, antecedentes relevantes y acciones sugeridas..."></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="derivarAreaId">Derivar a</label>
                <select id="derivarAreaId" name="derivarAreaId" [(ngModel)]="canalizationForm.derivarAreaId" class="form-select" required>
                  <option [ngValue]="undefined" disabled>Seleccionar especialidad...</option>
                  <option *ngFor="let area of attentionAreas()" [ngValue]="+area.id">{{ area.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="prioridad">Prioridad</label>
                <select id="prioridad" name="prioridad" [(ngModel)]="canalizationForm.prioridad" class="form-select">
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                </select>
              </div>
            </div>

            <div class="modal-footer attend-footer">
              <button type="button" class="btn-cancel" (click)="closeCanalizationModal()">Cancelar</button>
              <button type="submit" class="btn-accept" [disabled]="!attendFormRef.valid || savingCanalization()">
                {{ savingCanalization() ? 'Guardando...' : 'Aceptar Canalización' }}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>

    <!-- Modal crear/editar actividad -->
    <div class="modal-overlay" *ngIf="showMaterialModal()">
      <div class="modal-box">
        <div class="modal-header">
          <h3>{{ editingMaterial() ? 'Editar Actividad' : 'Nueva Actividad' }}</h3>
          <button class="close-btn" (click)="closeMaterialModal()">×</button>
        </div>
        <div class="modal-body">
          <form (ngSubmit)="saveMaterial()" #materialFormRef="ngForm">
            <div class="form-group">
              <label>Título</label>
              <input type="text" name="titulo" [(ngModel)]="materialForm.titulo" class="form-input" required>
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea name="descripcion" [(ngModel)]="materialForm.descripcion" class="form-input" rows="3"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Tipo de material</label>
                <select name="tipoId" [(ngModel)]="materialForm.tipoId" class="form-select" required>
                  <option [ngValue]="undefined" disabled>Seleccione...</option>
                  <option *ngFor="let t of tiposMaterial()" [ngValue]="t.id">{{ t.nombre }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Área de apoyo</label>
                <select name="attentionAreaId" [(ngModel)]="materialForm.attentionAreaId" class="form-select">
                  <option [ngValue]="undefined">Sin especificar</option>
                  <option *ngFor="let a of attentionAreas()" [ngValue]="+a.id">{{ a.name }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Nivel de desempeño</label>
                <select name="nivelDesempeno" [(ngModel)]="materialForm.nivelDesempeno" class="form-select">
                  <option [ngValue]="undefined">Sin especificar</option>
                  <option value="INICIAL">Inicial</option>
                  <option value="EN_PROCESO">En proceso</option>
                  <option value="LOGRADO">Logrado</option>
                </select>
              </div>
              <div class="form-group">
                <label>Grado (rango)</label>
                <div class="grade-range">
                  <input type="number" name="gradoMin" [(ngModel)]="materialForm.gradoMin" class="form-input" placeholder="Mín" min="1" max="6">
                  <input type="number" name="gradoMax" [(ngModel)]="materialForm.gradoMax" class="form-input" placeholder="Máx" min="1" max="6">
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Instrucciones de aplicación</label>
              <textarea name="instruccionesAplicacion" [(ngModel)]="materialForm.instruccionesAplicacion" class="form-input" rows="3"
                        placeholder="Pasos para aplicar la actividad en aula o intervención"></textarea>
            </div>
            <div class="form-group">
              <label>Materiales necesarios</label>
              <textarea name="materialesNecesarios" [(ngModel)]="materialForm.materialesNecesarios" class="form-input" rows="2"
                        placeholder="Lista de materiales o recursos"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Duración estimada (min)</label>
                <input type="number" name="duracionEstimadaMin" [(ngModel)]="materialForm.duracionEstimadaMin" class="form-input" min="1" placeholder="Ej. 30">
              </div>
              <div class="form-group">
                <label>Perfil recomendado</label>
                <input type="text" name="perfilRecomendado" [(ngModel)]="materialForm.perfilRecomendado" class="form-input"
                       placeholder="Ej. TDAH, lectura inicial">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-ghost" (click)="closeMaterialModal()">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="!materialFormRef.valid || saving()">
                {{ editingMaterial() ? 'Guardar cambios' : 'Crear actividad' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal agendar cita -->
    <div class="modal-overlay" *ngIf="showCitaModal()">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Agendar Cita</h3>
          <button class="close-btn" (click)="closeCitaModal()">×</button>
        </div>
        <div class="modal-body">
          <form (ngSubmit)="saveCita()" #citaFormRef="ngForm">
            <div class="form-group">
              <label>Alumno</label>
              <select name="alumnoId" [(ngModel)]="citaForm.alumnoId" class="form-select" required>
                <option [ngValue]="''" disabled>Seleccione...</option>
                <option *ngFor="let a of citaAlumnos()" [ngValue]="a.id">{{ a.nombre }}</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Tipo de cita</label>
                <input type="text" name="tipoCita" [(ngModel)]="citaForm.tipoCita" class="form-input" placeholder="Seguimiento, valoración..." required>
              </div>
              <div class="form-group">
                <label>Modalidad</label>
                <select name="modalidad" [(ngModel)]="citaForm.modalidad" class="form-select" required>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="VIRTUAL">Virtual</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Fecha</label>
                <input type="date" name="fecha" [(ngModel)]="citaForm.fecha" class="form-input" required>
              </div>
              <div class="form-group">
                <label>Hora</label>
                <input type="time" name="hora" [(ngModel)]="citaForm.hora" class="form-input" required>
              </div>
            </div>
            <div class="form-group">
              <label>Notas (opcional)</label>
              <textarea name="notasTutor" [(ngModel)]="citaForm.notasTutor" class="form-input" rows="2"></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-ghost" (click)="closeCitaModal()">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="!citaFormRef.valid || savingCita()">
                {{ savingCita() ? 'Guardando...' : 'Agendar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 2rem; }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1.5rem 1.75rem;
      border-radius: 16px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
    }
    .header-text h1 { margin: 0 0 0.4rem; font-weight: 800; color: #111111; font-size: 1.75rem; }
    .header-text p { margin: 0; color: #4b5563; }
    .header-actions { display: flex; align-items: center; gap: 0.85rem; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
    .header-link {
      padding: 0.45rem 0.85rem; border-radius: 8px; background: #f5f3ff; color: #5b21b6;
      text-decoration: none; font-size: 0.82rem; font-weight: 700;
    }
    .header-link:hover { background: #ede9fe; }
    .section-hint { color: #6b7280; font-size: 0.85rem; font-weight: 600; }
    .motivo-cell {
      max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #6b7280;
    }
    .progress-inline { display: flex; align-items: center; gap: 0.5rem; }
    .progress-track { width: 84px; height: 6px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
    .progress-bar { height: 100%; background: #5b21b6; }
    .progress-inline span { font-size: 0.75rem; font-weight: 700; color: #64748b; }
    .user-chip { display: flex; align-items: center; gap: 0.65rem; }
    .avatar-img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
    .user-name { font-weight: 600; color: #111111; font-size: 0.9rem; white-space: nowrap; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
    .stat-card {
      background: white; padding: 1.5rem; border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;
      display: flex; flex-direction: column; align-items: flex-start; gap: 0.5rem;
    }
    .stat-icon {
      width: 44px; height: 44px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; margin-bottom: 0.25rem;
    }
    .stat-icon svg { width: 22px; height: 22px; }
    .icon-orange { background: #ffedd5; color: #c2410c; }
    .icon-blue { background: #ede9fe; color: #6d28d9; }
    .icon-green { background: #d1fae5; color: #059669; }
    .icon-red { background: #fee2e2; color: #dc2626; }
    .stat-value { font-size: 2.25rem; font-weight: 800; color: #111111; line-height: 1; }
    .stat-label { color: #6b7280; font-size: 0.875rem; }

    .section-container { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 2rem; }
    .section-header { display: flex; justify-content: space-between; align-items: center; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th { text-align: left; padding: 0.75rem; border-bottom: 2px solid #f3f4f6; color: #374151; }
    td { padding: 0.75rem; border-bottom: 1px solid #f3f4f6; color: #4b5563; }
    .empty-row { text-align: center; color: #9ca3af; padding: 1.5rem; }
    .btn-action { background: #e5e7eb; border: none; padding: 0.5rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem; margin-right: 0.5rem; }
    .btn-action:hover:not(:disabled) { background: #d1d5db; }
    .btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-action.btn-danger { background: #fee2e2; color: #b91c1c; }
    .btn-action.btn-danger:hover:not(:disabled) { background: #fecaca; }
    .link-action { text-decoration: none; display: inline-flex; align-items: center; color: inherit; }
    .estado-select { font-size: 0.8rem; padding: 0.35rem 0.5rem; border-radius: 6px; border: 1px solid #d1d5db; margin-right: 0.35rem; }
    .actions-cell { white-space: nowrap; }
    .btn-primary { background: #f59e0b; color: white; border: none; padding: 0.6rem 1.1rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
    .btn-primary:hover:not(:disabled) { background: #d97706; transform: translateY(-1px); }
    .btn-primary:active:not(:disabled) { transform: translateY(0); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-ghost { background: transparent; border: 1px solid #d1d5db; padding: 0.6rem 1.1rem; border-radius: 8px; cursor: pointer; }

    .status-pill { padding: 0.25rem 0.7rem; border-radius: 999px; font-size: 0.78rem; font-weight: 700; white-space: nowrap; }
    .pill-gray { background: #f3f4f6; color: #6b7280; }
    .pill-yellow { background: #fef3c7; color: #d97706; }
    .pill-green { background: #d1fae5; color: #059669; }
    .pill-red { background: #fee2e2; color: #dc2626; }
    .pill-blue { background: #dbeafe; color: #1d4ed8; }
    .pill-purple { background: #f3e8ff; color: #7e22ce; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.56); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-box { background: white; border-radius: 16px; width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 60px rgba(15,23,42,0.24); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f3f4f6; }
    .modal-header h3 { margin: 0; color: #111827; font-size: 1.2rem; font-weight: 800; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #9ca3af; }
    .close-btn-circle { width: 34px; height: 34px; border-radius: 50%; background: #f3f4f6; color: #4b5563; display: inline-flex; align-items: center; justify-content: center; line-height: 1; }
    .close-btn-circle:hover { background: #e5e7eb; color: #111827; }
    .modal-body { padding: 1.5rem; }
    .form-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group label { color: #374151; font-size: 0.8rem; font-weight: 700; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-input, .form-select { padding: 0.6rem 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem; }
    .form-input:focus, .form-select:focus { outline: 2px solid #c4b5fd; border-color: #7c3aed; }
    .grade-range { display: flex; gap: 0.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
    .student-info-card { display: flex; align-items: center; gap: 0.85rem; padding: 1rem; border-radius: 12px; background: #f5f3ff; margin-bottom: 1rem; }
    .student-avatar { width: 46px; height: 46px; flex: 0 0 46px; border-radius: 50%; background: #5b21b6; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; }
    .student-info { min-width: 0; display: flex; flex-direction: column; gap: 0.3rem; }
    .student-info strong { color: #1f2937; font-size: 1rem; }
    .student-info span { color: #6d28d9; font-size: 0.78rem; line-height: 1.4; }
    .canalization-context { color: #6b7280; font-size: 0.8rem; line-height: 1.6; margin: 0 0 1.2rem; }
    .canalization-context span { margin: 0 0.25rem; color: #9ca3af; }
    .canalization-context strong { color: #4b5563; font-weight: 600; }
    .clinical-notes { resize: vertical; min-height: 108px; font-family: inherit; }
    .attend-footer { border-top: 1px solid #f3f4f6; padding-top: 1.15rem; }
    .btn-cancel, .btn-accept { border: none; padding: 0.65rem 1.1rem; border-radius: 8px; cursor: pointer; font-weight: 700; }
    .btn-cancel { background: #f3f4f6; color: #374151; }
    .btn-cancel:hover { background: #e5e7eb; }
    .btn-accept { background: #5b21b6; color: #ffffff; }
    .btn-accept:hover:not(:disabled) { background: #4c1d95; }
    .btn-accept:disabled { opacity: 0.48; cursor: not-allowed; }
    @media (max-width: 640px) {
      .form-row { grid-template-columns: 1fr; gap: 0; }
      .canalization-modal { max-height: calc(100vh - 2rem); }
    }
  `]
})
export class EspecialistaDashboard implements OnInit {
  canalizationService = inject(CanalizationService);
  psychoService = inject(PsychoService);
  reportService = inject(ReportService);
  materialService = inject(MaterialService);
  catalogService = inject(CatalogService);
  appointmentService = inject(AppointmentService);
  authService = inject(AuthService);

  Status = CanalizationStatus;

  assessments: PsychoeducationalAssessmentListItem[] = [];
  allCanalizations: CanalizationListItem[] = [];
  cieSummary: CIESummaryItem[] = [];
  teaAlerts: TEAAlertItem[] = [];
  citas: CitaListItem[] = [];

  materiales = signal<MaterialListItem[]>([]);
  upcomingCitas = signal<CitaListItem[]>([]);
  tiposMaterial = signal<MaterialType[]>([]);
  attentionAreas = signal<AttentionArea[]>([]);
  inboxCanalizations = signal<CanalizationListItem[]>([]);

  showMaterialModal = signal(false);
  editingMaterial = signal<MaterialListItem | null>(null);
  saving = signal(false);
  updatingCanalizationId = signal<number | null>(null);
  showCanalizationModal = signal(false);
  selectedCanalization = signal<CanalizationListItem | null>(null);
  savingCanalization = signal(false);
  updatingCitaId = signal<number | null>(null);
  showCitaModal = signal(false);
  savingCita = signal(false);

  materialForm: AddMaterialRequest = this.emptyMaterialForm();
  canalizationForm: AttendCanalizationForm = this.emptyCanalizationForm();
  citaForm: ScheduleAppointmentRequest = this.emptyCitaForm();

  get currentUser() {
    return this.authService.currentUser();
  }

  /** Alumnos con los que el especialista ya tiene contacto (canalizaciones/evaluaciones
   *  a su cargo) — se usan como opciones para agendar una cita, sin necesitar un
   *  endpoint nuevo de "todos los alumnos". */
  citaAlumnos() {
    const map = new Map<string, string>();
    for (const c of this.allCanalizations) map.set(c.alumnoId, c.alumnoNombre);
    for (const a of this.assessments) map.set(a.studentId, a.studentName);
    return Array.from(map, ([id, nombre]) => ({ id, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.canalizationService.getCanalizations().subscribe(res => {
      this.allCanalizations = res;
      this.inboxCanalizations.set(
        res.filter(c => c.estado !== CanalizationStatus.Cerrada)
      );
    });
    this.psychoService.getAssessments().subscribe(res => {
      this.assessments = res;
    });
    this.reportService.getCIESummary().subscribe({
      next: res => this.cieSummary = res,
      error: () => this.cieSummary = []
    });
    this.reportService.getTEAAlerts().subscribe({
      next: res => this.teaAlerts = res,
      error: () => this.teaAlerts = []
    });
    this.loadMateriales();
    this.catalogService.getMaterialTypes().subscribe(res => this.tiposMaterial.set(res));
    this.catalogService.getAttentionAreas().subscribe(res => this.attentionAreas.set(res));
    this.loadCitas();
  }

  loadCitas() {
    const from = this.getTodayIsoDate();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 60);
    const to = toDate.toISOString().slice(0, 10);
    this.appointmentService.list(from, to).subscribe({
      next: res => {
        this.citas = res;
        this.upcomingCitas.set(
          [...res]
            .filter(c => c.estado !== 'CANCELADA')
            .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`))
            .slice(0, 12)
        );
      },
      error: () => {
        this.citas = [];
        this.upcomingCitas.set([]);
      }
    });
  }

  changeCitaEstado(cita: CitaListItem, estado: 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA') {
    if (cita.estado === estado) return;
    this.updatingCitaId.set(cita.id);
    this.appointmentService.updateEstado(cita.id, estado).subscribe({
      next: () => {
        this.updatingCitaId.set(null);
        this.loadCitas();
      },
      error: err => {
        this.updatingCitaId.set(null);
        alert(err.error?.message || 'No se pudo actualizar la cita.');
      }
    });
  }

  getCitaEstadoLabel(estado: string): string {
    switch (estado) {
      case 'PROGRAMADA': return 'Programada';
      case 'REALIZADA': return 'Realizada';
      case 'CANCELADA': return 'Cancelada';
      default: return estado;
    }
  }

  private emptyCitaForm(): ScheduleAppointmentRequest {
    return { alumnoId: '', tipoCita: '', fecha: '', hora: '', modalidad: 'PRESENCIAL', notasTutor: '' };
  }

  openCitaModal() {
    this.citaForm = this.emptyCitaForm();
    this.showCitaModal.set(true);
  }

  closeCitaModal() {
    this.showCitaModal.set(false);
  }

  saveCita() {
    this.savingCita.set(true);
    this.appointmentService.schedule(this.citaForm).subscribe({
      next: () => {
        this.savingCita.set(false);
        this.closeCitaModal();
        this.loadCitas();
      },
      error: err => {
        this.savingCita.set(false);
        alert(err.error?.message || 'No se pudo agendar la cita.');
      }
    });
  }

  loadMateriales() {
    this.materialService.getMisMateriales().subscribe(res => this.materiales.set(res));
  }

  pendingCount(): number {
    return this.allCanalizations.filter(c => c.estado === CanalizationStatus.Pendiente).length;
  }

  cieCount(): number {
    return this.cieSummary.length;
  }

  teaActiveCount(): number {
    return this.teaAlerts.filter(a => (a.seguimientoEstado || 'ACTIVA') !== 'RESUELTA').length;
  }

  getAssessmentProgress(status: string): number {
    switch (status) {
      case 'BORRADOR': return 35;
      case 'EN_REVISION': return 70;
      case 'FIRMADA': return 90;
      case 'ENTREGADA': return 100;
      default: return 20;
    }
  }

  openCanalizationModal(canal: CanalizationListItem) {
    this.selectedCanalization.set(canal);
    this.canalizationForm = {
      tipoAtencion: canal.tipoAtencion || '',
      fechaAtencion: canal.fechaAtencion || this.getTodayIsoDate(),
      observacionesClinicas: canal.observacionesClinicas || '',
      derivarAreaId: canal.derivarAreaId,
      prioridad: canal.prioridad || 'MEDIA'
    };
    this.showCanalizationModal.set(true);
  }

  closeCanalizationModal() {
    if (this.savingCanalization()) return;
    this.showCanalizationModal.set(false);
    this.selectedCanalization.set(null);
    this.canalizationForm = this.emptyCanalizationForm();
  }

  submitCanalization() {
    const canal = this.selectedCanalization();
    const derivarAreaId = this.canalizationForm.derivarAreaId;
    if (!canal || !this.canalizationForm.tipoAtencion || !this.canalizationForm.fechaAtencion || derivarAreaId == null) {
      return;
    }

    const request: AttendCanalizationRequest = {
      ...this.canalizationForm,
      derivarAreaId
    };
    this.savingCanalization.set(true);
    this.canalizationService.attend(canal.id, request).subscribe({
      next: () => {
        this.savingCanalization.set(false);
        this.closeCanalizationModal();
        this.loadData();
      },
      error: (err) => {
        this.savingCanalization.set(false);
        alert(err.error?.message || 'No se pudo atender la canalización.');
      }
    });
  }

  cerrarCanalizacion(canal: CanalizationListItem) {
    this.updatingCanalizationId.set(canal.id);
    this.canalizationService.updateStatus(canal.id, { estado: CanalizationStatus.Cerrada }).subscribe({
      next: () => { this.updatingCanalizationId.set(null); this.loadData(); },
      error: (err) => {
        this.updatingCanalizationId.set(null);
        alert(err.error?.message || 'No se pudo actualizar la canalización.');
      }
    });
  }

  getCanalizationStatusLabel(status: CanalizationStatus): string {
    switch (status) {
      case CanalizationStatus.Pendiente: return 'Pendiente';
      case CanalizationStatus.Recibida: return 'Recibida';
      case CanalizationStatus.EnProceso: return 'En proceso';
      case CanalizationStatus.Cerrada: return 'Cerrada';
      default: return 'Desconocido';
    }
  }

  getAssessmentStatusLabel(status: string): string {
    switch (status) {
      case 'BORRADOR': return 'Borrador';
      case 'EN_REVISION': return 'En revisión';
      case 'FIRMADA': return 'Firmada';
      case 'ENTREGADA': return 'Entregada';
      default: return status || 'Sin estado';
    }
  }

  getAssessmentStatusClass(status: string): string {
    switch (status) {
      case 'BORRADOR': return 'pill-gray';
      case 'EN_REVISION': return 'pill-yellow';
      case 'FIRMADA': return 'pill-blue';
      case 'ENTREGADA': return 'pill-green';
      default: return 'pill-gray';
    }
  }

  private emptyMaterialForm(): AddMaterialRequest {
    return {
      titulo: '',
      descripcion: '',
      tipoId: undefined as any,
      attentionAreaId: undefined,
      nivelDesempeno: undefined,
      gradoMin: undefined,
      gradoMax: undefined,
      tags: [],
      instruccionesAplicacion: '',
      materialesNecesarios: '',
      duracionEstimadaMin: undefined,
      perfilRecomendado: ''
    };
  }

  private emptyCanalizationForm(): AttendCanalizationForm {
    return {
      tipoAtencion: '',
      fechaAtencion: this.getTodayIsoDate(),
      observacionesClinicas: '',
      derivarAreaId: undefined,
      prioridad: 'MEDIA'
    };
  }

  private getTodayIsoDate(): string {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 10);
  }

  getInitials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  getStudentMeta(canal: CanalizationListItem): string {
    const gradeAndGroup = canal.grupo || (canal.grado ? `${canal.grado}°` : 'Grado sin especificar');
    const school = canal.escuelaNombre || 'Escuela sin especificar';
    const curp = canal.alumnoCurp || 'CURP sin especificar';
    return `${gradeAndGroup} · ${school} · ${curp}`;
  }

  openMaterialModal(material?: MaterialListItem) {
    if (material) {
      this.editingMaterial.set(material);
      this.materialForm = {
        titulo: material.titulo,
        descripcion: material.descripcion,
        tipoId: material.tipoId,
        attentionAreaId: material.attentionAreaId,
        nivelDesempeno: material.nivelDesempeno,
        gradoMin: material.gradoMin,
        gradoMax: material.gradoMax,
        tags: material.tags,
        instruccionesAplicacion: material.instruccionesAplicacion,
        materialesNecesarios: material.materialesNecesarios,
        duracionEstimadaMin: material.duracionEstimadaMin,
        perfilRecomendado: material.perfilRecomendado
      };
    } else {
      this.editingMaterial.set(null);
      this.materialForm = this.emptyMaterialForm();
    }
    this.showMaterialModal.set(true);
  }

  closeMaterialModal() {
    this.showMaterialModal.set(false);
  }

  saveMaterial() {
    this.saving.set(true);
    const editing = this.editingMaterial();

    const onSuccess = () => {
      this.saving.set(false);
      this.closeMaterialModal();
      this.loadMateriales();
    };
    const onError = (err: any) => {
      this.saving.set(false);
      alert(err.error?.message || 'No se pudo guardar la actividad.');
    };

    if (editing) {
      this.materialService.updateMaterial(editing.id, this.materialForm).subscribe({ next: onSuccess, error: onError });
    } else {
      this.materialService.createMaterial(this.materialForm).subscribe({ next: onSuccess, error: onError });
    }
  }

  togglePublicado(material: MaterialListItem) {
    this.materialService.setPublicado(material.id, !material.publicado).subscribe({
      next: () => this.loadMateriales(),
      error: (err) => alert(err.error?.message || 'No se pudo cambiar el estado de la actividad.')
    });
  }

  darDeBajaMaterial(material: MaterialListItem) {
    const ok = confirm(`¿Dar de baja la actividad "${material.titulo}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    this.materialService.deleteMaterial(material.id).subscribe({
      next: () => this.loadMateriales(),
      error: (err) => alert(err.error?.message || 'No se pudo dar de baja la actividad.')
    });
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
}
