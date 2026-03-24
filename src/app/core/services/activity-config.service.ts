import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export type ActivityDimension = 'FONOLOGIA' | 'PRAGMATICA' | 'MORFOSINTAXIS' | 'SEMANTICA' | 'DISCURSOS' | 'JUEGO';

export interface ActivityConfig {
  id: string;
  title: string;
  activityType: number; // 1 to 11
  dimension: ActivityDimension;
  config: any; // Dynamic JSON config based on renderer
  createdAt: Date;
}

const STORAGE_KEY = 'SIAE_ACTIVITIES';

// Misiones demo iniciales (se cargan solo si no hay nada en caché)
const DEFAULT_ACTIVITIES: ActivityConfig[] = [
  {
    id: 'mision-101',
    title: 'Vocales Mágicas',
    activityType: 1,
    dimension: 'FONOLOGIA',
    config: { targetWord: 'ARBOL', imageUrl: 'https://cdn-icons-png.flaticon.com/512/3208/3208536.png' },
    createdAt: new Date()
  },
  {
    id: 'mision-102',
    title: 'Desafío de Animales',
    activityType: 3,
    dimension: 'SEMANTICA',
    config: { question: '¿Cuál es un animal doméstico?', options: ['Tigre', 'Perro', 'Tiburón'], correctIndex: 1 },
    createdAt: new Date()
  },
  {
    id: 'mision-103',
    title: 'Cuéntame una Aventura',
    activityType: 5,
    dimension: 'MORFOSINTAXIS',
    config: { question: '¿Qué fue lo más divertido que hiciste hoy?' },
    createdAt: new Date()
  },
  {
    id: 'mision-104',
    title: 'Transportes Rápidos',
    activityType: 1,
    dimension: 'SEMANTICA',
    config: { targetWord: 'AVIÓN', imageUrl: 'https://cdn-icons-png.flaticon.com/512/789/789395.png' },
    createdAt: new Date()
  },
  {
    id: 'mision-105',
    title: 'Emociones Ocultas',
    activityType: 3,
    dimension: 'PRAGMATICA',
    config: { question: 'Si tu amigo está llorando, ¿cómo se siente?', options: ['Enojado', 'Triste', 'Feliz'], correctIndex: 1 },
    createdAt: new Date()
  },
  {
    id: 'mision-106',
    title: 'El Cuento del Rey',
    activityType: 5,
    dimension: 'DISCURSOS',
    config: { question: 'Inventa un cuento corto sobre un rey y un dragón.' },
    createdAt: new Date()
  },
  {
    id: 'mision-107',
    title: 'Aventura Espacial',
    activityType: 11,
    dimension: 'JUEGO',
    config: { question: 'Sigue los pasos para lanzar el cohete', steps: ['Ponte el traje', 'Sube a la nave', 'Presiona el botón rojo'] },
    createdAt: new Date()
  },
  {
    id: 'mision-108',
    title: 'Descubre el Sonido',
    activityType: 1,
    dimension: 'FONOLOGIA',
    config: { targetWord: 'MOTO', imageUrl: 'https://cdn-icons-png.flaticon.com/512/3033/3033140.png' },
    createdAt: new Date()
  },
  {
    id: 'mision-109',
    title: 'Las Reglas de Casa',
    activityType: 3,
    dimension: 'PRAGMATICA',
    config: { question: '¿Qué haces antes de comer?', options: ['Lavar manos', 'Jugar pelota', 'Dormir'], correctIndex: 0 },
    createdAt: new Date()
  },
  {
    id: 'mision-110',
    title: 'Receta de Cocina',
    activityType: 11,
    dimension: 'JUEGO',
    config: { question: 'Ordena los pasos para hacer un sandwich', steps: ['Tomar dos panes', 'Poner jamón y queso', 'Cerrar y comer'] },
    createdAt: new Date()
  }
];

@Injectable({
  providedIn: 'root'
})
export class ActivityConfigService {
  authService = inject(AuthService);

  private activitiesSignal = signal<ActivityConfig[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  /** Carga las actividades desde localStorage, o usa las demo si no existe nada */
  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: ActivityConfig[] = JSON.parse(raw);
        // Restaurar objetos Date
        parsed.forEach(a => a.createdAt = new Date(a.createdAt));
        this.activitiesSignal.set(parsed);
      } else {
        // Primera carga → guardar las demo
        this.activitiesSignal.set(DEFAULT_ACTIVITIES);
        this.persistToStorage();
      }
    } catch {
      this.activitiesSignal.set(DEFAULT_ACTIVITIES);
      this.persistToStorage();
    }
  }

  /** Sincroniza el estado actual hacia localStorage */
  private persistToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.activitiesSignal()));
  }

  get activities() {
    return this.activitiesSignal.asReadonly();
  }

  saveActivity(config: ActivityConfig): boolean {
    if (!this.authService.hasPermission('CREATE_ACTIVITY')) {
      console.error('Acceso denegado: Faltan permisos de CREATE_ACTIVITY');
      return false;
    }

    this.activitiesSignal.update(activities => [...activities, config]);
    this.persistToStorage();
    console.log('Actividad registrada y guardada en caché ✅', config);
    return true;
  }

  getActivity(id: string): ActivityConfig | undefined {
    return this.activitiesSignal().find(a => a.id === id);
  }
}
