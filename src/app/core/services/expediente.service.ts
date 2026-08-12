import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api';
import { ExpedienteDto } from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class ExpedienteService {
  constructor(private api: ApiService, private http: HttpClient) {}

  getExpediente(alumnoId: string): Observable<ExpedienteDto> {
    return this.api.get<ExpedienteDto>(`api/clinical/alumnos/${alumnoId}/expediente`);
  }

  /** GET /api/clinical/alumnos/{id}/expediente/pdf — descarga el expediente completo en PDF. */
  descargarExpedientePdf(alumnoId: string, nombreArchivo = `expediente-${alumnoId}.pdf`): Observable<void> {
    return this.http
      .get(`api/clinical/alumnos/${alumnoId}/expediente/pdf`, { responseType: 'blob' })
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
