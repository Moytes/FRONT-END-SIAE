import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api';
import {
  UserListItem,
  AddUserRequest,
  UpdateUserRequest,
  AssignUserGroupRequest,
  AssignUserSchoolRequest,
  EnumOption,
  UserRole,
  ApiResponse
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  /** GET /api/usuarios */
  getUsers(role?: UserRole, schoolZoneId?: string, schoolId?: string): Observable<UserListItem[]> {
    const params: string[] = [];
    if (role !== undefined) params.push(`roleId=${role}`);
    if (schoolZoneId) params.push(`schoolZoneId=${schoolZoneId}`);
    if (schoolId) params.push(`schoolId=${schoolId}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<any[]>(`api/usuarios${qs}`).pipe(
      map(users => users.map(u => ({
        ...u,
        role: u.roleId ?? u.role,
        status: u.activo ? 1 : 0,
        phoneNumber: u.phone ?? u.phoneNumber
      })))
    );
  }

  /** POST /api/usuarios */
  createUser(request: AddUserRequest): Observable<ApiResponse<string>> {
    const payload = {
      email: request.email,
      password: request.password,
      name: request.name,
      fatherLastName: request.fatherLastName,
      motherLastName: request.motherLastName,
      roleId: Number(request.role),
      schoolZoneId: request.schoolZoneId ? Number(request.schoolZoneId) : null,
      phone: request.phoneNumber || null,
      avatarUrl: request.avatarUrl || null
    };
    return this.api.post<string>('api/usuarios', payload);
  }

  /** POST /api/usuarios/{id}/supervisor-escuela */
  assignSupervisorToSchool(userId: string, schoolId: string): Observable<ApiResponse<string>> {
    return this.api.post<string>(`api/usuarios/${userId}/supervisor-escuela`, {
      schoolId: Number(schoolId)
    });
  }

  /** PUT /api/usuarios/{id} */
  updateUser(id: string, request: UpdateUserRequest): Observable<ApiResponse<any>> {
    return this.api.put<any>(`api/usuarios/${id}`, request);
  }

  /** GET /api/roles */
  getRoles(): Observable<EnumOption[]> {
    return this.api.get<any[]>('api/roles').pipe(
      map(roles => (roles || []).map(r => ({
        key: r.id || r.Id,
        value: r.clave || r.Clave,
        label: r.nombre || r.Nombre
      })))
    );
  }

  /** POST /api/usuarios/{id}/grupos */
  assignToGroup(userId: string, request: AssignUserGroupRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(`api/usuarios/${userId}/grupos`, request);
  }

  /** POST /api/usuarios/{id}/escuelas */
  assignToSchool(userId: string, request: AssignUserSchoolRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(`api/usuarios/${userId}/escuelas`, request);
  }
}
