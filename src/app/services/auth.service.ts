import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  CurrentUser,
  LoginRequest,
  LoginResponse,
  ApiResponse,
  UserRole,
  Especialidad
} from '../core/models/api-models';

export type PermissionKey =
  | 'GESTION_ACTIVIDADES'
  | 'APLICACION'
  | 'ANALISIS_IA'
  | 'PLAN_ACCION'
  | 'PSICOLOGIA'
  | 'APRENDIZAJE'
  | 'COMUNICACION'
  | 'REPORTES'
  | 'LECTURA_ALUMNO'
  | 'GESTION_GRUPOS'
  | 'GESTION_ESCUELAS'
  | 'ADMIN'
  | 'PORTAL_ALUMNO';

// Map backend roles → frontend permission keys
function rolesPermissions(role: UserRole): PermissionKey[] {
  switch (role) {
    case UserRole.ADMIN:
      // LECTURA_ALUMNO da acceso a /gestion-user — el único lugar del frontend con el
      // formulario de alta/edición de alumno, y StudentController.CreateStudent/UpdateStudent
      // son [Authorize(Roles="ADMIN")] en el backend, así que sin esto ADMIN no podía
      // crear alumnos desde ninguna pantalla.
      return ['ADMIN', 'GESTION_GRUPOS', 'GESTION_ESCUELAS', 'LECTURA_ALUMNO'];
    case UserRole.ESPECIALISTA:
      // Un solo rol para los 3 tipos de especialista (ver UserRole): cada endpoint clínico
      // que se restringió alguna vez a un solo tipo terminó necesitando abrirse a los 3, así
      // que aquí se otorga la unión completa — cualquier especialista puede entrar a las 3
      // pantallas de área (Comunicación/Psicología/Aprendizaje), no solo a la suya. Su
      // "especialidad" (CurrentUser.especialidad) solo decide dónde aterriza por defecto.
      return [
        'COMUNICACION', 'PSICOLOGIA', 'APRENDIZAJE',
        'REPORTES', 'LECTURA_ALUMNO', 'PLAN_ACCION', 'GESTION_ACTIVIDADES', 'APLICACION'
      ];
    case UserRole.DOCENTE:
      return ['APLICACION', 'LECTURA_ALUMNO'];
    case UserRole.TUTOR:
      return ['PORTAL_ALUMNO'];
    default:
      return ['APLICACION'];
  }
}

const TOKEN_KEY = 'SIAE_JWT_TOKEN';
const SESSION_KEY = 'SIAE_USER_SESSION';

