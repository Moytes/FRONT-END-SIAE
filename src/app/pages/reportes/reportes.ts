import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface SessionRecord {
  id: number;
  alumno: string;
  actividad: string;
  dimension: string;
  fecha: string;
  resultado: string;
  nivelAyuda: number;
}

const MOCK_SESSIONS: SessionRecord[] = [
  { id: 1, alumno: 'Ana López', actividad: 'Vocales Mágicas', dimension: 'FONOLOGIA', fecha: '2026-03-20', resultado: 'Logrado', nivelAyuda: 1 },
  { id: 2, alumno: 'Carlos Méndez', actividad: 'Contraste Fonético', dimension: 'FONOLOGIA', fecha: '2026-03-19', resultado: 'En Proceso', nivelAyuda: 3 },
  { id: 3, alumno: 'Ana López', actividad: 'Checklist Pragmática', dimension: 'PRAGMATICA', fecha: '2026-03-18', resultado: 'Logrado', nivelAyuda: 0 },
  { id: 4, alumno: 'María Torres', actividad: 'Tarjetas por Niveles', dimension: 'MORFOSINTAXIS', fecha: '2026-03-17', resultado: 'En Proceso', nivelAyuda: 2 },
  { id: 5, alumno: 'Carlos Méndez', actividad: 'Producción Espontánea', dimension: 'MORFOSINTAXIS', fecha: '2026-03-16', resultado: 'Área de Apoyo', nivelAyuda: 4 },
  { id: 6, alumno: 'Sofía Ramírez', actividad: 'La Comidita', dimension: 'SEMANTICA', fecha: '2026-03-15', resultado: 'Logrado', nivelAyuda: 1 },
  { id: 7, alumno: 'María Torres', actividad: 'Conversación Espontánea', dimension: 'DISCURSOS', fecha: '2026-03-14', resultado: 'En Proceso', nivelAyuda: 2 },
  { id: 8, alumno: 'Sofía Ramírez', actividad: 'Estadios de Juego', dimension: 'JUEGO', fecha: '2026-03-13', resultado: 'Logrado', nivelAyuda: 0 },
];

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes {
  authService = inject(AuthService);
  sessions = signal<SessionRecord[]>(MOCK_SESSIONS);
  filtroAlumno = signal<string>('');
  exportando = signal(false);

  get alumnos(): string[] {
    return [...new Set(MOCK_SESSIONS.map(s => s.alumno))];
  }

  get filteredSessions(): SessionRecord[] {
    const filtro = this.filtroAlumno();
    if (!filtro) return this.sessions();
    return this.sessions().filter(s => s.alumno === filtro);
  }

  filtrar(alumno: string) {
    this.filtroAlumno.set(alumno === this.filtroAlumno() ? '' : alumno);
  }

  exportarPDF() {
    this.exportando.set(true);
    setTimeout(() => {
      this.exportando.set(false);
      alert('📄 Reporte PDF generado exitosamente (simulación front-end).');
    }, 1500);
  }

  getResultadoClass(resultado: string): string {
    if (resultado === 'Logrado') return 'badge-success';
    if (resultado === 'En Proceso') return 'badge-warning';
    return 'badge-danger';
  }

  getNivelAyudaLabel(nivel: number): string {
    const labels: Record<number, string> = {
      0: 'Sin ayuda',
      1: 'Supervisión',
      2: 'Motivación verbal',
      3: 'Modelado',
      4: 'Ayuda física parcial',
      5: 'Ayuda física total'
    };
    return labels[nivel] || '';
  }
}
