import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PsicologiaService } from '../../core/services/psicologia.service';
import { PsychoService } from '../../core/services/psycho.service';
import { ReportService } from '../../core/services/report.service';
import {
  CIESummaryItem,
  Group,
  PsychoeducationalAssessmentListItem,
  School,
  SchoolYear,
  StudentDataSheetItem,
  StudentListItem,
  TEAAlertItem
} from '../../core/models/api-models';

type AlertType = 'success' | 'error' | 'info';

interface AlertState {
  type: AlertType;
  title: string;
  message: string;
}

@Component({
  selector: 'app-psicologia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './psicologia.html',
  styleUrl: './psicologia.css'
})
export class Psicologia implements OnInit {
  private psicologiaService = inject(PsicologiaService);
  private psychoService = inject(PsychoService);
  private reportService = inject(ReportService);

  loading = signal(false);
  reportLoading = signal(false);
  alert = signal<AlertState | null>(null);

  schools = signal<School[]>([]);
  years = signal<SchoolYear[]>([]);
  groups = signal<Group[]>([]);
  students = signal<StudentListItem[]>([]);
  assessments = signal<PsychoeducationalAssessmentListItem[]>([]);
  dataSheet = signal<StudentDataSheetItem[]>([]);
  cieSummary = signal<CIESummaryItem[]>([]);
  teaAlerts = signal<TEAAlertItem[]>([]);

  selectedSchoolId = signal('');
  selectedYearId = signal('');
  selectedGroupId = signal('');
  searchTerm = signal('');

  filteredStudents = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.students();

    return this.students().filter(student => {
      const name = this.getStudentName(student).toLowerCase();
      return name.includes(term) || (student.curp || '').toLowerCase().includes(term);
    });
  });

  schoolsCount = computed(() => this.schools().length);
  studentsCount = computed(() => this.students().length);
  assessmentsCount = computed(() => this.assessments().length);
  highTeaAlertsCount = computed(() => this.teaAlerts().filter(alert => Number(alert.alertLevel) >= 2).length);
  activeSchool = computed(() => this.schools().find(school => school.id === this.selectedSchoolId()));
  recentAssessments = computed(() => this.assessments().slice(0, 5));

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading.set(true);

    this.psicologiaService.getSchools().subscribe({
      next: schools => {
        this.schools.set(schools);
        const firstSchool = schools[0]?.id || '';
        this.selectedSchoolId.set(firstSchool);
        this.loadYears();
        this.loadGroups();
        this.loadStudents();
      },
      error: err => {
        this.loading.set(false);
        this.handleError(err, 'No se cargaron tus escuelas');
      }
    });
  }

  loadYears(): void {
    this.psicologiaService.getSchoolYears().subscribe({
      next: years => {
        this.years.set(years);
        const active = years.find(year => year.isActive || year.activo) || years[0];
        if (active) {
          this.selectedYearId.set(active.id);
          this.loadClinicalReports();
        }
      },
      error: err => this.handleError(err, 'No se cargaron los ciclos escolares')
    });
  }

  loadGroups(): void {
    this.psicologiaService.getGroups(this.selectedSchoolId(), this.selectedYearId()).subscribe({
      next: groups => this.groups.set(groups),
      error: err => this.handleError(err, 'No se cargaron los grupos')
    });
  }

  loadStudents(): void {
    this.loading.set(true);
    this.psicologiaService.getStudents(undefined, this.selectedSchoolId(), this.selectedGroupId()).subscribe({
      next: students => {
        this.students.set(students);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.handleError(err, 'No se cargaron los alumnos')
      }
    });
  }

  refreshScope(): void {
    this.selectedGroupId.set('');
    this.loadGroups();
    this.loadStudents();
    this.loadClinicalReports();
  }

  loadClinicalReports(): void {
    this.reportLoading.set(true);
    const yearId = this.selectedYearId();
    const schoolId = this.selectedSchoolId();

    this.psychoService.getAssessments(undefined, yearId).subscribe({
      next: assessments => this.assessments.set(assessments || []),
      error: () => this.assessments.set([])
    });

    this.reportService.getStudentDataSheet(schoolId, yearId).subscribe({
      next: sheet => this.dataSheet.set(sheet || []),
      error: () => this.dataSheet.set([])
    });

    this.reportService.getCIESummary(undefined, yearId).subscribe({
      next: summary => this.cieSummary.set(summary || []),
      error: () => this.cieSummary.set([])
    });

    this.reportService.getTEAAlerts(yearId).subscribe({
      next: alerts => {
        this.teaAlerts.set(alerts || []);
        this.reportLoading.set(false);
      },
      error: () => {
        this.teaAlerts.set([]);
        this.reportLoading.set(false);
      }
    });
  }

  getStudentName(student: StudentListItem): string {
    return [student.name, student.fatherLastName, student.motherLastName].filter(Boolean).join(' ');
  }

  getAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  private handleError(error: any, title: string): void {
    const message = error?.message || error?.error?.data || error?.error || 'Revisa tu conexión e intenta de nuevo.';
    this.showAlert('error', title, message);
  }

  private showAlert(type: AlertType, title: string, message: string): void {
    this.alert.set({ type, title, message });
    window.setTimeout(() => {
      const current = this.alert();
      if (current?.title === title) this.alert.set(null);
    }, 5000);
  }
}
