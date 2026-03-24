import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ActivityConfigService } from '../../core/services/activity-config.service';

interface LeccionHistorial {
  actividadId: string;
  titulo: string;
  dimension: string;
  fecha: string;
  estado: 'completada' | 'en_progreso' | 'pendiente';
  puntaje: number;
}

const MOCK_HISTORIAL: LeccionHistorial[] = [
  { actividadId: 'mision-101', titulo: 'Vocales Mágicas', dimension: 'FONOLOGIA', fecha: '2026-03-20', estado: 'completada', puntaje: 100 },
  { actividadId: 'mision-102', titulo: 'Desafío de Animales', dimension: 'SEMANTICA', fecha: '2026-03-19', estado: 'completada', puntaje: 80 },
  { actividadId: 'mision-103', titulo: 'Cuéntame una Aventura', dimension: 'MORFOSINTAXIS', fecha: '2026-03-18', estado: 'en_progreso', puntaje: 50 },
  { actividadId: 'mision-108', titulo: 'Descubre el Sonido', dimension: 'FONOLOGIA', fecha: '', estado: 'pendiente', puntaje: 0 },
  { actividadId: 'mision-110', titulo: 'Receta de Cocina', dimension: 'JUEGO', fecha: '', estado: 'pendiente', puntaje: 0 },
];

@Component({
  selector: 'app-lecciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lecciones.html',
  styleUrl: './lecciones.css',
})
export class Lecciones {
  authService = inject(AuthService);
  activityService = inject(ActivityConfigService);
  router = inject(Router);

  historial = MOCK_HISTORIAL;

  get completadas() { return this.historial.filter(h => h.estado === 'completada'); }
  get enProgreso() { return this.historial.filter(h => h.estado === 'en_progreso'); }
  get pendientes() { return this.historial.filter(h => h.estado === 'pendiente'); }

  get progresoTotal(): number {
    const total = this.historial.length;
    if (total === 0) return 0;
    return Math.round((this.completadas.length / total) * 100);
  }

  jugar(id: string) {
    this.router.navigate(['/jugar', id]);
  }

  getEstadoLabel(estado: string): string {
    if (estado === 'completada') return '✅ Completada';
    if (estado === 'en_progreso') return '🔄 En Progreso';
    return '📋 Pendiente';
  }

  getEstadoClass(estado: string): string {
    if (estado === 'completada') return 'estado-completada';
    if (estado === 'en_progreso') return 'estado-progreso';
    return 'estado-pendiente';
  }
}
