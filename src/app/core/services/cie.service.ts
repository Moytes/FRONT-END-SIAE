import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  CIEEvaluationListItem,
  CIEDimensionCatalog,
  AlertLevel,
  ApiResponse
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class CieService {
  constructor(private api: ApiService) {}

  /** GET /api/cie/catalogos/dimensiones */
  getDimensions(): Observable<CIEDimensionCatalog[]> {
    return this.api.get<CIEDimensionCatalog>('api/cie/catalogos/dimensiones');
  }

  /** GET /api/cie/evaluaciones?studentId=&schoolYearId=&dimensionId= */
  getEvaluations(studentId?: string, schoolYearId?: string, dimensionId?: string): Observable<CIEEvaluationListItem[]> {
    const params: string[] = [];
    if (studentId) params.push(`studentId=${studentId}`);
    if (schoolYearId) params.push(`schoolYearId=${schoolYearId}`);
    if (dimensionId) params.push(`dimensionId=${dimensionId}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<CIEEvaluationListItem>(`api/cie/evaluaciones${qs}`);
  }

  /** POST /api/cie/evaluaciones */
  createEvaluation(request: any): Observable<ApiResponse<string>> {
    return this.api.post<string>('api/cie/evaluaciones', request);
  }

  /** POST /api/cie/evaluaciones/{id}/respuestas */
  upsertAnswers(evaluationId: string, request: any): Observable<ApiResponse<string[]>> {
    return this.api.post<string[]>(`api/cie/evaluaciones/${evaluationId}/respuestas`, request);
  }

  /** POST /api/cie/evaluaciones/{id}/fonoarticulador */
  upsertPhonologyAnswers(evaluationId: string, request: any): Observable<ApiResponse<string[]>> {
    return this.api.post<string[]>(`api/cie/evaluaciones/${evaluationId}/fonoarticulador`, request);
  }
}
