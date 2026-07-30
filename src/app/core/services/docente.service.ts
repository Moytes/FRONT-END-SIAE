import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, StudentHistorial, StudentHistorialAttentionArea } from '../models/api-models';

// api/docente vive en backend-core, que ya envuelve sus respuestas en
// { statusCode, data, ... } — mismo patrón que alumno-portal.service.ts.
@Injectable({ providedIn: 'root' })
export class DocenteService {
  constructor(private http: HttpClient) {}

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
