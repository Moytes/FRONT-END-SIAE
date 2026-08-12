import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlumnoPortalService } from '../../core/services/alumno-portal.service';
import { TutorClinicoService } from '../../core/services/tutor-clinico.service';
import {
  AlumnoPortalStudent,
  AlumnoTrabajo,
  StudentHistorial,
  TutorEvaluacionResumen,
  TutorCita
} from '../../core/models/api-models';

@Component({
  selector: 'app-alumno',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alumno.html',
  styleUrl: './alumno.css'
})
export class AlumnoPage implements OnInit {
  private portalService = inject(AlumnoPortalService);
  private tutorClinicoService = inject(TutorClinicoService);
  private router = inject(Router);

  students = signal<AlumnoPortalStudent[]>([]);
  selectedStudent = signal<AlumnoPortalStudent | null>(null);
  trabajos = signal<AlumnoTrabajo[]>([]);
  loading = signal(true);
  loadingTrabajos = signal(false);
  accessedByTutor = signal(false);
  activeTab = signal<'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADO'>('PENDIENTE');

  showCompletarModal = signal(false);
  selectedTrabajo = signal<AlumnoTrabajo | null>(null);
  completando = signal(false);

  activeSection = signal<'TRABAJOS' | 'HISTORIAL' | 'CLINICO'>('TRABAJOS');

  historial = signal<StudentHistorial | null>(null);
  loadingHistorial = signal(false);

  evaluaciones = signal<TutorEvaluacionResumen[]>([]);
  citas = signal<TutorCita[]>([]);
  loadingClinico = signal(false);

  descargandoPdf = signal(false);

  pendientes = computed(() => this.trabajos().filter(t => t.estado === 'PENDIENTE'));
  enProgreso = computed(() => this.trabajos().filter(t => t.estado === 'EN_PROGRESO'));
  completados = computed(() => this.trabajos().filter(t => t.estado === 'COMPLETADO' || t.estado === 'EVALUADO'));

  ultimaEvaluacion = computed(() => {
    const list = [...this.evaluaciones()];
    if (list.length === 0) return null;
    list.sort((a, b) => b.fechaElaboracion.localeCompare(a.fechaElaboracion));
    return list[0];
  });

