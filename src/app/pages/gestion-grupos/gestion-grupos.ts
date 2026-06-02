import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/services/catalog.service';
import { StudentService } from '../../core/services/student.service';
import { AuthService } from '../../services/auth.service';
import {
  Group,
  StudentListItem,
  SchoolYear,
  BulkAddRegistrationRequest,
  UserRole,
  School
} from '../../core/models/api-models';

@Component({
  selector: 'app-gestion-grupos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-grupos.html',
  styleUrl: './gestion-grupos.css'
})
export class GestionGrupos implements OnInit {
  private catalogService = inject(CatalogService);
  private studentService = inject(StudentService);
  private authService = inject(AuthService);

  // State
  groups = signal<Group[]>([]);
  schoolYears = signal<SchoolYear[]>([]);
  selectedGroup = signal<Group | null>(null);
  groupStudents = signal<StudentListItem[]>([]);
  unassignedStudents = signal<StudentListItem[]>([]);
  
  loading = signal(false);
  loadingStudents = signal(false);
  showAddModal = signal(false);
  showGroupModal = signal(false);
  
  // Selection for adding
  selectedForAdd = signal<Set<string>>(new Set());
  
  // Data for creation
  schools = signal<School[]>([]);

  // Registration Form
  registrationForm: BulkAddRegistrationRequest = {
    studentIds: [],
    groupId: '',
    schoolYearId: ''
  };

  // Group Form
  groupForm = { section: '', grade: 1, schoolId: '', schoolYearId: '' };

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.loading.set(true);
    this.catalogService.getSchoolYears().subscribe(years => {
      this.schoolYears.set(years);
      const active = years.find(y => y.isActive) || years[0];
      if (active) {
        this.registrationForm.schoolYearId = active.id;
        this.groupForm.schoolYearId = active.id;
      }
    });

    this.catalogService.getSchools().subscribe(res => {
      const user = this.authService.currentUser();
      if (user && user.role === UserRole.TRABAJO_SOCIAL && user.schoolIds) {
        const mySchoolIds = new Set(user.schoolIds);
        this.schools.set(res.filter(s => mySchoolIds.has(s.id)));
      } else {
        this.schools.set(res);
      }
    });

    this.catalogService.getGroups().subscribe(allGroups => {
      const user = this.authService.currentUser();
      
      if (user && user.role === UserRole.TRABAJO_SOCIAL && user.schoolIds && user.schoolIds.length > 0) {
        const mySchoolIds = new Set(user.schoolIds);
        const filtered = allGroups.filter(g => mySchoolIds.has(g.schoolId));
        this.groups.set(filtered);
      } else if (user && user.role === UserRole.TRABAJO_SOCIAL) {
        // Trabajo social sin escuelas asignadas
        this.groups.set([]);
      } else {
        this.groups.set(allGroups);
      }
      this.loading.set(false);
    });
  }

  selectGroup(group: Group) {
    this.selectedGroup.set(group);
    this.loadGroupStudents(group.id);
  }

  loadGroupStudents(groupId: string) {
    this.loadingStudents.set(true);
    this.studentService.getStudents(undefined, undefined, groupId).subscribe(students => {
      this.groupStudents.set(students);
      this.loadingStudents.set(false);
    });
  }

  openAddStudents() {
    if (!this.selectedGroup()) return;
    this.loadingStudents.set(true);
    // Load all students to filter those not in this group (simplified: load all and let user choose)
    this.studentService.getStudents().subscribe(all => {
      // Filter out students already in THIS group
      const currentIds = new Set(this.groupStudents().map(s => s.id));
      this.unassignedStudents.set(all.filter(s => !currentIds.has(s.id)));
      this.selectedForAdd.set(new Set());
      this.showAddModal.set(true);
      this.loadingStudents.set(false);
    });
  }

  toggleStudentSelection(id: string) {
    const set = new Set(this.selectedForAdd());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.selectedForAdd.set(set);
  }

  confirmAdd() {
    const group = this.selectedGroup();
    if (!group || this.selectedForAdd().size === 0) return;

    this.registrationForm.studentIds = Array.from(this.selectedForAdd());
    this.registrationForm.groupId = group.id;

    this.studentService.bulkAddRegistration(this.registrationForm).subscribe({
      next: () => {
        alert('Alumnos agregados correctamente.');
        this.showAddModal.set(false);
        this.loadGroupStudents(group.id);
      },
      error: (err) => alert(err.error?.message || 'Error al agregar alumnos')
    });
  }

  openNewGroup() {
    this.showGroupModal.set(true);
  }

  createGroup() {
    if (!this.groupForm.section || !this.groupForm.schoolId || !this.groupForm.schoolYearId) return;

    const payload = {
      ...this.groupForm,
      grade: Number(this.groupForm.grade)
    };

    this.catalogService.createGroup(payload).subscribe({
      next: () => {
        this.loadInitialData();
        this.showGroupModal.set(false);
      },
      error: (err) => alert(err.error?.message || 'Error al crear grupo')
    });
  }

  closeModal() {
    this.showAddModal.set(false);
    this.showGroupModal.set(false);
  }
}
