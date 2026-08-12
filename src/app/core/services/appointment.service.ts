import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  ApiResponse,
  ScheduleAppointmentRequest,
  ScheduleAppointmentResult,
  CitaListItem
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  constructor(private api: ApiService) {}

  schedule(request: ScheduleAppointmentRequest): Observable<ApiResponse<ScheduleAppointmentResult>> {
    return this.api.post<ScheduleAppointmentResult>('api/clinical/citas', request);
  }

  /** GET /api/clinical/citas?from=&to=&alumnoId= */
  list(from?: string, to?: string, alumnoId?: string): Observable<CitaListItem[]> {
    const params: string[] = [];
    if (from) params.push(`from=${from}`);
    if (to) params.push(`to=${to}`);
    if (alumnoId) params.push(`alumnoId=${alumnoId}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<CitaListItem[]>(`api/clinical/citas${qs}`);
  }

  /** PUT /api/clinical/citas/{id}/estado */
  updateEstado(id: number, estado: 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA'): Observable<ApiResponse<any>> {
    return this.api.put<any>(`api/clinical/citas/${id}/estado`, { estado });
  }
}
