import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComunicacionService } from '../../core/services/comunicacion.service';
import { Group, School, SchoolYear, StudentListItem } from '../../core/models/api-models';

type AlertType = 'success' | 'error' | 'info';

interface AlertState {
  type: AlertType;
  title: string;
  message: string;
}

@Component({
  selector: 'app-comunicacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comunicacion.html',
  styleUrl: './comunicacion.css'
})
export class Comunicacion implements OnInit {
  private comunicacionService = inject(ComunicacionService);

  loading = signal(false);
  alert = signal<AlertState | null>(null);
  schools = signal<School[]>([]);
  years = signal<SchoolYear[]>([]);
  groups = signal<Group[]>([]);
  students = signal<StudentListItem[]>([]);

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

  activeSchool = computed(() => this.schools().find(school => school.id === this.selectedSchoolId()));
  groupsCount = computed(() => this.groups().length);
  studentsCount = computed(() => this.students().length);

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading.set(true);
    this.comunicacionService.getSchools().subscribe({
      next: schools => {
        this.schools.set(schools);
        this.selectedSchoolId.set(schools[0]?.id || '');
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
    this.comunicacionService.getSchoolYears().subscribe({
      next: years => {
        this.years.set(years);
        const active = years.find(year => year.isActive || year.activo) || years[0];
        if (active) this.selectedYearId.set(active.id);
      },
      error: err => this.handleError(err, 'No se cargaron los ciclos escolares')
    });
  }

  loadGroups(): void {
    this.comunicacionService.getGroups(this.selectedSchoolId(), this.selectedYearId()).subscribe({
      next: groups => this.groups.set(groups),
      error: err => this.handleError(err, 'No se cargaron los grupos')
    });
  }

  loadStudents(): void {
    this.loading.set(true);
    this.comunicacionService.getStudents(undefined, this.selectedSchoolId(), this.selectedGroupId()).subscribe({
      next: students => {
        this.students.set(students);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.handleError(err, 'No se cargaron los alumnos de comunicación');
      }
    });
  }

  refreshScope(): void {
    this.selectedGroupId.set('');
    this.loadGroups();
    this.loadStudents();
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
    this.alert.set({ type: 'error', title, message });
  }
}
