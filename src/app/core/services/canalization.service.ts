import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  CanalizationListItem,
  AddCanalizationRequest,
  UpdateCanalizationStatusRequest,
  AttendCanalizationRequest,
  CanalizationStatus,
  ApiResponse
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class CanalizationService {
  constructor(private api: ApiService) {}

  /** GET /api/canalizaciones?estado=&solicitanteId=&receptorId= */
  getCanalizations(
    estado?: CanalizationStatus,
    solicitanteId?: string,
    receptorId?: string
  ): Observable<CanalizationListItem[]> {
    const params: string[] = [];
    if (estado !== undefined) params.push(`estado=${estado}`);
    if (solicitanteId) params.push(`solicitanteId=${solicitanteId}`);
    if (receptorId) params.push(`receptorId=${receptorId}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<CanalizationListItem[]>(`api/canalizaciones${qs}`);
  }

  /** POST /api/canalizaciones */
  createCanalization(request: AddCanalizationRequest): Observable<ApiResponse<number>> {
    return this.api.post<number>('api/canalizaciones', request);
  }

  /** PUT /api/canalizaciones/{id}/estado */
  updateStatus(id: number, request: UpdateCanalizationStatusRequest): Observable<ApiResponse<any>> {
    return this.api.put<any>(`api/canalizaciones/${id}/estado`, request);
  }

  /** PUT /api/canalizaciones/{id}/atender */
  attend(id: number, request: AttendCanalizationRequest): Observable<ApiResponse<any>> {
    return this.api.put<any>(`api/canalizaciones/${id}/atender`, request);
  }
}
