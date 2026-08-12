import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, DocenteObservacion, StudentHistorial, StudentHistorialAttentionArea, StudentListItem } from '../models/api-models';

// api/docente vive en backend-core, que ya envuelve sus respuestas en
// { statusCode, data, ... } — mismo patrón que alumno-portal.service.ts.
@Injectable({ providedIn: 'root' })
export class DocenteService {
  constructor(private http: HttpClient) {}

  /** GET /api/docente/alumnos — alumnos de los grupos del docente autenticado */
  getAlumnos(search?: string, groupId?: number, schoolYearId?: number): Observable<StudentListItem[]> {
    let params = new HttpParams();
    if (search?.trim()) params = params.set('search', search.trim());
    if (groupId != null) params = params.set('groupId', String(groupId));
    if (schoolYearId != null) params = params.set('schoolYearId', String(schoolYearId));
    return this.http.get<ApiResponse<StudentListItem[]>>('api/docente/alumnos', { params })
      .pipe(map(r => r.data));
  }

  /** GET /api/docente/alumnos/{id}/historial — solo alumnos del grupo del docente */
  getHistorial(alumnoId: string): Observable<StudentHistorial> {
    return this.http.get<ApiResponse<StudentHistorial>>(`api/docente/alumnos/${alumnoId}/historial`)
      .pipe(map(r => r.data));
  }

  /** GET /api/docente/alumnos/{id}/areas-atencion */
  getAreasAtencion(alumnoId: string): Observable<StudentHistorialAttentionArea[]> {
    return this.http.get<ApiResponse<StudentHistorialAttentionArea[]>>(`api/docente/alumnos/${alumnoId}/areas-atencion`)
      .pipe(map(r => r.data));
  }

  getObservaciones(alumnoId: string): Observable<DocenteObservacion[]> {
    return this.http.get<ApiResponse<DocenteObservacion[]>>(`api/docente/alumnos/${alumnoId}/observaciones`)
      .pipe(map(r => r.data));
  }

  addObservacion(alumnoId: string, body: { texto: string; schoolYearId?: number }): Observable<DocenteObservacion> {
    return this.http.post<ApiResponse<DocenteObservacion>>(`api/docente/alumnos/${alumnoId}/observaciones`, body)
      .pipe(map(r => r.data));
  }

  /**
   * GET /api/docente/alumnos/{id}/reporte-pdf — descarga el PDF y dispara la
   * descarga en el navegador (mismo patrón que alumno-portal.service.ts).
   */
  descargarReportePdf(alumnoId: string, nombreArchivo = `reporte-${alumnoId}.pdf`): Observable<void> {
    return this.http
      .get(`api/docente/alumnos/${alumnoId}/reporte-pdf`, { responseType: 'blob' })
      .pipe(
        map(blob => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = nombreArchivo;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        })
      );
  }
}
