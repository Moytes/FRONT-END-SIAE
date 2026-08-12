import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ReportService } from '../../core/services/report.service';
import { CatalogService } from '../../core/services/catalog.service';
import { ExpedienteService } from '../../core/services/expediente.service';
import {
  StudentDataSheetItem,
  CIESummaryItem,
  TEAAlertItem,
  SchoolYear,
  School,
  AlertLevel
} from '../../core/models/api-models';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes implements OnInit {
  authService = inject(AuthService);
  private reportService = inject(ReportService);
  private catalogService = inject(CatalogService);
  private expedienteService = inject(ExpedienteService);

  // Data
  dataSheet = signal<StudentDataSheetItem[]>([]);
  cieSummary = signal<CIESummaryItem[]>([]);
  teaAlerts = signal<TEAAlertItem[]>([]);
  schoolYears = signal<SchoolYear[]>([]);
  schools = signal<School[]>([]);

  // Filters
  selectedSchoolYearId = '';
  selectedSchoolId = '';

  loading = signal(false);
  activeTab = signal<'sabana' | 'cie' | 'tea'>('sabana');
  exportando = signal(false);
  /** studentId del renglón cuyo PDF se está generando (para deshabilitar solo ese botón). */
  descargandoAlumnoId = signal<string | null>(null);

  readonly AlertLevel = AlertLevel;

  ngOnInit(): void {
    this.catalogService.getSchoolYears(true).subscribe(d => this.schoolYears.set(d));
    this.catalogService.getSchools().subscribe(d => this.schools.set(d));
    this.loadReports();
  }

  loadReports(): void {
    this.loading.set(true);
    const sy = this.selectedSchoolYearId || undefined;
    const sc = this.selectedSchoolId || undefined;

    this.reportService.getStudentDataSheet(sc, sy).subscribe({
      next: d => { this.dataSheet.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });

    this.reportService.getCIESummary(undefined, sy, sc).subscribe({
      next: d => this.cieSummary.set(d)
    });

    this.reportService.getTEAAlerts(sy, undefined, sc).subscribe({
      next: d => this.teaAlerts.set(d)
    });
  }

  onFilterChange(): void {
    this.loadReports();
  }

  setTab(tab: 'sabana' | 'cie' | 'tea'): void {
    this.activeTab.set(tab);
  }

  getAlertLevelLabel(level: AlertLevel): string {
    const map: Record<AlertLevel, string> = {
      [AlertLevel.LOW]: 'Bajo',
      [AlertLevel.MEDIUM]: 'Medio',
      [AlertLevel.HIGH]: 'Alto'
    };
    return map[level] ?? '—';
  }

  getAlertLevelClass(level: AlertLevel): string {
    const map: Record<AlertLevel, string> = {
      [AlertLevel.LOW]: 'badge-success',
      [AlertLevel.MEDIUM]: 'badge-warning',
      [AlertLevel.HIGH]: 'badge-danger'
    };
    return map[level] ?? '';
  }

  /** Exporta el PDF de alertas TEA con los mismos filtros activos (solo aplica a esa pestaña —
   *  el backend no ofrece un PDF de "sábana de datos" ni de "resumen CIE" por separado). */
  exportarAlertasTeaPdf(): void {
    this.exportando.set(true);
    const sy = this.selectedSchoolYearId || undefined;
    const sc = this.selectedSchoolId || undefined;
    this.reportService.descargarAlertasTeaPdf(sy, sc).subscribe({
      next: () => this.exportando.set(false),
      error: () => {
        this.exportando.set(false);
        alert('No se pudo generar el PDF de alertas TEA.');
      }
    });
  }

  /** Descarga el expediente completo de un alumno en PDF, desde la fila de la Sábana de Datos. */
  descargarExpedienteAlumno(row: StudentDataSheetItem): void {
    this.descargandoAlumnoId.set(row.studentId);
    const nombreArchivo = `expediente-${row.studentName}.pdf`.replace(/\s+/g, '-');
    this.expedienteService.descargarExpedientePdf(row.studentId, nombreArchivo).subscribe({
      next: () => this.descargandoAlumnoId.set(null),
      error: () => {
        this.descargandoAlumnoId.set(null);
        alert('No se pudo descargar el expediente en PDF.');
      }
    });
  }

  /** Pack mensual (TEA + CIE + canalizaciones) del mes en curso, filtrado por ciclo escolar. */
  descargarPackMensual(): void {
    this.exportando.set(true);
    const now = new Date();
    const sy = this.selectedSchoolYearId || undefined;
    this.reportService.descargarPackMensual(now.getFullYear(), now.getMonth() + 1, sy).subscribe({
      next: () => this.exportando.set(false),
      error: () => {
        this.exportando.set(false);
        alert('No se pudo generar el pack mensual.');
      }
    });
  }
}
