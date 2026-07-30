import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanalizationService } from '../../core/services/canalization.service';
import { PsychoService } from '../../core/services/psycho.service';
import { CieService } from '../../core/services/cie.service';
import { MaterialService } from '../../core/services/material.service';
import { CatalogService } from '../../core/services/catalog.service';
import {
  CanalizationListItem,
  PsychoeducationalAssessmentListItem,
  MaterialListItem,
  AddMaterialRequest,
  MaterialType,
  AttentionArea
} from '../../core/models/api-models';

@Component({
  selector: 'app-especialista-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Panel del Especialista</h1>
        <p>Bandeja de canalizaciones, evaluaciones psicopedagógicas y catálogo de actividades.</p>
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
        <div class="stat-card">
          <span class="stat-value">{{ materiales().length }}</span>
          <span class="stat-label">Actividades en tu catálogo</span>
        </div>
      </div>

      <section class="section-container">
        <div class="section-header">
          <h2>Catálogo de Actividades</h2>
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
                  <span class="status-badge" [class.published]="m.publicado">
                    {{ m.publicado ? 'Publicado' : 'Borrador' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button class="btn-action" (click)="openMaterialModal(m)">Editar</button>
                  <button class="btn-action" (click)="togglePublicado(m)">
                    {{ m.publicado ? 'Despublicar' : 'Publicar' }}
                  </button>
                </td>
              </tr>
              <tr *ngIf="materiales().length === 0">
                <td colspan="6" class="empty-row">Aún no has creado ninguna actividad.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

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
  `,
  styles: [`
    .dashboard-container { padding: 2rem; }
    .dashboard-header { margin-bottom: 2rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .stat-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; }
    .stat-value { font-size: 2.5rem; font-weight: 700; color: #f59e0b; }
    .stat-label { color: #6b7280; font-size: 0.875rem; }
    .section-container { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 2rem; }
    .section-header { display: flex; justify-content: space-between; align-items: center; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th { text-align: left; padding: 0.75rem; border-bottom: 2px solid #f3f4f6; color: #374151; }
    td { padding: 0.75rem; border-bottom: 1px solid #f3f4f6; color: #4b5563; }
    .empty-row { text-align: center; color: #9ca3af; padding: 1.5rem; }
    .btn-action { background: #e5e7eb; border: none; padding: 0.5rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem; margin-right: 0.5rem; }
    .btn-action:hover { background: #d1d5db; }
    .actions-cell { white-space: nowrap; }
    .btn-primary { background: #f59e0b; color: white; border: none; padding: 0.6rem 1.1rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-ghost { background: transparent; border: 1px solid #d1d5db; padding: 0.6rem 1.1rem; border-radius: 8px; cursor: pointer; }
    .status-badge { background: #f3f4f6; color: #6b7280; padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.8rem; }
    .status-badge.published { background: #d1fae5; color: #065f46; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-box { background: white; border-radius: 12px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f3f4f6; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #9ca3af; }
    .modal-body { padding: 1.5rem; }
    .form-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.35rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-input, .form-select { padding: 0.6rem 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem; }
    .grade-range { display: flex; gap: 0.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
  `]
})
export class EspecialistaDashboard implements OnInit {
  canalizationService = inject(CanalizationService);
  psychoService = inject(PsychoService);
  cieService = inject(CieService);
  materialService = inject(MaterialService);
  catalogService = inject(CatalogService);

  pendingCanalizations: CanalizationListItem[] = [];
  assessments: PsychoeducationalAssessmentListItem[] = [];

  materiales = signal<MaterialListItem[]>([]);
  tiposMaterial = signal<MaterialType[]>([]);
  attentionAreas = signal<AttentionArea[]>([]);

  showMaterialModal = signal(false);
  editingMaterial = signal<MaterialListItem | null>(null);
  saving = signal(false);

  materialForm: AddMaterialRequest = this.emptyMaterialForm();

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
    this.loadMateriales();
    this.catalogService.getMaterialTypes().subscribe(res => this.tiposMaterial.set(res));
    this.catalogService.getAttentionAreas().subscribe(res => this.attentionAreas.set(res));
  }

  loadMateriales() {
    this.materialService.getMisMateriales().subscribe(res => this.materiales.set(res));
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
      tags: []
    };
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
        tags: material.tags
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
