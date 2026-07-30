import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, EvaluacionDetalle, SesionPsicologica } from '../models/api-models';

// api/clinical/tutor vive en backend-reportes, que ya envuelve sus respuestas
// en su propio ApiResponse<T> (statusCode/data) — el interceptor global lo
// detecta y lo deja pasar sin re-envolver. De cualquier forma, siempre
// llegamos como ApiResponse<T> y hay que desenvolver `.data`.
@Injectable({ providedIn: 'root' })
export class TutorClinicoService {
  constructor(private http: HttpClient) {}

  /** GET /api/clinical/tutor/alumnos/{id}/evaluaciones — solo alumnos vinculados a la cuenta */
  getEvaluaciones(alumnoId: string): Observable<EvaluacionDetalle[]> {
    return this.http
      .get<ApiResponse<EvaluacionDetalle[]>>(`api/clinical/tutor/alumnos/${alumnoId}/evaluaciones`)
      .pipe(map(r => r.data));
  }

  /** GET /api/clinical/tutor/alumnos/{id}/sesiones — solo alumnos vinculados a la cuenta */
  getSesiones(alumnoId: string): Observable<SesionPsicologica[]> {
    return this.http
      .get<ApiResponse<SesionPsicologica[]>>(`api/clinical/tutor/alumnos/${alumnoId}/sesiones`)
      .pipe(map(r => r.data));
  }
}
