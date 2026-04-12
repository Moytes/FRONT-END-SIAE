import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  PsychoeducationalAssessmentListItem,
  ApiResponse
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class PsychoService {
  constructor(private api: ApiService) {}

  /** GET /api/evaluaciones-psicopedagogicas?studentId=&schoolYearId= */
  getAssessments(studentId?: string, schoolYearId?: string): Observable<PsychoeducationalAssessmentListItem[]> {
    const params: string[] = [];
    if (studentId) params.push(`studentId=${studentId}`);
    if (schoolYearId) params.push(`schoolYearId=${schoolYearId}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<PsychoeducationalAssessmentListItem>(`api/evaluaciones-psicopedagogicas${qs}`);
  }

  /** POST /api/evaluaciones-psicopedagogicas */
  createAssessment(request: any): Observable<ApiResponse<string>> {
    return this.api.post<string>('api/evaluaciones-psicopedagogicas', request);
  }

  /** PUT /api/evaluaciones-psicopedagogicas/{id} */
  updateAssessment(id: string, request: any): Observable<ApiResponse<any>> {
    return this.api.put<any>(`api/evaluaciones-psicopedagogicas/${id}`, request);
  }

  /** POST /api/evaluaciones-psicopedagogicas/{id}/bap */
  syncBaps(id: string, request: any): Observable<ApiResponse<string[]>> {
    return this.api.post<string[]>(`api/evaluaciones-psicopedagogicas/${id}/bap`, request);
  }

  /** POST /api/evaluaciones-psicopedagogicas/{id}/colaboradores */
  syncCollaborators(id: string, request: any): Observable<ApiResponse<string[]>> {
    return this.api.post<string[]>(`api/evaluaciones-psicopedagogicas/${id}/colaboradores`, request);
  }
}
