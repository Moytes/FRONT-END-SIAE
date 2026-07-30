import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlumnoPortalPerfil, AlumnoPortalStudent, AlumnoTrabajo, ApiResponse, StudentHistorial } from '../models/api-models';

// NOTA IMPORTANTE: el interceptor global (api-gateway.interceptor.ts) envuelve
// CUALQUIER respuesta que no traiga ya un campo `statusCode` en
// { statusCode, message, data: <respuesta original> } — esto aplica tanto a
// backend-core (que ya envuelve por su cuenta, así que el interceptor no toca
// nada) como a backend-clases (que responde "crudo": arrays/objetos planos,
// y por eso el interceptor SÍ los envuelve). En ambos casos, lo que llega
// aquí siempre tiene la forma ApiResponse<T> — hay que desenvolver `.data`
// siempre, sin excepción.
@Injectable({ providedIn: 'root' })
export class AlumnoPortalService {
  constructor(private http: HttpClient) {}

  getPerfil(): Observable<AlumnoPortalPerfil> {
    return this.http.get<ApiResponse<AlumnoPortalPerfil>>('api/alumno-portal/perfil')
      .pipe(map(r => r.data));
  }

  getAlumnos(): Observable<AlumnoPortalStudent[]> {
    return this.http.get<ApiResponse<AlumnoPortalStudent[]>>('api/alumno-portal/alumnos')
      .pipe(map(r => r.data));
  }

  getTrabajos(alumnoId?: string): Observable<AlumnoTrabajo[]> {
    const params = alumnoId ? `?alumnoId=${alumnoId}` : '';
    return this.http.get<ApiResponse<AlumnoTrabajo[]>>(`api/v1/alumno/trabajos${params}`)
      .pipe(map(r => r.data));
  }

  getTrabajo(id: number): Observable<AlumnoTrabajo> {
    return this.http.get<ApiResponse<AlumnoTrabajo>>(`api/v1/alumno/trabajos/${id}`)
      .pipe(map(r => r.data));
  }

  iniciarTrabajo(id: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(`api/v1/alumno/trabajos/${id}/iniciar`, {})
      .pipe(map(r => r.data));
  }

  completarTrabajo(id: number, respuestaJson?: string, evidenciaUrls?: string[]): Observable<any> {
    return this.http.post<ApiResponse<any>>(`api/v1/alumno/trabajos/${id}/completar`, {
      respuestaJson,
      evidenciaUrls
    }).pipe(map(r => r.data));
  }

  /** GET /api/alumno-portal/alumnos/{id}/historial — solo TUTOR, alumnos vinculados a su cuenta */
  getHistorial(alumnoId: string): Observable<StudentHistorial> {
    return this.http.get<ApiResponse<StudentHistorial>>(`api/alumno-portal/alumnos/${alumnoId}/historial`)
      .pipe(map(r => r.data));
  }

  /**
   * GET /api/alumno-portal/alumnos/{id}/reporte-pdf — descarga el PDF y dispara
   * la descarga en el navegador. No hay precedente de descarga de blobs en el
   * proyecto; se pide con responseType 'blob' y se crea un ObjectURL temporal.
   */
  descargarReportePdf(alumnoId: string, nombreArchivo = `reporte-${alumnoId}.pdf`): Observable<void> {
    return this.http
      .get(`api/alumno-portal/alumnos/${alumnoId}/reporte-pdf`, { responseType: 'blob' })
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
