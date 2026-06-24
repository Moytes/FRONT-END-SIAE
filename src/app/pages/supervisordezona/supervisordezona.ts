import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupervisorZoneService } from '../../core/services/supervisor-zone.service';
import {
  School,
  SupervisorCreateStaffRequest,
  SupervisorUpdateStaffRequest,
  UserListItem,
  UserRole
} from '../../core/models/api-models';

type AlertType = 'success' | 'error' | 'info';

interface AlertState {
  type: AlertType;
  title: string;
  message: string;
}

interface StaffForm {
  id?: string;
  email: string;
  password: string;
  name: string;
  fatherLastName: string;
  motherLastName: string;
  roleId: UserRole;
  schoolId: string;
  phone: string;
  avatarUrl: string;
  activo: boolean;
}

@Component({
  selector: 'app-supervisordezona',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supervisordezona.html',
  styleUrl: './supervisordezona.css'
})
export class Supervisordezona implements OnInit {
  private supervisorService = inject(SupervisorZoneService);

  readonly UserRole = UserRole;
  readonly managedRoles = [
    { id: UserRole.DIRECTOR_USAER, label: 'Director USAER' },
    { id: UserRole.ESPECIALISTA_COM, label: 'Especialista en Comunicación' },
    { id: UserRole.ESPECIALISTA_PSI, label: 'Especialista en Psicología' },
    { id: UserRole.ESPECIALISTA_APR, label: 'Especialista en Aprendizaje' },
    { id: UserRole.TRABAJO_SOCIAL, label: 'Trabajo Social' },
    { id: UserRole.DOCENTE, label: 'Docente' }
  ];

  schools = signal<School[]>([]);
  staff = signal<UserListItem[]>([]);
  loading = signal(false);
  saving = signal(false);
  modalOpen = signal(false);
  confirmOpen = signal(false);
  editingUser = signal<UserListItem | null>(null);
  alert = signal<AlertState | null>(null);

  searchTerm = signal('');
  selectedSchoolId = signal('');
  selectedRoleId = signal<UserRole | ''>('');
  selectedStatus = signal<'all' | 'active' | 'inactive'>('all');

  form: StaffForm = this.createEmptyForm();

  filteredStaff = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.selectedStatus();

