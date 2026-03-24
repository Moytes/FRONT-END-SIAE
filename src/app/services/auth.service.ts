import { Injectable, signal } from '@angular/core';

export interface User {
  id: number;
  username: string;
  name: string;
  type: 'maestro' | 'alumno';
  email: string;
  password?: string;
  avatar: string;
  permissions: string[];
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
      'view_home_maestro',
      'view_perfil',
      'manage_grades',
      'manage_courses',
      'view_reports',
      'VIEW_MASTER_PANEL',
      'CREATE_ACTIVITY',
      'EXECUTE_EVALUATION'
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
      'view_home_alumno',
      'view_perfil',
      'view_my_grades',
      'view_my_courses',
      'VIEW_STUDENT_PANEL',
      'PLAY_ACTIVITY'
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // Clave para guardar en el navegador
  private readonly STORAGE_KEY = 'SIAE_USER_SESSION';

  // Estado inicial
  private currentUserSignal = signal<User | null>(null);

  constructor() {
    this.loadSession();
  }

  // Recupera la sesión al refrescar la página
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

  hasPermission(permission: string): boolean {
    const user = this.currentUserSignal();
    if (!user) return false;
    return user.permissions.includes(permission);
  }
}
