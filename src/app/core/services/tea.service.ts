import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  TEAScreeningListItem,
  TEAIndicatorCatalog,
  AlertLevel,
  ApiResponse
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class TeaService {
  constructor(private api: ApiService) {}

  /** GET /api/tea/indicadores */
  getIndicators(): Observable<TEAIndicatorCatalog[]> {
    return this.api.get<TEAIndicatorCatalog>('api/tea/indicadores');
  }

  /** GET /api/tea/screenings?studentId=&schoolYearId=&alertLevel= */
  getScreenings(studentId?: string, schoolYearId?: string, alertLevel?: AlertLevel): Observable<TEAScreeningListItem[]> {
    const params: string[] = [];
    if (studentId) params.push(`studentId=${studentId}`);
    if (schoolYearId) params.push(`schoolYearId=${schoolYearId}`);
    if (alertLevel !== undefined) params.push(`alertLevel=${alertLevel}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<TEAScreeningListItem>(`api/tea/screenings${qs}`);
  }

  /** POST /api/tea/screenings */
  createScreening(request: any): Observable<ApiResponse<string>> {
    return this.api.post<string>('api/tea/screenings', request);
  }

  /** POST /api/tea/screenings/{id}/respuestas */
  upsertAnswers(screeningId: string, request: any): Observable<ApiResponse<string[]>> {
    return this.api.post<string[]>(`api/tea/screenings/${screeningId}/respuestas`, request);
  }
}
