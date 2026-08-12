import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, TutorCita, TutorEvaluacionResumen } from '../models/api-models';

// api/clinical/tutor vive en backend-reportes, que ya envuelve sus respuestas
// en su propio ApiResponse<T> (statusCode/data) — el interceptor global lo
// detecta y lo deja pasar sin re-envolver. De cualquier forma, siempre
// llegamos como ApiResponse<T> y hay que desenvolver `.data`.
@Injectable({ providedIn: 'root' })
export class TutorClinicoService {
  constructor(private http: HttpClient) {}

  /** GET /api/clinical/tutor/alumnos/{id}/evaluaciones — resumen sin campos clínicos */
  getEvaluaciones(alumnoId: string): Observable<TutorEvaluacionResumen[]> {
    return this.http
      .get<ApiResponse<TutorEvaluacionResumen[]>>(`api/clinical/tutor/alumnos/${alumnoId}/evaluaciones`)
      .pipe(map(r => r.data));
  }

  /** GET /api/clinical/tutor/alumnos/{id}/citas */
  getCitas(alumnoId: string, from?: string, to?: string): Observable<TutorCita[]> {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    return this.http
      .get<ApiResponse<TutorCita[]>>(`api/clinical/tutor/alumnos/${alumnoId}/citas${qs ? `?${qs}` : ''}`)
      .pipe(map(r => r.data));
  }
}
