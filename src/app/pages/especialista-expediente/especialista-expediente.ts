import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { ExpedienteService } from '../../core/services/expediente.service';
import { SessionService } from '../../core/services/session.service';
import {
  AddSesionRequest,
  CanalizationStatus,
  ExpedienteDto,
  ExpedienteActividad
} from '../../core/models/api-models';
import { AssignmentService } from '../../core/services/assignment.service';

@Component({
  selector: 'app-especialista-expediente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './especialista-expediente.html',
  styleUrl: './especialista-expediente.css'
})
export class EspecialistaExpediente implements OnInit {
  private route = inject(ActivatedRoute);
  private expedienteService = inject(ExpedienteService);
  private sessionService = inject(SessionService);
  private catalogService = inject(CatalogService);
  private assignmentService = inject(AssignmentService);

  Status = CanalizationStatus;
  alumnoId = '';
  loading = signal(true);
  error = signal('');
  expediente = signal<ExpedienteDto | null>(null);
  /** Actividades del plan de acción (expediente o fallback por alumno). */
  actividadesPlan = signal<ExpedienteActividad[]>([]);
  activeCicloId?: number;

  showSesionModal = signal(false);
  sesionSaving = signal(false);
  sesionForm: AddSesionRequest = this.emptySesionForm();

  descargandoPdf = signal(false);

  ngOnInit(): void {
    this.alumnoId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.alumnoId) {
      this.error.set('Alumno no especificado.');
      this.loading.set(false);
      return;
    }

    this.catalogService.getSchoolYears(true).subscribe(years => {
      if (years.length) this.activeCicloId = +years[0].id;
    });

    this.loadExpediente();
  }

  loadExpediente(): void {
    this.loading.set(true);
    this.expedienteService.getExpediente(this.alumnoId).subscribe({
      next: data => {
        this.expediente.set(data);
        const fromExp = data.actividades?.length ? data.actividades : null;
        if (fromExp) {
          this.actividadesPlan.set(fromExp);
          this.loading.set(false);
        } else {
          this.assignmentService.getByAlumno(this.alumnoId).subscribe({
            next: rows => {
              this.actividadesPlan.set(rows.map(r => ({
                id: r.id,
                materialTitulo: r.materialTitulo,
                estado: r.estado,
                fechaAsignacion: r.fechaAsignacion,
                fechaLimite: r.fechaLimite,
                fechaCompletado: r.fechaCompletado,
                retroalimentacion: r.retroalimentacion,
                instrucciones: r.instrucciones
              })));
              this.loading.set(false);
            },
            error: () => {
              this.actividadesPlan.set([]);
              this.loading.set(false);
            }
          });
        }
      },
      error: () => {
        this.error.set('No se pudo cargar el expediente clínico.');
        this.loading.set(false);
      }
    });
  }

  descargarPdf(): void {
    if (!this.alumnoId) return;
    const nombre = this.expediente()?.alumno?.nombreCompleto ?? this.alumnoId;
    const nombreArchivo = `expediente-${nombre}.pdf`.replace(/\s+/g, '-');
    this.descargandoPdf.set(true);
    this.expedienteService.descargarExpedientePdf(this.alumnoId, nombreArchivo).subscribe({
      next: () => this.descargandoPdf.set(false),
      error: () => {
        this.descargandoPdf.set(false);
        alert('No se pudo descargar el expediente en PDF.');
      }
    });
  }

  openSesionModal(): void {
    const fromEval = this.expediente()?.evaluaciones[0]?.schoolYearId;
    this.sesionForm = {
      ...this.emptySesionForm(),
      cicloId: this.activeCicloId || (fromEval ? Number(fromEval) : 0)
    };
    this.showSesionModal.set(true);
  }

  closeSesionModal(): void {
    if (this.sesionSaving()) return;
    this.showSesionModal.set(false);
  }

  saveSesion(): void {
    if (!this.sesionForm.nota.trim() || !this.sesionForm.cicloId) return;
    this.sesionSaving.set(true);
    this.sessionService.create(this.alumnoId, this.sesionForm).subscribe({
      next: () => {
        this.sesionSaving.set(false);
        this.closeSesionModal();
        this.loadExpediente();
      },
      error: err => {
        this.sesionSaving.set(false);
        alert(err.error?.message || 'No se pudo registrar la sesión.');
      }
    });
  }

  canalStatusLabel(estado: CanalizationStatus): string {
    switch (estado) {
      case CanalizationStatus.Pendiente: return 'Pendiente';
      case CanalizationStatus.Recibida: return 'Recibida';
      case CanalizationStatus.EnProceso: return 'En proceso';
      case CanalizationStatus.Cerrada: return 'Cerrada';
      default: return estado;
    }
  }

  citaEstadoLabel(estado: string): string {
    switch (estado) {
      case 'PROGRAMADA': return 'Programada';
      case 'REALIZADA': return 'Realizada';
      case 'CANCELADA': return 'Cancelada';
      default: return estado;
    }
  }

  actividadEstadoLabel(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_PROGRESO': return 'En progreso';
      case 'COMPLETADO': return 'Completado';
      case 'EVALUADO': return 'Evaluado';
      default: return estado;
    }
  }

  private emptySesionForm(): AddSesionRequest {
    const today = new Date();
    const local = new Date(today.getTime() - today.getTimezoneOffset() * 60_000);
    return {
      cicloId: 0,
      fecha: local.toISOString().slice(0, 10),
      tipo: 'SEGUIMIENTO',
      motivo: '',
      nota: '',
      acuerdos: ''
    };
  }
}
