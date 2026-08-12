import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api';
import {
  StudentDataSheetItem,
  CIESummaryItem,
  TEAAlertItem,
  AlertLevel
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private api: ApiService, private http: HttpClient) {}

  /** GET /api/clinical/reportes/sabana-datos?schoolId=&schoolYearId= */
  getStudentDataSheet(schoolId?: string, schoolYearId?: string): Observable<StudentDataSheetItem[]> {
    const params: string[] = [];
    if (schoolId) params.push(`schoolId=${schoolId}`);
    if (schoolYearId) params.push(`schoolYearId=${schoolYearId}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<StudentDataSheetItem[]>(`api/clinical/reportes/sabana-datos${qs}`);
  }

  /** GET /api/clinical/reportes/resumen-cie?studentId=&schoolYearId=&schoolId= */
  getCIESummary(studentId?: string, schoolYearId?: string, schoolId?: string): Observable<CIESummaryItem[]> {
    const params: string[] = [];
    if (studentId) params.push(`studentId=${studentId}`);
    if (schoolYearId) params.push(`schoolYearId=${schoolYearId}`);
    if (schoolId) params.push(`schoolId=${schoolId}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<CIESummaryItem[]>(`api/clinical/reportes/resumen-cie${qs}`);
  }

  /** GET /api/clinical/reportes/alertas-tea?schoolYearId=&schoolId=&alertLevel= */
  getTEAAlerts(schoolYearId?: string, alertLevel?: AlertLevel, schoolId?: string): Observable<TEAAlertItem[]> {
    const params: string[] = [];
    if (schoolYearId) params.push(`schoolYearId=${schoolYearId}`);
    if (schoolId) params.push(`schoolId=${schoolId}`);
    if (alertLevel !== undefined) params.push(`alertLevel=${alertLevel}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<TEAAlertItem[]>(`api/clinical/reportes/alertas-tea${qs}`);
  }

  descargarAlertasTeaPdf(schoolYearId?: string, schoolId?: string, nombreArchivo = 'alertas-tea.pdf'): Observable<void> {
    const params: string[] = [];
    if (schoolYearId) params.push(`schoolYearId=${schoolYearId}`);
    if (schoolId) params.push(`schoolId=${schoolId}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.http
      .get(`api/clinical/reportes/alertas-tea/pdf${qs}`, { responseType: 'blob' })
      .pipe(map(blob => this.triggerDownload(blob, nombreArchivo)));
  }

  descargarPackMensual(
    year: number,
    month: number,
    schoolYearId?: string,
    nombreArchivo?: string
  ): Observable<void> {
    const params = [`year=${year}`, `month=${month}`];
    if (schoolYearId) params.push(`schoolYearId=${schoolYearId}`);
    const file = nombreArchivo || `pack-mensual-${year}-${String(month).padStart(2, '0')}.pdf`;
    return this.http
      .get(`api/clinical/reportes/pack-mensual?${params.join('&')}`, { responseType: 'blob' })
      .pipe(map(blob => this.triggerDownload(blob, file)));
  }

  private triggerDownload(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}
