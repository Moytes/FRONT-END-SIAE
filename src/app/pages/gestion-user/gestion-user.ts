import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { StudentService } from '../../core/services/student.service';
import { CatalogService } from '../../core/services/catalog.service';
import {
  StudentListItem,
  AddStudentRequest,
  UpdateStudentRequest,
  Gender,
  SchoolYear,
  Group,
  BulkAddRegistrationRequest
} from '../../core/models/api-models';

@Component({
  selector: 'app-gestion-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-user.html',
  styleUrl: './gestion-user.css',
})
export class GestionUser implements OnInit {
  authService = inject(AuthService);
  private studentService = inject(StudentService);
  private catalogService = inject(CatalogService);

  alumnos = signal<StudentListItem[]>([]);
  schoolYears = signal<SchoolYear[]>([]);
  groups = signal<Group[]>([]);
  loading = signal(true);
  error = signal('');
  showForm = signal(false);
  showRegistrationModal = signal(false);
  editingId = signal<string | null>(null);
  searchTerm = '';

  // Selection
  selectedStudentIds = signal<Set<string>>(new Set());

  // Form fields aligned with AddStudentRequest / UpdateStudentRequest
  formName = '';
  formFatherLastName = '';
  formMotherLastName = '';
  formGender: Gender = Gender.M;
  formBirthDate = '';
  formCurp = '';

  // Registration Form
  registrationForm: BulkAddRegistrationRequest = {
    studentIds: [],
    groupId: '',
    schoolYearId: ''
  };

  readonly Gender = Gender;
  readonly genderOptions = [
    { value: Gender.M, label: 'Masculino' },
    { value: Gender.F, label: 'Femenino' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadStudents();
    this.loadCatalogs();
  }

  loadStudents(search?: string): void {
    this.loading.set(true);
    this.error.set('');
    this.studentService.getStudents(search).subscribe({
      next: (data) => {
        const user = this.authService.currentUser();
        // Filtrado por pertenencia para Trabajo Social (Rol 7)
        if (user && user.role === 7 && user.schoolIds) {
          const mySchoolIds = new Set(user.schoolIds);
          this.alumnos.set(data.filter(a => a.schoolId && mySchoolIds.has(a.schoolId)));
        } else {
          this.alumnos.set(data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading students:', err);
        this.error.set('No se pudieron cargar los alumnos. Verifica la conexión con el servidor.');
        this.loading.set(false);
      }
    });
  }

  loadCatalogs(): void {
    this.catalogService.getSchoolYears().subscribe(res => {
      this.schoolYears.set(res);
      const active = res.find(y => y.isActive) || res[0];
      if (active && !this.registrationForm.schoolYearId) {
        this.registrationForm.schoolYearId = active.id;
      }
    });
    this.catalogService.getGroups().subscribe(res => this.groups.set(res));
  }

  onSearch(): void {
    this.loadStudents(this.searchTerm || undefined);
  }

  toggleSelection(id: string): void {
    const set = new Set(this.selectedStudentIds());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.selectedStudentIds.set(set);
  }

  openBulkRegistration(): void {
    if (this.selectedStudentIds().size === 0) return;
    this.registrationForm.studentIds = Array.from(this.selectedStudentIds());
    this.showRegistrationModal.set(true);
  }

  closeRegistrationModal(): void {
    this.showRegistrationModal.set(false);
    this.registrationForm.groupId = '';
  }

  bulkRegister(): void {
    if (!this.registrationForm.groupId || this.registrationForm.studentIds.length === 0) {
      alert('Seleccione un grupo y al menos un alumno.');
      return;
    }

    this.studentService.bulkAddRegistration(this.registrationForm).subscribe({
      next: () => {
        alert('Alumnos inscritos correctamente en el grupo.');
        this.selectedStudentIds.set(new Set());
        this.loadStudents();
        this.closeRegistrationModal();
      },
      error: (err) => {
        alert(err.error?.message || 'Error al inscribir alumnos');
      }
    });
  }

  getStudentFullName(a: StudentListItem): string {
    return [a.name, a.fatherLastName, a.motherLastName].filter(Boolean).join(' ');
  }

  getGenderLabel(g: Gender): string {
    return g === Gender.M ? 'Masculino' : 'Femenino';
  }

  getAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  getAvatarUrl(name: string, lastName: string): string {
    const seed = encodeURIComponent(`${name}+${lastName}`);
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=0ea5e9`;
  }

  openNew(): void {
    this.formName = '';
    this.formFatherLastName = '';
    this.formMotherLastName = '';
    this.formGender = Gender.M;
    this.formBirthDate = '';
    this.formCurp = '';
    this.editingId.set(null);
    this.showForm.set(true);
  }

  editAlumno(a: StudentListItem): void {
    this.formName = a.name;
    this.formFatherLastName = a.fatherLastName;
    this.formMotherLastName = a.motherLastName ?? '';
    this.formGender = a.gender;
    this.formBirthDate = a.birthDate ? a.birthDate.split('T')[0] : '';
    this.formCurp = a.curp ?? '';
    this.editingId.set(a.id);
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  isFormValid(): boolean {
    return !!this.formName.trim() && !!this.formFatherLastName.trim() && !!this.formBirthDate;
  }

  saveForm(): void {
    if (!this.isFormValid()) return;
    const id = this.editingId();

    if (id) {
      // UPDATE
      const req: UpdateStudentRequest = {
        name: this.formName,
        fatherLastName: this.formFatherLastName,
        motherLastName: this.formMotherLastName || undefined,
        gender: this.formGender,
        birthDate: this.formBirthDate,
        curp: this.formCurp || undefined
      };
      this.studentService.updateStudent(id, req).subscribe({
        next: () => {
          this.showForm.set(false);
          this.editingId.set(null);
          this.loadStudents();
        },
        error: (err) => {
          console.error('Error updating student:', err);
          alert('Error al actualizar el alumno. Intenta de nuevo.');
        }
      });
    } else {
      // CREATE
      const req: AddStudentRequest = {
        name: this.formName,
        fatherLastName: this.formFatherLastName,
        motherLastName: this.formMotherLastName || undefined,
        gender: this.formGender,
        birthDate: this.formBirthDate,
        curp: this.formCurp || undefined
      };
      this.studentService.createStudent(req).subscribe({
        next: () => {
          this.showForm.set(false);
          this.loadStudents();
        },
        error: (err) => {
          const msg = err?.error?.message || 'Error al crear el alumno.';
          alert(msg);
        }
      });
    }
  }
}
