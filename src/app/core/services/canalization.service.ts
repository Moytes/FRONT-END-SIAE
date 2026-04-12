import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  CanalizationListItem,
  AddCanalizationRequest,
  UpdateCanalizationStatusRequest,
  CanalizationStatus,
  ApiResponse
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class CanalizationService {
  constructor(private api: ApiService) {}

  /** GET /api/canalizaciones?status=&requesterId=&receiverId= */
  getCanalizations(
    status?: CanalizationStatus,
    requesterId?: string,
    receiverId?: string
  ): Observable<CanalizationListItem[]> {
    const params: string[] = [];
    if (status !== undefined) params.push(`status=${status}`);
    if (requesterId) params.push(`requesterId=${requesterId}`);
    if (receiverId) params.push(`receiverId=${receiverId}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<CanalizationListItem>(`api/canalizaciones${qs}`);
  }

  /** POST /api/canalizaciones */
  createCanalization(request: AddCanalizationRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>('api/canalizaciones', request);
  }

  /** PUT /api/canalizaciones/{id}/estado */
  updateStatus(id: string, request: UpdateCanalizationStatusRequest): Observable<ApiResponse<any>> {
    return this.api.put<any>(`api/canalizaciones/${id}/estado`, request);
  }
}
