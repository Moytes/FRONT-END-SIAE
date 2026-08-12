import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiResponse,
  Asignacion,
  AddAssignmentRequest,
  SetRetroalimentacionRequest,
  SetEstadoAsignacionRequest,
  EstadoAsignacion,
  AsignacionProgresoItem,
  AsignacionResumen
} from '../models/api-models';

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

  /** PATCH /api/v1/asignaciones/alumnos/{id}/estado */
  setEstado(asignacionAlumnoId: number, estado: EstadoAsignacion): Observable<{ id: number; estado: EstadoAsignacion }> {
    return this.http.patch<ApiResponse<{ id: number; estado: EstadoAsignacion }>>(
      `api/v1/asignaciones/alumnos/${asignacionAlumnoId}/estado`,
      { estado }
    ).pipe(map(r => r.data));
  }

  /** GET /api/v1/asignaciones/alumno/{alumnoId} */
  getByAlumno(alumnoId: string): Observable<AsignacionProgresoItem[]> {
    return this.http.get<ApiResponse<AsignacionProgresoItem[]>>(`api/v1/asignaciones/alumno/${alumnoId}`)
      .pipe(map(r => r.data));
  }

  /** GET /api/v1/asignaciones/resumen */
  getResumen(schoolYearId?: number): Observable<AsignacionResumen> {
    const q = schoolYearId != null ? `?schoolYearId=${schoolYearId}` : '';
    return this.http.get<ApiResponse<AsignacionResumen>>(`api/v1/asignaciones/resumen${q}`)
      .pipe(map(r => r.data));
  }
}
