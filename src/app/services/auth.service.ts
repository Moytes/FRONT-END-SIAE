import { Injectable, signal } from '@angular/core';

export type PermissionKey =
  | 'GESTION_ACTIVIDADES'
  | 'APLICACION'
  | 'ANALISIS_IA'
  | 'PLAN_ACCION'
  | 'REPORTES'
  | 'LECTURA_ALUMNO';

export interface User {
  id: number;
  username: string;
  name: string;
  type: 'maestro' | 'alumno';
  email: string;
  password?: string;
  avatar: string;
  permissions: PermissionKey[];
}

const STATIC_USERS: User[] = [
  {
    id: 1,
    username: 'maestro',
    name: 'Dr. Roberto Gómez',
    type: 'maestro',
    email: 'roberto.gomez@institucion.edu',
    password: '123',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Roberto+Gomez&backgroundColor=1a365d',
    permissions: [
      'GESTION_ACTIVIDADES',
      'APLICACION',
      'ANALISIS_IA',
      'PLAN_ACCION',
      'REPORTES',
      'LECTURA_ALUMNO'
    ]
  },
  {
    id: 2,
    username: 'alumno',
    name: 'Ana López',
    type: 'alumno',
    email: 'ana.lopez@alumno.institucion.edu',
    password: '123',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Ana+Lopez&backgroundColor=0ea5e9',
    permissions: [
      'APLICACION',
      'LECTURA_ALUMNO'
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private readonly STORAGE_KEY = 'SIAE_USER_SESSION';


  private currentUserSignal = signal<User | null>(null);

  constructor() {
    this.loadSession();
  }

  // Recupera la sesión al refrescar la
  private loadSession() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.currentUserSignal.set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error leyendo sesión del caché:', e);
    }
  }

  get currentUser() {
    return this.currentUserSignal.asReadonly();
  }

  // Login real validando email y password
  async login(email: string, password?: string): Promise<boolean> {
    const user = STATIC_USERS.find(u => u.email === email && u.password === password);
    if (user) {
      this.currentUserSignal.set(user);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  }

  logout() {
    this.currentUserSignal.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  hasPermission(permission: PermissionKey): boolean {
    const user = this.currentUserSignal();
    if (!user) return false;
    return user.permissions.includes(permission);
  }
}
