import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api';
import {
  TEAIndicatorCatalog,
  CreateTeaScreeningRequest,
  TeaScreeningHistoryItem,
  ApiResponse
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class TeaService {
  constructor(private api: ApiService) {}

  /** GET /api/clinical/tea/indicadores */
  getIndicators(): Observable<TEAIndicatorCatalog[]> {
    return this.api.get<any[]>('api/clinical/tea/indicadores').pipe(
      map(rows => (rows || []).map(row => ({
        id: row.id ?? row.Id,
        dominio: row.dominio ?? row.Dominio ?? '',
        codigo: row.codigo ?? row.Codigo ?? '',
        descripcion: row.descripcion ?? row.Descripcion ?? '',
        orden: row.orden ?? row.Orden ?? 0
      })))
    );
  }

  /** GET /api/clinical/history/tea?studentId= */
  getScreenings(studentId: string): Observable<TeaScreeningHistoryItem[]> {
    if (!studentId) return of([]);
    return this.api.get<TeaScreeningHistoryItem[]>(`api/clinical/history/tea?studentId=${studentId}`);
  }

  /** POST /api/clinical/evaluate/tea */
  createScreening(request: CreateTeaScreeningRequest): Observable<ApiResponse<{ id: number; totalScore?: number; alertLevel?: string }>> {
    return this.api.post<{ id: number; totalScore?: number; alertLevel?: string }>('api/clinical/evaluate/tea', {
      studentId: request.studentId,
      cicloId: request.cicloId,
      contextoObs: request.contextoObs,
      respuestas: request.respuestas.map(r => ({
        indicadorId: r.indicadorId,
        frecuencia: r.frecuencia,
        intensidad: r.intensidad,
        observacion: r.observacion
      }))
    });
  }

  /** POST /api/clinical/evaluate/tea/{id}/respuestas */
  upsertAnswers(screeningId: string, request: any): Observable<ApiResponse<string[]>> {
    return this.api.post<string[]>(`api/clinical/evaluate/tea/${screeningId}/respuestas`, request);
  }

  /** PUT /api/clinical/tea/alertas/{id}/seguimiento */
  updateSeguimiento(
    screeningId: number,
    estado: 'ACTIVA' | 'EN_MONITOREO' | 'NOTIFICADA' | 'RESUELTA',
    nota?: string
  ): Observable<ApiResponse<any>> {
    return this.api.put<any>(`api/clinical/tea/alertas/${screeningId}/seguimiento`, { estado, nota });
  }
}