  proximaCita = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = this.citas()
      .filter(c => {
        const d = new Date(c.fecha + 'T12:00:00');
        return d >= today;
      })
      .sort((a, b) => {
        const cmp = a.fecha.localeCompare(b.fecha);
        return cmp !== 0 ? cmp : a.hora.localeCompare(b.hora);
      });
    return upcoming[0] ?? null;
  });

  currentTrabajos = computed(() => {
    switch (this.activeTab()) {
      case 'PENDIENTE': return this.pendientes();
      case 'EN_PROGRESO': return this.enProgreso();
      case 'COMPLETADO': return this.completados();
    }
  });

  ngOnInit() {
    this.loadPerfil();
  }

  loadPerfil() {
    this.loading.set(true);
    this.portalService.getPerfil().subscribe({
      next: (perfil) => {
        this.accessedByTutor.set(perfil.accessedByTutor);
        this.students.set(perfil.students);
        if (perfil.students.length > 0) {
          this.selectStudent(perfil.students[0]);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  selectStudent(student: AlumnoPortalStudent) {
    this.selectedStudent.set(student);
    this.historial.set(null);
    this.evaluaciones.set([]);
    this.citas.set([]);
    this.loadTrabajos(student.id);
    if (this.accessedByTutor()) {
      this.loadClinicoResumen(student.id);
    }
    if (this.activeSection() === 'HISTORIAL') this.loadHistorial(student.id);
  }

  setSection(section: 'TRABAJOS' | 'HISTORIAL' | 'CLINICO') {
    this.activeSection.set(section);
    const student = this.selectedStudent();
    if (!student) return;

    if (section === 'HISTORIAL' && !this.historial()) {
      this.loadHistorial(student.id);
    }
    if (section === 'CLINICO' && this.evaluaciones().length === 0 && this.citas().length === 0) {
      this.loadClinicoResumen(student.id);
    }
  }

  loadHistorial(alumnoId: string) {
    this.loadingHistorial.set(true);
    this.portalService.getHistorial(alumnoId).subscribe({
      next: (data) => {
        this.historial.set(data);
        this.loadingHistorial.set(false);
      },
      error: () => this.loadingHistorial.set(false)
    });
  }

  loadClinicoResumen(alumnoId: string) {
    this.loadingClinico.set(true);
    let pending = 2;
    const done = () => {
      pending -= 1;
      if (pending <= 0) this.loadingClinico.set(false);
    };

    this.tutorClinicoService.getEvaluaciones(alumnoId).subscribe({
      next: (data) => this.evaluaciones.set(data),
      error: () => {},
      complete: () => done()
    });
    this.tutorClinicoService.getCitas(alumnoId).subscribe({
      next: (data) => this.citas.set(data),
      error: () => {},
      complete: () => done()
    });
  }

  descargarReporte() {
    const student = this.selectedStudent();
    if (!student) return;

    this.descargandoPdf.set(true);
    const nombreArchivo = `reporte-${student.name}-${student.fatherLastName}.pdf`.replace(/\s+/g, '_');
    this.portalService.descargarReportePdf(student.id, nombreArchivo).subscribe({
      next: () => this.descargandoPdf.set(false),
      error: () => {
        this.descargandoPdf.set(false);
        alert('No se pudo descargar el reporte.');
      }
    });
  }

  loadTrabajos(alumnoId: string) {
    this.loadingTrabajos.set(true);
    this.portalService.getTrabajos(alumnoId).subscribe({
      next: (trabajos) => {
        this.trabajos.set(trabajos);
        this.loadingTrabajos.set(false);
      },
      error: () => this.loadingTrabajos.set(false)
    });
  }

  setTab(tab: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADO') {
    this.activeTab.set(tab);
  }

  iniciarTrabajo(trabajo: AlumnoTrabajo) {
    this.portalService.iniciarTrabajo(trabajo.id).subscribe({
      next: () => {
        this.trabajos.update(list =>
          list.map(t => t.id === trabajo.id ? { ...t, estado: 'EN_PROGRESO' } : t)
        );
        this.activeTab.set('EN_PROGRESO');
      }
    });
  }

  abrirCompletar(trabajo: AlumnoTrabajo) {
    this.selectedTrabajo.set(trabajo);
    this.showCompletarModal.set(true);
  }

  cerrarCompletar() {
    this.showCompletarModal.set(false);
    this.selectedTrabajo.set(null);
  }

  confirmarCompletar() {
    const trabajo = this.selectedTrabajo();
    if (!trabajo) return;

    this.completando.set(true);
    this.portalService.completarTrabajo(trabajo.id).subscribe({
      next: () => {
        this.trabajos.update(list =>
          list.map(t => t.id === trabajo.id ? { ...t, estado: 'COMPLETADO' } : t)
        );
        this.completando.set(false);
        this.showCompletarModal.set(false);
        this.selectedTrabajo.set(null);
        this.activeTab.set('COMPLETADO');
      },
      error: () => this.completando.set(false)
    });
  }

  jugarActividad(trabajo: AlumnoTrabajo) {
    if (trabajo.asignacion.material.tipoClave === 'DIALOGO_ANIMADO' ||
        trabajo.asignacion.material.tipoClave === 'ACTIVIDAD' ||
        trabajo.asignacion.material.tipoClave === 'JUEGO_DIGITAL') {
      this.router.navigate(['/jugar', trabajo.id]);
    }
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'PENDIENTE': 'Por hacer',
      'EN_PROGRESO': 'En progreso',
      'COMPLETADO': 'Completado',
      'EVALUADO': 'Evaluado'
    };
    return labels[estado] || estado;
  }

  getEstadoCitaLabel(estado: string): string {
    const labels: Record<string, string> = {
      'PROGRAMADA': 'Programada',
      'REALIZADA': 'Realizada',
      'CANCELADA': 'Cancelada'
    };
    return labels[estado] || estado;
  }

  getTipoIcon(tipoClave: string): string {
    const icons: Record<string, string> = {
      'DIALOGO_ANIMADO': 'chat',
      'ACTIVIDAD': 'star',
      'JUEGO_DIGITAL': 'gamepad',
      'IMAGEN': 'image',
      'AUDIO': 'headphones',
      'VIDEO': 'play',
      'DOCUMENTO': 'file'
    };
    return icons[tipoClave] || 'file';
  }

  isPlayable(trabajo: AlumnoTrabajo): boolean {
    return ['DIALOGO_ANIMADO', 'ACTIVIDAD', 'JUEGO_DIGITAL'].includes(
      trabajo.asignacion.material.tipoClave
    );
  }

  formatDate(date?: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  formatTime(hora?: string): string {
    if (!hora) return '';
    const parts = hora.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return hora;
  }

  isOverdue(trabajo: AlumnoTrabajo): boolean {
    if (!trabajo.asignacion.fechaLimite) return false;
    return new Date(trabajo.asignacion.fechaLimite) < new Date() && trabajo.estado === 'PENDIENTE';
  }

  getEstadoEvaluacionLabel(estado: string): string {
    const labels: Record<string, string> = {
      'BORRADOR': 'Borrador',
      'FINALIZADA': 'Finalizada',
      'VALIDADA': 'Validada'
    };
    return labels[estado] || estado;
  }
}
