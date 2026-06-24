import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlumnoPortalService } from '../../core/services/alumno-portal.service';
import { AuthService } from '../../services/auth.service';
import { AlumnoPortalStudent, AlumnoTrabajo } from '../../core/models/api-models';

@Component({
  selector: 'app-alumno',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alumno.html',
  styleUrl: './alumno.css'
})
export class AlumnoPage implements OnInit {
  private portalService = inject(AlumnoPortalService);
  private authService = inject(AuthService);
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

  pendientes = computed(() => this.trabajos().filter(t => t.estado === 'PENDIENTE'));
  enProgreso = computed(() => this.trabajos().filter(t => t.estado === 'EN_PROGRESO'));
  completados = computed(() => this.trabajos().filter(t => t.estado === 'COMPLETADO' || t.estado === 'EVALUADO'));

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
    this.loadTrabajos(student.id);
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
      this.router.navigate(['/jugar', trabajo.asignacion.material.id]);
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

  isOverdue(trabajo: AlumnoTrabajo): boolean {
    if (!trabajo.asignacion.fechaLimite) return false;
    return new Date(trabajo.asignacion.fechaLimite) < new Date() && trabajo.estado === 'PENDIENTE';
  }
}
