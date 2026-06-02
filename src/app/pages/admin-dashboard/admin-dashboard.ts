import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { CatalogService } from '../../core/services/catalog.service';
import { StudentService } from '../../core/services/student.service';
import {
  UserListItem,
  School,
  SchoolZone,
  Group,
  SchoolYear,
  UserRole,
  StudentListItem,
  AddSchoolRequest,
  AddGroupRequest,
  AddUserRequest,
  AddSchoolZoneRequest,
  AddSchoolYearRequest,
  BulkAddRegistrationRequest,
  EnumOption
} from '../../core/models/api-models';

type AdminTab = 'overview' | 'years' | 'zones' | 'schools' | 'groups' | 'users' | 'students';
type ModalType = 'none' | 'year' | 'zone' | 'view-zone' | 'school' | 'group' | 'user' | 'bulk-registration';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  private userService = inject(UserService);
  private catalogService = inject(CatalogService);
  private studentService = inject(StudentService);

  // State
  activeTab = signal<AdminTab>('overview');
  showModal = signal<ModalType>('none');
  loading = signal(false);
  selectedZone = signal<SchoolZone | null>(null);

  // Selection for bulk actions
  selectedStudentIds = signal<Set<string>>(new Set());

  // Data
  users = signal<UserListItem[]>([]);
  schools = signal<School[]>([]);
  zones = signal<SchoolZone[]>([]);
  groups = signal<Group[]>([]);
  students = signal<StudentListItem[]>([]);
  schoolYears = signal<SchoolYear[]>([]);
  roles = signal<EnumOption[]>([]);

  // Form Models
  yearForm: AddSchoolYearRequest = { name: '', startDate: '', endDate: '', isActive: true };
  zoneForm: AddSchoolZoneRequest = { number: '', cct: '', name: '', description: '' };
  schoolForm: AddSchoolRequest = { name: '', cct: '', schoolZoneId: '' };
  groupForm: AddGroupRequest = { section: '', grade: 1, schoolId: '', schoolYearId: '' };
  userForm: AddUserRequest = {
    email: '',
    password: '',
    name: '',
    fatherLastName: '',
    role: UserRole.ESPECIALISTA_APR,
    schoolZoneId: ''
  };
  registrationForm: BulkAddRegistrationRequest = {
    studentIds: [],
    groupId: '',
    schoolYearId: ''
  };

  ngOnInit() {
    this.loadData();
    this.loadCatalogs();
  }

  async loadData() {
    this.loading.set(true);
    this.userService.getUsers().subscribe(res => this.users.set(res));
    this.catalogService.getSchoolZones().subscribe(res => this.zones.set(res));
    this.catalogService.getSchools().subscribe(res => this.schools.set(res));
    this.catalogService.getGroups().subscribe(res => this.groups.set(res));
    this.studentService.getStudents().subscribe(res => this.students.set(res));
    this.loading.set(false);
  }

  loadCatalogs() {
    this.catalogService.getSchoolYears().subscribe(res => {
      this.schoolYears.set(res);
      const active = res.find(y => y.isActive) || res[0];
      if (active) {
        if (!this.groupForm.schoolYearId) this.groupForm.schoolYearId = active.id;
        if (!this.registrationForm.schoolYearId) this.registrationForm.schoolYearId = active.id;
      }
    });
    this.userService.getRoles().subscribe(res => this.roles.set(res));
  }

  setTab(tab: AdminTab) {
    this.activeTab.set(tab);
  }

  openModal(type: ModalType) {
    if (type === 'bulk-registration') {
      this.registrationForm.studentIds = Array.from(this.selectedStudentIds());
    }
    this.showModal.set(type);
  }

  closeModal() {
    this.showModal.set('none');
    this.selectedZone.set(null);
    this.resetForms();
  }

  viewZone(zone: SchoolZone) {
    this.selectedZone.set(zone);
    this.showModal.set('view-zone');
  }

  toggleStudentSelection(id: string) {
    const set = new Set(this.selectedStudentIds());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.selectedStudentIds.set(set);
  }

  resetForms() {
    this.yearForm = { name: '', startDate: '', endDate: '', isActive: true };
    this.zoneForm = { number: '', cct: '', name: '', description: '' };
    this.schoolForm = { name: '', cct: '', schoolZoneId: '' };
    const activeYearId = this.schoolYears().find(y => y.isActive)?.id || this.schoolYears()[0]?.id || '';
    this.groupForm = { 
      section: '', 
      grade: 1, 
      schoolId: '', 
      schoolYearId: activeYearId
    };
    this.userForm = {
      email: '',
      password: '',
      name: '',
      fatherLastName: '',
      role: UserRole.ESPECIALISTA_APR,
      schoolZoneId: ''
    };
    this.registrationForm = {
      studentIds: [],
      groupId: '',
      schoolYearId: activeYearId
    };
  }

  // Actions
  createYear() {
    if (!this.yearForm.name || !this.yearForm.startDate || !this.yearForm.endDate) return;
    this.catalogService.createSchoolYear(this.yearForm).subscribe({
      next: () => {
        this.loadCatalogs();
        this.closeModal();
      },
      error: (err) => alert(err.error?.message || 'Error al crear ciclo escolar')
    });
  }

  createZone() {
    if (!this.zoneForm.number || !this.zoneForm.cct) return;
    this.catalogService.createSchoolZone(this.zoneForm).subscribe({
      next: () => {
        this.loadData();
        this.closeModal();
      },
      error: (err) => alert(err.error?.message || 'Error al crear zona')
    });
  }

  createSchool() {
    if (!this.schoolForm.name || !this.schoolForm.cct || !this.schoolForm.schoolZoneId) return;
    this.catalogService.createSchool(this.schoolForm).subscribe({
      next: () => {
        this.loadData();
        this.closeModal();
      },
      error: (err) => alert(err.error?.message || 'Error al crear escuela')
    });
  }

  createGroup() {
    if (!this.groupForm.section || !this.groupForm.schoolId || !this.groupForm.schoolYearId) {
      alert('Error: Todos los campos son obligatorios (Sección, Grado, Escuela y Ciclo).');
      return;
    }

    const payload = {
      ...this.groupForm,
      grade: Number(this.groupForm.grade)
    };

    this.catalogService.createGroup(payload).subscribe({
      next: () => {
        this.loadData();
        this.closeModal();
      },
      error: (err) => {
        const detail = err.error?.message || 'Error desconocido';
        alert(`🔴 Servidor: ${detail}`);
      }
    });
  }

  createUser() {
    if (!this.userForm.email || !this.userForm.password || !this.userForm.name) return;
    this.userService.createUser(this.userForm).subscribe({
      next: () => {
        this.loadData();
        this.closeModal();
      },
      error: (err) => alert(err.error?.message || 'Error al crear usuario')
    });
  }

  bulkRegister() {
    if (!this.registrationForm.groupId || this.registrationForm.studentIds.length === 0) {
      alert('Seleccione un grupo y al menos un alumno.');
      return;
    }
    this.studentService.bulkAddRegistration(this.registrationForm).subscribe({
      next: () => {
        alert('Alumnos inscritos correctamente.');
        this.selectedStudentIds.set(new Set());
        this.loadData();
        this.closeModal();
      },
      error: (err) => alert(err.error?.message || 'Error al inscribir alumnos')
    });
  }

  getRoleLabel(roleValue: number): string {
    return this.roles().find(r => r.key === roleValue)?.label || roleValue.toString();
  }
}
