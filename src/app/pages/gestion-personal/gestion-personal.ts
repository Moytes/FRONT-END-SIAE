import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { CatalogService } from '../../core/services/catalog.service';
import { StudentService } from '../../core/services/student.service';
import {
  UserListItem,
  School,
  SchoolZone,
  UserRole,
  AddUserRequest,
  EnumOption,
  SchoolYear,
  Group,
  StudentListItem
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
  private studentService = inject(StudentService);

  UserRole = UserRole;

  // State
  users = signal<UserListItem[]>([]);
  schools = signal<School[]>([]);
  zones = signal<SchoolZone[]>([]);
  roles = signal<EnumOption[]>([]);
  schoolYears = signal<SchoolYear[]>([]);
  loading = signal(false);
  showModal = signal(false);

  // Paso 2: vincular al colaborador recién creado (docente → grupo, tutor → alumno)
  showLinkModal = signal(false);
  createdUserId = signal<string | null>(null);
  createdUserRole = signal<UserRole | null>(null);
  linkSaving = signal(false);

  groups = signal<Group[]>([]);
  linkGroupId = '';
  linkEsTitular = true;

  studentSearchTerm = '';
  studentResults = signal<StudentListItem[]>([]);
  selectedStudentId = '';
  parentesco = '';

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
      this.roles.set(res);
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

    // Limpiar campos que el backend espera como int? — mandar '' rompe la
    // deserialización, así que se eliminan si el rol no los necesita.
    const payload = { ...this.userForm };
    const role = Number(payload.role);

    if (!this.requiresSchool(role)) {
      delete payload.schoolId;
    }
    if (!this.requiresZone(role)) {
      delete payload.schoolZoneId;
    }

    this.userService.createUser(payload).subscribe({
      next: (res) => {
        this.loadData();
        this.closeModal();

        if (role === UserRole.DOCENTE) {
          this.startLinkDocente(res.data);
        } else if (role === UserRole.TUTOR) {
          this.startLinkTutor(res.data);
        } else {
          alert('Usuario creado exitosamente.');
        }
      },
      error: (err) => alert(err.error?.message || 'Error al crear usuario')
    });
  }

  // ---- Paso 2: docente → grupo ----

  private startLinkDocente(userId: string) {
    this.createdUserId.set(userId);
    this.createdUserRole.set(UserRole.DOCENTE);
    this.linkGroupId = '';
    this.linkEsTitular = true;

    const schoolId = this.userForm.schoolId;
    this.catalogService.getGroups(schoolId, this.userForm.schoolYearId).subscribe(res => {
      this.groups.set(res);
      this.showLinkModal.set(true);
    });
  }

  confirmAssignGroup() {
    const userId = this.createdUserId();
    if (!userId || !this.linkGroupId) {
      alert('Selecciona un grupo.');
      return;
    }

    this.linkSaving.set(true);
    this.userService.assignToGroup(userId, {
      groupId: this.linkGroupId,
      schoolYearId: this.userForm.schoolYearId || '',
      esTitular: this.linkEsTitular
    }).subscribe({
      next: () => {
        this.linkSaving.set(false);
        alert('Docente creado y asignado al grupo exitosamente.');
        this.closeLinkModal();
      },
      error: (err) => {
        this.linkSaving.set(false);
        alert(err.error?.message || 'El usuario se creó, pero no se pudo asignar al grupo.');
      }
    });
  }

  // ---- Paso 2: tutor → alumno ----

  private startLinkTutor(userId: string) {
    this.createdUserId.set(userId);
    this.createdUserRole.set(UserRole.TUTOR);
    this.studentSearchTerm = '';
    this.studentResults.set([]);
    this.selectedStudentId = '';
    this.parentesco = '';
    this.showLinkModal.set(true);
  }

  searchStudentsForTutor() {
    if (!this.studentSearchTerm.trim()) {
      this.studentResults.set([]);
      return;
    }
    this.studentService.getStudents(this.studentSearchTerm).subscribe(res => {
      this.studentResults.set(res);
    });
  }

  confirmLinkTutor() {
    const userId = this.createdUserId();
    if (!userId || !this.selectedStudentId) {
      alert('Busca y selecciona al alumno.');
      return;
    }

    const student = this.studentResults().find(s => s.id === this.selectedStudentId);
    const nombreTutor = `${this.userForm.name} ${this.userForm.fatherLastName}`.trim();

    this.linkSaving.set(true);
    this.studentService.addTutor(this.selectedStudentId, {
      completeName: nombreTutor,
      parent: this.parentesco || 'Tutor',
      email: this.userForm.email,
      userId
    }).subscribe({
      next: () => {
        this.linkSaving.set(false);
        alert(`Tutor creado y vinculado a ${student?.name || 'el alumno'} exitosamente.`);
        this.closeLinkModal();
      },
      error: (err) => {
        this.linkSaving.set(false);
        alert(err.error?.message || 'El usuario se creó, pero no se pudo vincular al alumno.');
      }
    });
  }

  linkAnotherStudent() {
    // Deja el modal abierto para vincular al mismo tutor con otro alumno (ej. hermanos).
    this.studentSearchTerm = '';
    this.studentResults.set([]);
    this.selectedStudentId = '';
  }

  closeLinkModal() {
    this.showLinkModal.set(false);
    this.createdUserId.set(null);
    this.createdUserRole.set(null);
    this.loadData();
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
