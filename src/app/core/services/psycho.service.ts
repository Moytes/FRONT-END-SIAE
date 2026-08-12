import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  PsychoeducationalAssessmentListItem,
  PsychoeducationalAssessmentDetail,
  SavePsychoeducationalAssessmentRequest,
  EvalPsicoBap,
  EvalPsicoColaborador,
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
    return this.api.get<PsychoeducationalAssessmentListItem[]>(`api/clinical/evaluaciones-psicopedagogicas${qs}`);
  }

  /** GET /api/evaluaciones-psicopedagogicas/{id} */
  getAssessment(id: string | number): Observable<PsychoeducationalAssessmentDetail> {
    return this.api.get<PsychoeducationalAssessmentDetail>(`api/clinical/evaluaciones-psicopedagogicas/${id}`);
  }

  /** POST /api/evaluaciones-psicopedagogicas */
  createAssessment(request: SavePsychoeducationalAssessmentRequest): Observable<ApiResponse<number>> {
    return this.api.post<number>('api/clinical/evaluaciones-psicopedagogicas', request);
  }

  /** PUT /api/evaluaciones-psicopedagogicas/{id} */
  updateAssessment(id: string | number, request: SavePsychoeducationalAssessmentRequest): Observable<ApiResponse<any>> {
    return this.api.put<any>(`api/clinical/evaluaciones-psicopedagogicas/${id}`, request);
  }

  /** GET /api/clinical/evaluaciones-psicopedagogicas/{id}/bap */
  getBaps(id: string | number): Observable<EvalPsicoBap[]> {
    return this.api.get<EvalPsicoBap[]>(`api/clinical/evaluaciones-psicopedagogicas/${id}/bap`);
  }

  /** GET /api/clinical/evaluaciones-psicopedagogicas/{id}/colaboradores */
  getCollaborators(id: string | number): Observable<EvalPsicoColaborador[]> {
    return this.api.get<EvalPsicoColaborador[]>(`api/clinical/evaluaciones-psicopedagogicas/${id}/colaboradores`);
  }

  /** PUT /api/clinical/evaluaciones-psicopedagogicas/{id}/bap */
  syncBaps(id: string | number, items: EvalPsicoBap[]): Observable<ApiResponse<any>> {
    return this.api.put<any>(`api/clinical/evaluaciones-psicopedagogicas/${id}/bap`, { items });
  }

  /** PUT /api/clinical/evaluaciones-psicopedagogicas/{id}/colaboradores */
  syncCollaborators(id: string | number, items: EvalPsicoColaborador[]): Observable<ApiResponse<any>> {
    return this.api.put<any>(`api/clinical/evaluaciones-psicopedagogicas/${id}/colaboradores`, { items });
  }
}
