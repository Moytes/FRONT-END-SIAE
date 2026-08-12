import { Component, OnInit, OnDestroy, AfterViewInit, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { ReportService } from '../../core/services/report.service';
import { CieService } from '../../core/services/cie.service';
import { CatalogService } from '../../core/services/catalog.service';
import { MaterialService } from '../../core/services/material.service';
import { AssignmentService } from '../../core/services/assignment.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { TeaService } from '../../core/services/tea.service';
import {
  StudentDataSheetItem,
  CIESummaryItem,
  CIEEvaluationListItem,
  CIEDimensionCatalog,
  TEAAlertItem,
  SchoolYear,
  School,
  MaterialListItem,
  AlertLevel,
  ScheduleAppointmentRequest,
  AsignacionResumen
} from '../../core/models/api-models';

Chart.register(...registerables);

type TabId = 'overview' | 'students' | 'cie' | 'tea' | 'activities';

interface StudentRow extends StudentDataSheetItem {
  progreso: number;
  ultimaEvaluacion: string | null;
  estado: 'riesgo' | 'completado' | 'proceso';
}

type AppointmentForm = Omit<ScheduleAppointmentRequest, 'alumnoId' | 'teaScreeningId'>;

@Component({
  selector: 'app-specialist-reports-mockup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './specialist-reports-mockup.html',
  styleUrl: './specialist-reports-mockup.css',
})
export class SpecialistReportsMockup implements OnInit, AfterViewInit, OnDestroy {
  private reportService = inject(ReportService);
  private cieService = inject(CieService);
  private catalogService = inject(CatalogService);
  private materialService = inject(MaterialService);
  private assignmentService = inject(AssignmentService);
  private appointmentService = inject(AppointmentService);
  private teaService = inject(TeaService);
  private route = inject(ActivatedRoute);

  @ViewChild('donutCanvas') donutCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('barCanvas') barCanvasRef?: ElementRef<HTMLCanvasElement>;
  private donutChart?: Chart;
  private barChart?: Chart;

  readonly AlertLevel = AlertLevel;

  activeTab: TabId = 'overview';

  reports: { id: TabId; name: string; icon: string }[] = [
    { id: 'overview', name: 'Vista General', icon: 'activity' },
    { id: 'students', name: 'Seguimiento Alumnos', icon: 'users' },
    { id: 'cie', name: 'Evaluaciones CIE', icon: 'file-text' },
    { id: 'tea', name: 'Monitor TEA', icon: 'alert-triangle' },
    { id: 'activities', name: 'Actividades', icon: 'award' }
  ];

  schoolYears = signal<SchoolYear[]>([]);
  schools = signal<School[]>([]);
  selectedSchoolYearId = '';
  selectedSchoolId = '';

  dataSheet = signal<StudentDataSheetItem[]>([]);
  cieSummary = signal<CIESummaryItem[]>([]);
  cieEvaluations = signal<CIEEvaluationListItem[]>([]);
  /** Catálogo real de dimensiones (id -> nombre); el backend no manda el nombre junto con
   *  la evaluación, solo el id — hay que resolverlo aparte. */
  cieDimensions = signal<CIEDimensionCatalog[]>([]);
  teaAlerts = signal<TEAAlertItem[]>([]);
  materiales = signal<MaterialListItem[]>([]);
  asignacionResumen = signal<AsignacionResumen | null>(null);

  loading = signal(false);
  generandoPdf = signal(false);
  generandoPack = signal(false);
  showAppointmentModal = signal(false);
  selectedAppointmentAlert = signal<TEAAlertItem | null>(null);
  savingAppointment = signal(false);
  appointmentForm: AppointmentForm = this.emptyAppointmentForm();
  showTeaDetailModal = signal(false);
  selectedTeaDetail = signal<TEAAlertItem | null>(null);
  updatingTeaId = signal<number | null>(null);

  kpiAlumnosAtendidos = computed(() => new Set(this.dataSheet().map(s => s.studentId)).size);
  kpiEvaluacionesCie = computed(() => this.cieEvaluations().length || this.cieSummary().length);
  kpiAlertasCriticas = computed(() => this.activeTeaAlerts().filter(a => a.alertLevel === AlertLevel.HIGH).length);

  activeTeaAlerts = computed(() =>
    this.teaAlerts().filter(a => (a.seguimientoEstado || 'ACTIVA') !== 'RESUELTA')
  );

  /** Alertas activas ordenadas: críticas primero, luego por fecha más reciente. */
  sortedTeaAlerts = computed(() =>
    [...this.activeTeaAlerts()].sort((a, b) => {
      const levelDiff = Number(b.alertLevel) - Number(a.alertLevel);
      if (levelDiff !== 0) return levelDiff;
      const dateA = new Date(a.createdAt || a.screeningDate).getTime();
      const dateB = new Date(b.createdAt || b.screeningDate).getTime();
      return dateB - dateA;
    })
  );

  teaMetricActivas = computed(() => this.activeTeaAlerts().length);
  teaMetricCriticas = computed(() => this.activeTeaAlerts().filter(a => a.alertLevel === AlertLevel.HIGH).length);
  teaMetricMedias = computed(() => this.activeTeaAlerts().filter(a => a.alertLevel === AlertLevel.MEDIUM).length);
  teaMetricBajas = computed(() => this.activeTeaAlerts().filter(a => a.alertLevel === AlertLevel.LOW).length);
  teaMetricResueltasHoy = computed(() => {
    const today = new Date();
    return this.teaAlerts().filter(a => {
      if (a.seguimientoEstado !== 'RESUELTA' || !a.seguimientoAt) return false;
      const resolved = new Date(a.seguimientoAt);
      return resolved.getFullYear() === today.getFullYear()
        && resolved.getMonth() === today.getMonth()
        && resolved.getDate() === today.getDate();
    }).length;
  });

  materialesPublicados = computed(() => this.materiales().filter(m => m.publicado).length);
  materialesBorrador = computed(() => this.materiales().filter(m => !m.publicado).length);

  areaDistribution = computed(() => {
    const counts = new Map<string, number>();
    for (const s of this.dataSheet()) {
      for (const area of s.attentionAreas) {
        counts.set(area, (counts.get(area) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
  });

  dimensionDistribution = computed(() => {
    const dims = this.cieDimensions();
    const counts = new Map<string, number>();
    for (const e of this.cieEvaluations()) {
      const label = dims.find(d => d.id === e.dimensionId)?.nombre ?? `Dimensión ${e.dimensionId}`;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
  });

  studentRows = computed<StudentRow[]>(() => {
    const cie = this.cieSummary();
    const evals = this.cieEvaluations();
    return this.dataSheet().map(s => {
      const cieRows = cie.filter(c => c.studentId === s.studentId);
      const progreso = cieRows.length
        ? Math.round(cieRows.reduce((sum, c) => sum + c.percentage, 0) / cieRows.length)
        : 0;
      const evalRows = evals.filter(e => e.alumnoId === s.studentId);
      const ultimaEvaluacion = evalRows.length
        ? evalRows.reduce((latest, e) => (e.createdAt > latest ? e.createdAt : latest), evalRows[0].createdAt)
        : null;
      let estado: StudentRow['estado'];
      if (s.teaAlertLevel === AlertLevel.HIGH) estado = 'riesgo';
      else if (progreso >= 100) estado = 'completado';
      else estado = 'proceso';
      return { ...s, progreso, ultimaEvaluacion, estado };
    });
  });

  ngOnInit(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab') as TabId | null;
    if (tab && this.reports.some(r => r.id === tab)) {
      this.activeTab = tab;
    }

    this.catalogService.getSchoolYears(true).subscribe(d => this.schoolYears.set(d));
    this.catalogService.getSchools().subscribe(d => this.schools.set(d));
    this.materialService.getMisMateriales().subscribe(d => this.materiales.set(d));
    this.cieService.getDimensions().subscribe(d => { this.cieDimensions.set(d); this.renderCharts(); });
    this.loadAsignacionResumen();
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.renderCharts();
  }

  ngOnDestroy(): void {
    this.donutChart?.destroy();
    this.barChart?.destroy();
  }

  loadData(): void {
    this.loading.set(true);
    const sy = this.selectedSchoolYearId || undefined;
    const sc = this.selectedSchoolId || undefined;

    this.reportService.getStudentDataSheet(sc, sy).subscribe({
      next: d => { this.dataSheet.set(d); this.loading.set(false); this.renderCharts(); },
      error: () => this.loading.set(false)
    });

    this.cieService.getEvaluations(undefined, sy).subscribe({
      next: d => { this.cieEvaluations.set(d); this.renderCharts(); }
    });

    this.reportService.getCIESummary(undefined, sy).subscribe({
      next: d => this.cieSummary.set(d)
    });

    this.reportService.getTEAAlerts(sy, undefined, sc).subscribe({
      next: d => this.teaAlerts.set(d)
    });
  }

  onFilterChange(): void {
    this.loadData();
    this.loadAsignacionResumen();
  }

  private loadAsignacionResumen(): void {
    const sy = this.selectedSchoolYearId ? Number(this.selectedSchoolYearId) : undefined;
    this.assignmentService.getResumen(sy).subscribe({
      next: d => this.asignacionResumen.set(d),
      error: () => this.asignacionResumen.set(null)
    });
  }

  setTab(tab: TabId): void {
    this.activeTab = tab;
    if (tab === 'overview') {
      this.renderCharts();
    }
  }

  private renderCharts(): void {
    setTimeout(() => {
      this.renderDonutChart();
      this.renderBarChart();
    });
  }

  readonly areaPalette = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#0ea5e9', '#a855f7'];

  getAreaColor(index: number): string {
    return this.areaPalette[index % this.areaPalette.length];
  }

  private renderDonutChart(): void {
    if (!this.donutCanvasRef) return;
    this.donutChart?.destroy();
    const data = this.areaDistribution();
    this.donutChart = new Chart(this.donutCanvasRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: data.map((_, i) => this.getAreaColor(i)),
          borderWidth: 0
        }]
      },
      options: {
        cutout: '70%',
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  private renderBarChart(): void {
    if (!this.barCanvasRef) return;
    this.barChart?.destroy();
    const data = this.dimensionDistribution();
    this.barChart = new Chart(this.barCanvasRef.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          label: 'Evaluaciones',
          data: data.map(d => d.count),
          backgroundColor: '#6366f1',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase())
      .join('');
  }

  getAlertLevelLabel(level: AlertLevel): string {
    const map: Record<AlertLevel, string> = {
      [AlertLevel.LOW]: 'ALERTA BAJA',
      [AlertLevel.MEDIUM]: 'ALERTA MEDIA',
      [AlertLevel.HIGH]: 'ALERTA ALTA'
    };
    return map[level] ?? '—';
  }

  getAlertLevelDescription(alert: TEAAlertItem): string {
    const fromDb = (alert.contextoObs || alert.observaciones || '').trim();
    if (fromDb) return fromDb;
    const map: Record<AlertLevel, string> = {
      [AlertLevel.LOW]: 'Screening con indicadores leves; se recomienda seguimiento de rutina.',
      [AlertLevel.MEDIUM]: 'Se detectaron indicadores que ameritan seguimiento cercano y notificación al equipo.',
      [AlertLevel.HIGH]: 'Se detectaron indicadores críticos que requieren atención inmediata y agendar cita.'
    };
    return map[alert.alertLevel] ?? '';
  }

  getAlertMeta(alert: TEAAlertItem): string {
    const gradePart = alert.groupName?.trim()
      || (alert.grade != null ? `${alert.grade}°` : '');
    const school = alert.schoolName?.trim() || '';
    if (gradePart && school) return `${gradePart} · ${school}`;
    return gradePart || school || '—';
  }

  getRelativeTime(alert: TEAAlertItem): string {
    const raw = alert.createdAt || alert.screeningDate;
    if (!raw) return '';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return '';

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayDiff = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000);

    if (dayDiff <= 0) {
      const hours = Math.max(1, Math.floor((now.getTime() - date.getTime()) / 3_600_000));
      if (hours < 24) return hours === 1 ? 'Hace 1 hora' : `Hace ${hours} horas`;
      return 'Hoy';
    }
    if (dayDiff === 1) return 'Ayer';
    if (dayDiff < 7) return `Hace ${dayDiff} días`;
    if (dayDiff < 30) {
      const weeks = Math.floor(dayDiff / 7);
      return weeks === 1 ? 'Hace 1 semana' : `Hace ${weeks} semanas`;
    }
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getAlertActionLabel(level: AlertLevel): string {
    const map: Record<AlertLevel, string> = {
      [AlertLevel.HIGH]: 'Agendar Cita',
      [AlertLevel.MEDIUM]: 'Notificar',
      [AlertLevel.LOW]: 'Monitorear'
    };
    return map[level] ?? 'Ver';
  }

  onVerDetalle(alert: TEAAlertItem): void {
    this.selectedTeaDetail.set(alert);
    this.showTeaDetailModal.set(true);
  }

  closeTeaDetailModal(): void {
    this.showTeaDetailModal.set(false);
    this.selectedTeaDetail.set(null);
  }

  onAlertAction(alert: TEAAlertItem): void {
    if (alert.alertLevel === AlertLevel.HIGH) {
      this.openAppointmentModal(alert);
      return;
    }

    if (!alert.id) {
      window.alert('No se pudo identificar la alerta TEA.');
      return;
    }

    if (alert.alertLevel === AlertLevel.MEDIUM) {
      this.updateTeaSeguimiento(alert.id, 'NOTIFICADA', 'Notificación registrada para seguimiento con docente/familia.');
      return;
    }

    this.updateTeaSeguimiento(alert.id, 'EN_MONITOREO', 'Alerta dejada en monitoreo preventivo.');
  }

  resolveTeaAlert(alert: TEAAlertItem): void {
    if (!alert.id) return;
    this.updateTeaSeguimiento(alert.id, 'RESUELTA', 'Alerta marcada como resuelta por el especialista.');
  }

  private updateTeaSeguimiento(
    id: number,
    estado: 'ACTIVA' | 'EN_MONITOREO' | 'NOTIFICADA' | 'RESUELTA',
    nota: string
  ): void {
    this.updatingTeaId.set(id);
    this.teaService.updateSeguimiento(id, estado, nota).subscribe({
      next: () => {
        this.updatingTeaId.set(null);
        this.closeTeaDetailModal();
        this.loadData();
        const labels: Record<string, string> = {
          NOTIFICADA: 'Alerta marcada como notificada.',
          EN_MONITOREO: 'Alerta en monitoreo.',
          RESUELTA: 'Alerta resuelta.'
        };
        window.alert(labels[estado] || 'Seguimiento actualizado.');
      },
      error: err => {
        this.updatingTeaId.set(null);
        window.alert(err.error?.message || 'No se pudo actualizar el seguimiento de la alerta.');
      }
    });
  }

  openAppointmentModal(alert: TEAAlertItem): void {
    this.selectedAppointmentAlert.set(alert);
    this.appointmentForm = this.emptyAppointmentForm();
    this.showAppointmentModal.set(true);
  }

  closeAppointmentModal(): void {
    if (this.savingAppointment()) return;
    this.showAppointmentModal.set(false);
    this.selectedAppointmentAlert.set(null);
    this.appointmentForm = this.emptyAppointmentForm();
  }

  scheduleAppointment(): void {
    const alert = this.selectedAppointmentAlert();
    if (!alert || !this.appointmentForm.tipoCita || !this.appointmentForm.fecha || !this.appointmentForm.hora) {
      return;
    }

    this.savingAppointment.set(true);
    this.appointmentService.schedule({
      ...this.appointmentForm,
      alumnoId: alert.studentId,
      teaScreeningId: alert.id
    }).subscribe({
      next: () => {
        this.savingAppointment.set(false);
        const screeningId = alert.id;
        this.closeAppointmentModal();
        if (screeningId) {
          this.teaService.updateSeguimiento(screeningId, 'RESUELTA', 'Cita agendada desde alerta crítica.').subscribe({
            next: () => this.loadData(),
            error: () => this.loadData()
          });
        } else {
          this.loadData();
        }
        window.alert('Cita agendada correctamente.');
      },
      error: error => {
        this.savingAppointment.set(false);
        window.alert(error.error?.message || 'No se pudo agendar la cita.');
      }
    });
  }

  getAppointmentAlertLevel(alert: TEAAlertItem): string {
    const map: Record<AlertLevel, string> = {
      [AlertLevel.HIGH]: 'Alta',
      [AlertLevel.MEDIUM]: 'Media',
      [AlertLevel.LOW]: 'Baja'
    };
    return map[alert.alertLevel] ?? '';
  }

  getSeguimientoLabel(estado?: string): string {
    switch (estado) {
      case 'EN_MONITOREO': return 'En monitoreo';
      case 'NOTIFICADA': return 'Notificada';
      case 'RESUELTA': return 'Resuelta';
      default: return 'Activa';
    }
  }

  private emptyAppointmentForm(): AppointmentForm {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
    return {
      tipoCita: 'EVALUACION_INICIAL',
      fecha: local.toISOString().slice(0, 10),
      hora: '',
      modalidad: 'PRESENCIAL',
      notasTutor: ''
    };
  }

  generarPdf(): void {
    this.generandoPdf.set(true);
    this.reportService.descargarAlertasTeaPdf(
      this.selectedSchoolYearId || undefined,
      this.selectedSchoolId || undefined
    ).subscribe({
      next: () => this.generandoPdf.set(false),
      error: () => {
        this.generandoPdf.set(false);
        window.alert('No se pudo descargar el PDF de alertas TEA.');
      }
    });
  }

  descargarPack(): void {
    const now = new Date();
    this.generandoPack.set(true);
    this.reportService.descargarPackMensual(
      now.getFullYear(),
      now.getMonth() + 1,
      this.selectedSchoolYearId || undefined
    ).subscribe({
      next: () => this.generandoPack.set(false),
      error: () => {
        this.generandoPack.set(false);
        window.alert('No se pudo descargar el pack mensual.');
      }
    });
  }
}
