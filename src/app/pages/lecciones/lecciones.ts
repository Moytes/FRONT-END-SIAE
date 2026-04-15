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
  // Completadas
  { actividadId: 'mision-101', titulo: 'Vocales Mágicas',       dimension: 'FONOLOGIA',     fecha: '2026-03-20', estado: 'completada',  puntaje: 100 },
  { actividadId: 'mision-102', titulo: 'Desafío de Animales',   dimension: 'SEMANTICA',     fecha: '2026-03-19', estado: 'completada',  puntaje: 80  },
  { actividadId: 'mision-104', titulo: 'Transportes Rápidos',   dimension: 'SEMANTICA',     fecha: '2026-03-17', estado: 'completada',  puntaje: 90  },
  { actividadId: 'mision-105', titulo: 'El Cuento del Rey',     dimension: 'DISCURSOS',     fecha: '2026-03-15', estado: 'completada',  puntaje: 75  },
  { actividadId: 'mision-106', titulo: 'Emociones Ocultas',     dimension: 'PRAGMATICA',    fecha: '2026-03-14', estado: 'completada',  puntaje: 95  },
  // En progreso
  { actividadId: 'mision-103', titulo: 'Cuéntame una Aventura', dimension: 'MORFOSINTAXIS', fecha: '2026-03-18', estado: 'en_progreso', puntaje: 50 },
  { actividadId: 'mision-107', titulo: 'Aventura Espacial',     dimension: 'JUEGO',         fecha: '2026-04-01', estado: 'en_progreso', puntaje: 30 },
  { actividadId: 'mision-114', titulo: 'Debate: Mascotas',      dimension: 'DISCURSOS',     fecha: '2026-04-05', estado: 'en_progreso', puntaje: 60 },
  { actividadId: 'mision-115', titulo: 'Amigos del Bosque',     dimension: 'PRAGMATICA',    fecha: '2026-04-08', estado: 'en_progreso', puntaje: 45 },
  { actividadId: 'mision-116', titulo: 'La Frase Perdida',      dimension: 'MORFOSINTAXIS', fecha: '2026-04-10', estado: 'en_progreso', puntaje: 20 },
  { actividadId: 'mision-117', titulo: 'Colores y Sabores',     dimension: 'SEMANTICA',     fecha: '2026-04-11', estado: 'en_progreso', puntaje: 70 },
  // Pendientes
  { actividadId: 'mision-108', titulo: 'Descubre el Sonido',    dimension: 'FONOLOGIA',     fecha: '',           estado: 'pendiente',   puntaje: 0   },
  { actividadId: 'mision-109', titulo: 'Receta de Cocina',      dimension: 'JUEGO',         fecha: '',           estado: 'pendiente',   puntaje: 0   },
  { actividadId: 'mision-110', titulo: 'Palabras que Riman',    dimension: 'FONOLOGIA',     fecha: '',           estado: 'pendiente',   puntaje: 0   },
  { actividadId: 'mision-111', titulo: 'El Gran Debate',        dimension: 'PRAGMATICA',    fecha: '',           estado: 'pendiente',   puntaje: 0   },
  { actividadId: 'mision-112', titulo: 'Oraciones Locas',       dimension: 'MORFOSINTAXIS', fecha: '',           estado: 'pendiente',   puntaje: 0   },
  { actividadId: 'mision-113', titulo: 'Mundo de Colores',      dimension: 'SEMANTICA',     fecha: '',           estado: 'pendiente',   puntaje: 0   },
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

  getDimensionIcon(dimension: string): string {
    const icons: Record<string, string> = {
      FONOLOGIA: '🔤',
      SEMANTICA: '🌟',
      MORFOSINTAXIS: '📖',
      PRAGMATICA: '💬',
      DISCURSOS: '👑',
      JUEGO: '🎮',
    };
    return icons[dimension] ?? '⚔️';
  }

  getBadgeClass(dimension: string): string {
    return 'badge-' + dimension.toLowerCase();
  }
}