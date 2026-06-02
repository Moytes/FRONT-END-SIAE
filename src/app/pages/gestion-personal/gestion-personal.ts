import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { CatalogService } from '../../core/services/catalog.service';
import {
  UserListItem,
  School,
  SchoolZone,
  UserRole,
  AddUserRequest,
  EnumOption,
  SchoolYear
} from '../../core/models/api-models';

@Component({
  selector: 'app-gestion-personal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-personal.html',
  styleUrl: './gestion-personal.css'
})
export class GestionPersonal implements OnInit {
  private userService = inject(UserService);
  private catalogService = inject(CatalogService);

  // State
  users = signal<UserListItem[]>([]);
  schools = signal<School[]>([]);
  zones = signal<SchoolZone[]>([]);
  roles = signal<EnumOption[]>([]);
  schoolYears = signal<SchoolYear[]>([]);
  loading = signal(false);
  showModal = signal(false);

  // Form Model
  userForm: AddUserRequest = {
    email: '',
    password: '',
    name: '',
    fatherLastName: '',
    role: UserRole.ESPECIALISTA_APR,
    schoolZoneId: '',
    schoolId: '',
    schoolYearId: ''
  };

  ngOnInit() {
    this.loadData();
    this.loadCatalogs();
  }

  async loadData() {
    this.loading.set(true);
    this.userService.getUsers().subscribe({
      next: (res) => this.users.set(res),
      complete: () => this.loading.set(false)
    });
  }

  loadCatalogs() {
    this.catalogService.getSchools().subscribe(res => this.schools.set(res));
    this.catalogService.getSchoolZones().subscribe(res => this.zones.set(res));
    this.userService.getRoles().subscribe(res => {
      // Filter out STUDENT role (9)
      this.roles.set(res.filter(r => r.key !== 9));
    });
    this.catalogService.getSchoolYears().subscribe(res => {
      this.schoolYears.set(res);
      const active = res.find(y => y.isActive) || res[0];
      if (active) this.userForm.schoolYearId = active.id;
    });
  }

  openModal() {
    this.resetForm();
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  resetForm() {
    const activeYearId = this.schoolYears().find(y => y.isActive)?.id || this.schoolYears()[0]?.id || '';
    this.userForm = {
      email: '',
      password: '',
      name: '',
      fatherLastName: '',
      role: UserRole.ESPECIALISTA_APR,
      schoolZoneId: '',
      schoolId: '',
      schoolYearId: activeYearId
    };
  }

  createUser() {
    if (!this.userForm.email || !this.userForm.password || !this.userForm.name) {
      alert('Por favor rellene los campos obligatorios.');
      return;
    }

    // Clean up unneeded fields based on role
    const payload = { ...this.userForm };
    const role = Number(payload.role);

    if (role === UserRole.ADMIN) {
      delete payload.schoolZoneId;
      delete payload.schoolId;
    } else if (role === UserRole.SUPERVISOR) {
      delete payload.schoolId;
    }

    this.userService.createUser(payload).subscribe({
      next: () => {
        alert('Usuario creado exitosamente.');
        this.loadData();
        this.closeModal();
      },
      error: (err) => alert(err.error?.message || 'Error al crear usuario')
    });
  }

  getRoleLabel(roleValue: number): string {
    return this.roles().find(r => r.key === roleValue)?.label || roleValue.toString();
  }

  requiresSchool(role: any): boolean {
    const r = Number(role);
    return [3, 4, 5, 6, 7, 8].includes(r); // Director, Especialistas, Trabajo Social, Docente
  }

  requiresZone(role: any): boolean {
    const r = Number(role);
    return r === 2; // Supervisor
  }
}
