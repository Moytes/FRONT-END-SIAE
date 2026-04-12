import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { ApiResponse } from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class StudentSupportService {
  constructor(private api: ApiService) {}

  /** GET /api/alumnos/{id}/discapacidades */
  getStudentDisabilities(studentId: string): Observable<any[]> {
    return this.api.get<any>(`api/alumnos/${studentId}/discapacidades`);
  }

  /** POST /api/alumnos/{id}/discapacidades */
  addStudentDisability(studentId: string, request: any): Observable<ApiResponse<string>> {
    return this.api.post<string>(`api/alumnos/${studentId}/discapacidades`, request);
  }

  /** POST /api/alumnos/{id}/areas-atencion */
  assignAttentionAreas(studentId: string, request: any): Observable<ApiResponse<string[]>> {
    return this.api.post<string[]>(`api/alumnos/${studentId}/areas-atencion`, request);
  }

  /** POST /api/alumnos/{id}/modalidad-atencion */
  addAttentionMode(studentId: string, request: any): Observable<ApiResponse<string>> {
    return this.api.post<string>(`api/alumnos/${studentId}/modalidad-atencion`, request);
  }
}
