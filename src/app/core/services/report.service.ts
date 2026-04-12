import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  StudentDataSheetItem,
  CIESummaryItem,
  TEAAlertItem,
  AlertLevel
} from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private api: ApiService) {}

  /** GET /api/reportes/sabana-datos?schoolId=&schoolYearId= */
  getStudentDataSheet(schoolId?: string, schoolYearId?: string): Observable<StudentDataSheetItem[]> {
    const params: string[] = [];
    if (schoolId) params.push(`schoolId=${schoolId}`);
    if (schoolYearId) params.push(`schoolYearId=${schoolYearId}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<StudentDataSheetItem>(`api/reportes/sabana-datos${qs}`);
  }

  /** GET /api/reportes/resumen-cie?studentId=&schoolYearId= */
  getCIESummary(studentId?: string, schoolYearId?: string): Observable<CIESummaryItem[]> {
    const params: string[] = [];
    if (studentId) params.push(`studentId=${studentId}`);
    if (schoolYearId) params.push(`schoolYearId=${schoolYearId}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<CIESummaryItem>(`api/reportes/resumen-cie${qs}`);
  }

  /** GET /api/reportes/alertas-tea?schoolYearId=&alertLevel= */
  getTEAAlerts(schoolYearId?: string, alertLevel?: AlertLevel): Observable<TEAAlertItem[]> {
    const params: string[] = [];
    if (schoolYearId) params.push(`schoolYearId=${schoolYearId}`);
    if (alertLevel !== undefined) params.push(`alertLevel=${alertLevel}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.api.get<TEAAlertItem>(`api/reportes/alertas-tea${qs}`);
  }
}
