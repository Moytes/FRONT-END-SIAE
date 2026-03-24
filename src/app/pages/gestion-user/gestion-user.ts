import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

interface Alumno {
  id: number;
  nombre: string;
  edad: number;
  nivel: string;
  avatar: string;
  sesiones: number;
  ultimaSesion: string;
}

const STORAGE_KEY = 'SIAE_ALUMNOS';

const DEFAULT_ALUMNOS: Alumno[] = [
  { id: 1, nombre: 'Ana López', edad: 6, nivel: 'Preescolar', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Ana+Lopez&backgroundColor=0ea5e9', sesiones: 5, ultimaSesion: '2026-03-20' },
  { id: 2, nombre: 'Carlos Méndez', edad: 8, nivel: 'Primaria', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Carlos+Mendez&backgroundColor=8b5cf6', sesiones: 3, ultimaSesion: '2026-03-19' },
  { id: 3, nombre: 'María Torres', edad: 7, nivel: 'Primaria', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Maria+Torres&backgroundColor=f43f5e', sesiones: 7, ultimaSesion: '2026-03-17' },
  { id: 4, nombre: 'Sofía Ramírez', edad: 5, nivel: 'Preescolar', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Sofia+Ramirez&backgroundColor=10b981', sesiones: 2, ultimaSesion: '2026-03-15' },
];

@Component({
  selector: 'app-gestion-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-user.html',
  styleUrl: './gestion-user.css',
})
export class GestionUser {
  authService = inject(AuthService);
  alumnos = signal<Alumno[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);

  // Form fields
  formNombre = '';
  formEdad = 5;
  formNivel = 'Preescolar';

  constructor() {
    this.loadAlumnos();
  }

  private loadAlumnos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.alumnos.set(JSON.parse(raw));
      } else {
        this.alumnos.set(DEFAULT_ALUMNOS);
        this.saveAlumnos();
      }
    } catch {
      this.alumnos.set(DEFAULT_ALUMNOS);
      this.saveAlumnos();
    }
  }

  private saveAlumnos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.alumnos()));
  }

  openNew() {
    this.formNombre = '';
    this.formEdad = 5;
    this.formNivel = 'Preescolar';
    this.editingId.set(null);
    this.showForm.set(true);
  }

  editAlumno(a: Alumno) {
    this.formNombre = a.nombre;
    this.formEdad = a.edad;
    this.formNivel = a.nivel;
    this.editingId.set(a.id);
    this.showForm.set(true);
  }

  cancelForm() {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  saveForm() {
    if (!this.formNombre.trim()) return;
    const id = this.editingId();

    if (id !== null) {
      this.alumnos.update(list => list.map(a =>
        a.id === id ? { ...a, nombre: this.formNombre, edad: this.formEdad, nivel: this.formNivel } : a
      ));
    } else {
      const newId = Date.now();
      const newAlumno: Alumno = {
        id: newId,
        nombre: this.formNombre,
        edad: this.formEdad,
        nivel: this.formNivel,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.formNombre)}&backgroundColor=0ea5e9`,
        sesiones: 0,
        ultimaSesion: '-'
      };
      this.alumnos.update(list => [...list, newAlumno]);
    }
    this.saveAlumnos();
    this.showForm.set(false);
    this.editingId.set(null);
  }

  deleteAlumno(id: number) {
    if (confirm('¿Estás seguro de eliminar este alumno del sistema?')) {
      this.alumnos.update(list => list.filter(a => a.id !== id));
      this.saveAlumnos();
    }
  }
}