    return this.staff().filter(user => {
      const fullName = `${user.name} ${user.fatherLastName} ${user.motherLastName || ''}`.toLowerCase();
      const matchesTerm = !term || fullName.includes(term) || user.email.toLowerCase().includes(term);
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && user.status === 1) ||
        (status === 'inactive' && user.status === 0);

      return matchesTerm && matchesStatus;
    });
  });

  activeStaffCount = computed(() => this.staff().filter(user => user.status === 1).length);
  directorsCount = computed(() => this.staff().filter(user => Number(user.role) === UserRole.DIRECTOR_USAER).length);
  teachersCount = computed(() => this.staff().filter(user => Number(user.role) === UserRole.DOCENTE).length);
  specialistsCount = computed(() =>
    this.staff().filter(user => [UserRole.ESPECIALISTA_COM, UserRole.ESPECIALISTA_PSI, UserRole.ESPECIALISTA_APR, UserRole.TRABAJO_SOCIAL].includes(Number(user.role))).length
  );

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.supervisorService.getSchools().subscribe({
      next: schools => this.schools.set(schools),
      error: () => this.showAlert('error', 'No se pudieron cargar las escuelas', 'Verifica tu sesión o intenta de nuevo.'),
    });

    this.loadStaff();
  }

  loadStaff(): void {
    this.supervisorService.getStaff(this.selectedRoleId(), this.selectedSchoolId()).subscribe({
      next: staff => {
        this.staff.set(staff);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showAlert('error', 'No se pudo cargar el personal', 'El servicio no respondió correctamente.');
      }
    });
  }

  applyServerFilters(): void {
    this.loading.set(true);
    this.loadStaff();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedSchoolId.set('');
    this.selectedRoleId.set('');
    this.selectedStatus.set('all');
    this.applyServerFilters();
  }

  openCreateModal(): void {
    this.editingUser.set(null);
    this.form = this.createEmptyForm();
    this.form.schoolId = this.schools()[0]?.id?.toString() || '';
    this.modalOpen.set(true);
  }

  openEditModal(user: UserListItem): void {
    this.editingUser.set(user);
    this.form = {
      id: user.id,
      email: user.email,
      password: '',
      name: user.name,
      fatherLastName: user.fatherLastName,
      motherLastName: user.motherLastName || '',
      roleId: Number(user.role) as UserRole,
      schoolId: user.schoolId?.toString() || this.findSchoolIdByName(user.schoolName) || '',
      phone: user.phoneNumber || '',
      avatarUrl: user.avatarUrl || '',
      activo: user.status === 1
    };
    this.modalOpen.set(true);
  }

  closeModal(): void {
    if (this.saving()) return;
    this.modalOpen.set(false);
  }

  requestStatusToggle(user: UserListItem): void {
    this.openEditModal(user);
    this.form.activo = user.status !== 1;
    this.confirmOpen.set(true);
  }

  closeConfirm(): void {
    this.confirmOpen.set(false);
    this.modalOpen.set(false);
  }

  saveStatusToggle(): void {
    this.confirmOpen.set(false);
    this.saveStaff(true);
  }

  saveStaff(fromStatusToggle = false): void {
    const validation = this.validateForm();
    if (validation) {
      this.showAlert('error', 'Formulario incompleto', validation);
      return;
    }

    this.saving.set(true);
    const current = this.editingUser();

    if (current) {
      const payload: SupervisorUpdateStaffRequest = {
        email: this.form.email.trim(),
        name: this.form.name.trim(),
        fatherLastName: this.form.fatherLastName.trim(),
        motherLastName: this.form.motherLastName.trim() || undefined,
        roleId: Number(this.form.roleId) as UserRole,
        schoolId: this.form.schoolId,
        phone: this.form.phone.trim() || undefined,
        avatarUrl: this.form.avatarUrl.trim() || undefined,
        activo: this.form.activo
      };

      this.supervisorService.updateStaff(current.id, payload).subscribe({
        next: () => this.afterSave(fromStatusToggle ? 'Estado actualizado' : 'Usuario actualizado', 'Los cambios se guardaron correctamente.'),
        error: err => this.afterError(err, 'No se pudo actualizar el usuario')
      });
      return;
    }

    const payload: SupervisorCreateStaffRequest = {
      email: this.form.email.trim(),
      password: this.form.password,
      name: this.form.name.trim(),
      fatherLastName: this.form.fatherLastName.trim(),
      motherLastName: this.form.motherLastName.trim() || undefined,
      roleId: Number(this.form.roleId) as UserRole,
      schoolId: this.form.schoolId,
      phone: this.form.phone.trim() || undefined,
      avatarUrl: this.form.avatarUrl.trim() || undefined
    };

    this.supervisorService.createStaff(payload).subscribe({
      next: () => this.afterSave('Usuario creado', 'El personal fue agregado a tu escuela correctamente.'),
      error: err => this.afterError(err, 'No se pudo crear el usuario')
    });
  }

  getRoleLabel(role: UserRole | number): string {
    return this.managedRoles.find(item => item.id === Number(role))?.label || 'Sin rol';
  }

  getRoleClass(role: UserRole | number): string {
    switch (Number(role)) {
      case UserRole.DIRECTOR_USAER:
        return 'role-director';
      case UserRole.DOCENTE:
        return 'role-docente';
      case UserRole.TRABAJO_SOCIAL:
        return 'role-social';
      default:
        return 'role-especialista';
    }
  }

  private afterSave(title: string, message: string): void {
    this.saving.set(false);
    this.modalOpen.set(false);
    this.loadStaff();
    this.showAlert('success', title, message);
  }

  private afterError(error: any, fallbackTitle: string): void {
    this.saving.set(false);
    const message = error?.message || error?.error?.data || error?.error || 'Revisa los datos e intenta de nuevo.';
    this.showAlert('error', fallbackTitle, message);
  }

  private validateForm(): string {
    if (!this.form.name.trim() || !this.form.fatherLastName.trim()) return 'Nombre y apellido paterno son obligatorios.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) return 'Ingresa un correo electrónico válido.';
    if (!this.editingUser() && this.form.password.length < 8) return 'La contraseña temporal debe tener al menos 8 caracteres.';
    if (!this.form.roleId) return 'Selecciona un rol para el usuario.';
    if (!this.form.schoolId) return 'Selecciona una escuela asignada.';
    return '';
  }

  private createEmptyForm(): StaffForm {
    return {
      email: '',
      password: '',
      name: '',
      fatherLastName: '',
      motherLastName: '',
      roleId: UserRole.DOCENTE,
      schoolId: '',
      phone: '',
      avatarUrl: '',
      activo: true
    };
  }

  private findSchoolIdByName(name?: string): string {
    if (!name) return '';
    return this.schools().find(school => school.name === name)?.id?.toString() || '';
  }

  private showAlert(type: AlertType, title: string, message: string): void {
    this.alert.set({ type, title, message });
    window.setTimeout(() => {
      const current = this.alert();
      if (current?.title === title) this.alert.set(null);
    }, 5000);
  }
}
