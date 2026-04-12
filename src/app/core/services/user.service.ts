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
    if (role !== undefined) params.push(`role=${role}`);
    if (schoolZoneId) params.push(`schoolZoneId=${schoolZoneId}`);
    if (schoolId) params.push(`schoolId=${schoolId}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<UserListItem>(`api/usuarios${qs}`);
  }

  /** POST /api/usuarios */
  createUser(request: AddUserRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>('api/usuarios', request);
  }

  /** PUT /api/usuarios/{id} */
  updateUser(id: string, request: UpdateUserRequest): Observable<ApiResponse<any>> {
    return this.api.put<any>(`api/usuarios/${id}`, request);
  }

  /** GET /api/roles */
  getRoles(): Observable<EnumOption[]> {
    return this.api.get<EnumOption>('api/roles');
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
