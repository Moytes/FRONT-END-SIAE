import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { AddSesionRequest, ApiResponse, SesionListItem, UpdateSesionRequest } from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class SessionService {
  constructor(private api: ApiService) {}

  listByStudent(alumnoId: string): Observable<SesionListItem[]> {
    return this.api.get<SesionListItem[]>(`api/clinical/alumnos/${alumnoId}/sesiones`);
  }

  create(alumnoId: string, request: AddSesionRequest): Observable<ApiResponse<number>> {
    return this.api.post<number>(`api/clinical/alumnos/${alumnoId}/sesiones`, request);
  }

  update(id: number, request: UpdateSesionRequest): Observable<ApiResponse<any>> {
    return this.api.put<any>(`api/clinical/sesiones/${id}`, request);
  }

  delete(id: number): Observable<ApiResponse<any>> {
    return this.api.delete<any>(`api/clinical/sesiones/${id}`);
  }
}
