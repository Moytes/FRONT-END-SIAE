import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlumnoPortalPerfil, AlumnoPortalStudent, AlumnoTrabajo, ApiResponse } from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class AlumnoPortalService {
  constructor(private http: HttpClient) {}

  getPerfil(): Observable<AlumnoPortalPerfil> {
    return this.http.get<AlumnoPortalPerfil>('api/alumno-portal/perfil');
  }

  getAlumnos(): Observable<AlumnoPortalStudent[]> {
    return this.http.get<AlumnoPortalStudent[]>('api/alumno-portal/alumnos');
  }

  getTrabajos(alumnoId?: string): Observable<AlumnoTrabajo[]> {
    const params = alumnoId ? `?alumnoId=${alumnoId}` : '';
    return this.http.get<AlumnoTrabajo[]>(`api/v1/alumno/trabajos${params}`);
  }

  getTrabajo(id: number): Observable<AlumnoTrabajo> {
    return this.http.get<AlumnoTrabajo>(`api/v1/alumno/trabajos/${id}`);
  }

  iniciarTrabajo(id: number): Observable<any> {
    return this.http.post(`api/v1/alumno/trabajos/${id}/iniciar`, {});
  }

  completarTrabajo(id: number, respuestaJson?: string, evidenciaUrls?: string[]): Observable<any> {
    return this.http.post(`api/v1/alumno/trabajos/${id}/completar`, {
      respuestaJson,
      evidenciaUrls
    });
  }
}
