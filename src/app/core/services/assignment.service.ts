import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, Asignacion, AddAssignmentRequest, SetRetroalimentacionRequest } from '../models/api-models';

// api/v1/asignaciones vive en backend-clases (responde "crudo"), pero el
// interceptor global normaliza todo a { statusCode, data, ... } — ver la nota
// en alumno-portal.service.ts / material.service.ts.
@Injectable({ providedIn: 'root' })
export class AssignmentService {
  constructor(private http: HttpClient) {}

  /** POST /api/v1/asignaciones — asignadoPor lo deriva el backend del JWT */
  createAsignacion(request: AddAssignmentRequest): Observable<{ id: number }> {
    return this.http.post<ApiResponse<{ id: number }>>('api/v1/asignaciones', request)
      .pipe(map(r => r.data));
  }

  /** GET /api/v1/asignaciones/mias — lo que el docente autenticado ha asignado */
  getMisAsignaciones(): Observable<Asignacion[]> {
    return this.http.get<ApiResponse<Asignacion[]>>('api/v1/asignaciones/mias')
      .pipe(map(r => r.data));
  }

  /** PATCH /api/v1/asignaciones/alumnos/{id}/retroalimentacion */
  setRetroalimentacion(asignacionAlumnoId: number, request: SetRetroalimentacionRequest): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`api/v1/asignaciones/alumnos/${asignacionAlumnoId}/retroalimentacion`, request)
      .pipe(map(r => r.data));
  }
}
