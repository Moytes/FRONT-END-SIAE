import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ReportService } from '../../core/services/report.service';
import { CatalogService } from '../../core/services/catalog.service';
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

    this.reportService.getCIESummary(undefined, sy).subscribe({
      next: d => this.cieSummary.set(d)
    });

    this.reportService.getTEAAlerts(sy).subscribe({
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

  exportarPDF(): void {
    this.exportando.set(true);
    setTimeout(() => {
      this.exportando.set(false);
      alert('📄 Función de exportación PDF en desarrollo.');
    }, 1500);
  }
}