function normalizeRole(role: UserRole | string | number): UserRole {
  return Number(role) as UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<CurrentUser | null>(null);
  private permissionsSignal = signal<PermissionKey[]>([]);

  constructor(private http: HttpClient) {
    this.loadSession();
  }

  private loadSession() {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      if (stored && token) {
        const user: CurrentUser = JSON.parse(stored);
        user.role = normalizeRole(user.role);
        const knownRoles = new Set([
          UserRole.ADMIN,
          UserRole.ESPECIALISTA,
          UserRole.DOCENTE,
          UserRole.TUTOR
        ]);
        if (!user.role || isNaN(user.role) || !knownRoles.has(user.role)) {
          this.clearSession();
          return;
        }
        this.currentUserSignal.set(user);
        this.permissionsSignal.set(rolesPermissions(user.role));
      } else if (!token) {
        this.clearSession();
      }
    } catch (e) {
      console.error('Error leyendo sesión:', e);
      this.clearSession();
    }
  }

  private clearSession() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    this.currentUserSignal.set(null);
    this.permissionsSignal.set([]);
  }

  get currentUser() {
    return this.currentUserSignal.asReadonly();
  }

  get permissions() {
    return this.permissionsSignal.asReadonly();
  }

  /** Real login against POST /api/auth/login */
  async login(email: string, password: string): Promise<boolean> {
    try {
      const body: LoginRequest = { email, password };
      const res = await firstValueFrom(
        this.http.post<ApiResponse<LoginResponse>>('api/auth/login', body)
      );

      if (res.statusCode === 200 && res.data) {
        const { token } = res.data;
        localStorage.setItem(TOKEN_KEY, token);

        // Fetch full user profile
        await this.loadMe();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Login error:', err);
      return false;
    }
  }

  /** Load current user from GET /api/auth/me */
  async loadMe(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<CurrentUser>>('api/auth/me')
      );
      if (res.statusCode === 200 && res.data) {
        const raw = res.data as any;
        const user: CurrentUser = {
          ...raw,
          role: normalizeRole(raw.roleId ?? raw.role),
          phoneNumber: raw.phone ?? raw.phoneNumber,
          status: raw.activo ? 1 : 0
        };
        this.currentUserSignal.set(user);
        this.permissionsSignal.set(rolesPermissions(user.role));
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      }
    } catch (err) {
      console.error('loadMe error:', err);
    }
  }

  /**
   * Autoedición de perfil — PUT /api/auth/me. Solo los campos que el propio
   * usuario puede tocar (nombre, apellidos, teléfono, avatar); el backend
   * conserva rol/zona/estado tal cual y responde con el usuario actualizado.
   */
  async updateMyProfile(data: {
    name: string;
    fatherLastName: string;
    motherLastName?: string;
    phone?: string;
    avatarUrl?: string;
  }): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await firstValueFrom(
        this.http.put<ApiResponse<CurrentUser>>('api/auth/me', data)
      );
      if (res.statusCode === 200 && res.data) {
        const raw = res.data as any;
        const user: CurrentUser = {
          ...raw,
          role: normalizeRole(raw.roleId ?? raw.role),
          phoneNumber: raw.phone ?? raw.phoneNumber,
          status: raw.activo ? 1 : 0
        };
        this.currentUserSignal.set(user);
        this.permissionsSignal.set(rolesPermissions(user.role));
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      }
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err?.error?.message ?? err?.error ?? 'No se pudo actualizar el perfil.' };
    }
  }

  /** Cambio de contraseña propia — POST /api/auth/me/password */
  async changeMyPassword(currentPassword: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
    try {
      await firstValueFrom(
        this.http.post<ApiResponse<any>>('api/auth/me/password', { currentPassword, newPassword })
      );
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err?.error?.message ?? err?.error ?? 'No se pudo cambiar la contraseña.' };
    }
  }

  /** Logout — calls backend and clears local storage */
  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<ApiResponse<any>>('api/auth/logout', {})
      );
    } catch { /* ignore */ } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
      this.currentUserSignal.set(null);
      this.permissionsSignal.set([]);
    }
  }

  hasPermission(permission: PermissionKey): boolean {
    return this.permissionsSignal().includes(permission);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSignal() && !!localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRoleName(): string {
    const user = this.currentUserSignal();
    if (!user) return '';
    const role = normalizeRole(user.role);
    if (role === UserRole.ESPECIALISTA) {
      return especialidadLabel(user.especialidad);
    }
    const roleNames: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.ESPECIALISTA]: 'Especialista',
      [UserRole.DOCENTE]: 'Docente',
      [UserRole.TUTOR]: 'Tutor'
    };
    return roleNames[role] ?? 'Usuario';
  }

  getDefaultRoute(): string {
    const user = this.currentUserSignal();
    if (!user) return '/login';

    switch (normalizeRole(user.role)) {
      case UserRole.ADMIN:
        return '/admin';
      case UserRole.ESPECIALISTA:
        // La especialidad solo decide la pantalla de inicio por defecto; el usuario puede
        // navegar a las otras 2 áreas igual (rolesPermissions le da acceso a las 3).
        switch (user.especialidad) {
          case 'COMUNICACION': return '/comunicacion';
          case 'APRENDIZAJE': return '/aprendizaje';
          case 'PSICOLOGIA':
          default:
            return '/especialista';
        }
      case UserRole.DOCENTE:
        return '/docente';
      case UserRole.TUTOR:
        return '/alumno';
      default:
        return '/login';
    }
  }
}

function especialidadLabel(especialidad?: Especialidad): string {
  const labels: Record<Especialidad, string> = {
    PSICOLOGIA: 'Especialista en Psicología',
    COMUNICACION: 'Especialista en Comunicación',
    APRENDIZAJE: 'Especialista en Aprendizaje'
  };
  return especialidad ? labels[especialidad] : 'Especialista';
}
