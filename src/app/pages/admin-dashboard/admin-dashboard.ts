import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { CatalogService } from '../../core/services/catalog.service';
import {
  UserListItem,
  School,
  SchoolZone,
  Group,
  SchoolYear,
  UserRole,
  AddSchoolRequest,
  AddGroupRequest,
  AddUserRequest,
  AddSchoolZoneRequest,
  AddSchoolYearRequest,
  EnumOption
} from '../../core/models/api-models';

type AdminTab = 'overview' | 'years' | 'zones' | 'schools' | 'groups' | 'users';
type ModalType = 'none' | 'year' | 'zone' | 'view-zone' | 'school' | 'group' | 'user';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  private userService = inject(UserService);
  private catalogService = inject(CatalogService);

  // State
  activeTab = signal<AdminTab>('overview');
  showModal = signal<ModalType>('none');
  loading = signal(false);
  selectedZone = signal<SchoolZone | null>(null);

  // Data
  users = signal<UserListItem[]>([]);
  schools = signal<School[]>([]);
  zones = signal<SchoolZone[]>([]);
  groups = signal<Group[]>([]);
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
    this.loading.set(false);
  }

  loadCatalogs() {
    this.catalogService.getSchoolYears().subscribe(res => {
      this.schoolYears.set(res);
      if (res.length > 0 && !this.groupForm.schoolYearId) {
        const active = res.find(y => y.isActive) || res[0];
        this.groupForm.schoolYearId = active.id;
      }
    });
    this.userService.getRoles().subscribe(res => this.roles.set(res));
  }

  setTab(tab: AdminTab) {
    this.activeTab.set(tab);
  }

  openModal(type: ModalType) {
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

  resetForms() {
    this.yearForm = { name: '', startDate: '', endDate: '', isActive: true };
    this.zoneForm = { number: '', cct: '', name: '', description: '' };
    this.schoolForm = { name: '', cct: '', schoolZoneId: '' };
    this.groupForm = { 
      section: '', 
      grade: 1, 
      schoolId: '', 
      schoolYearId: this.schoolYears()[0]?.id || '' 
    };
    this.userForm = {
      email: '',
      password: '',
      name: '',
      fatherLastName: '',
      role: UserRole.ESPECIALISTA_APR,
      schoolZoneId: ''
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

    // Asegurar envío de datos limpios
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

  getRoleLabel(roleValue: number): string {
    return this.roles().find(r => r.key === roleValue)?.label || roleValue.toString();
  }
}
