import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api';
import {
  ApiResponse,
  School,
  SupervisorCreateStaffRequest,
  SupervisorUpdateStaffRequest,
  UserListItem,
  UserRole
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class SupervisorZoneService {
  constructor(private api: ApiService) {}

  getSchools(): Observable<School[]> {
    return this.api.get<School[]>('api/supervisor/escuelas');
  }

  getStaff(roleId?: UserRole | '', schoolId?: string): Observable<UserListItem[]> {
    const params: string[] = [];
    if (roleId) params.push(`roleId=${Number(roleId)}`);
    if (schoolId) params.push(`schoolId=${Number(schoolId)}`);
    const qs = params.length ? `?${params.join('&')}` : '';

    return this.api.get<any[]>(`api/supervisor/personal${qs}`).pipe(
      map(users => (users || []).map(user => ({
        ...user,
        role: Number(user.roleId ?? user.role),
        status: user.activo ? 1 : 0,
        phoneNumber: user.phone ?? user.phoneNumber,
        schoolId: user.schoolId?.toString()
      })))
    );
  }

  createStaff(request: SupervisorCreateStaffRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>('api/supervisor/personal', {
      ...request,
      roleId: Number(request.roleId),
      schoolId: Number(request.schoolId),
      phone: request.phone || null,
      avatarUrl: request.avatarUrl || null
    });
  }

  updateStaff(userId: string, request: SupervisorUpdateStaffRequest): Observable<ApiResponse<any>> {
    return this.api.put<any>(`api/supervisor/personal/${userId}`, {
      ...request,
      roleId: Number(request.roleId),
      schoolId: Number(request.schoolId),
      phone: request.phone || null,
      avatarUrl: request.avatarUrl || null
    });
  }
}
