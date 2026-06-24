import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TrabajoSocialService } from '../../core/services/trabajo-social.service';
import {
  AddGroupRequest,
  AddTutorRequest,
  AssignDocenteRequest,
  EnumOption,
  Gender,
  Group,
  GroupWithTeachers,
  School,
  SchoolYear,
  StudentListItem,
  TrabajoSocialQuickStudentRequest,
  TutorListItem,
  UserListItem
} from '../../core/models/api-models';

type TabKey = 'alumnos' | 'grupos' | 'registro' | 'tutores';
type AlertType = 'success' | 'error' | 'info';

interface AlertState {
  type: AlertType;
  title: string;
  message: string;
}

@Component({
  selector: 'app-trabajadorsocial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trabajadorsocial.html',
  styleUrl: './trabajadorsocial.css'
})
export class Trabajadorsocial implements OnInit {
  private socialService = inject(TrabajoSocialService);

  readonly Gender = Gender;
  readonly tabs: { key: TabKey; label: string }[] = [
    { key: 'alumnos', label: 'Alumnos' },
    { key: 'grupos', label: 'Grupos' },
    { key: 'registro', label: 'Registro rápido' },
    { key: 'tutores', label: 'Tutores' }
  ];

  activeTab = signal<TabKey>('alumnos');
  alert = signal<AlertState | null>(null);
  loading = signal(false);
  saving = signal(false);

  schools = signal<School[]>([]);
  years = signal<SchoolYear[]>([]);
  grades = signal<EnumOption[]>([]);
  groups = signal<Group[]>([]);
  students = signal<StudentListItem[]>([]);
  tutors = signal<TutorListItem[]>([]);
  selectedStudent = signal<StudentListItem | null>(null);

  selectedSchoolId = signal('');
  selectedYearId = signal('');
  selectedGroupId = signal('');
  quickGroupId = signal('');
  searchTerm = signal('');

  showGroupModal = signal(false);
  showTutorModal = signal(false);
  showAssignDocenteModal = signal(false);

  groupsWithTeachers = signal<GroupWithTeachers[]>([]);
  docentes = signal<UserListItem[]>([]);
  modalGrades = signal<EnumOption[]>([]);
  selectedEducationLevelFilter = signal('');
  selectedGroupForDocente = signal<GroupWithTeachers | null>(null);
  assignDocenteForm: AssignDocenteRequest = { docenteId: '', schoolYearId: '', esTitular: false };

  selectedGroupDetail = signal<GroupWithTeachers | null>(null);
  groupStudents = signal<StudentListItem[]>([]);
  loadingGroupStudents = signal(false);
  showAssignStudentModal = signal(false);
  allSchoolStudents = signal<StudentListItem[]>([]);
  selectedStudentIds = signal<Set<string>>(new Set());
  assignStudentSearch = signal('');

  availableStudents = computed(() => {
    const enrolled = new Set(this.groupStudents().map(s => s.id));
    const search = this.assignStudentSearch().trim().toLowerCase();
    return this.allSchoolStudents()
      .filter(s => !enrolled.has(s.id))
      .filter(s => {
        if (!search) return true;
        const name = `${s.name} ${s.fatherLastName} ${s.motherLastName || ''}`.toLowerCase();
        return name.includes(search) || (s.curp || '').toLowerCase().includes(search);
      });
  });

  readonly educationLevels = [
    { id: '1', name: 'Preescolar' },
    { id: '2', name: 'Primaria' },
    { id: '3', name: 'Secundaria' },
    { id: '4', name: 'Preparatoria' }
  ];

  groupForm: AddGroupRequest = {
    schoolId: '',
    schoolYearId: '',
    section: 'A',
    grade: 1,
    gradeId: 1
  };

  quickForm: TrabajoSocialQuickStudentRequest = this.createQuickForm();
  tutorForm: AddTutorRequest = this.createTutorForm();
  tutorAccount = { enabled: false, email: '', password: '' };

  filteredStudents = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.students();

    return this.students().filter(student => {
      const name = `${student.name} ${student.fatherLastName} ${student.motherLastName || ''}`.toLowerCase();
      return name.includes(term) || (student.curp || '').toLowerCase().includes(term);
    });
  });

  filteredGroupsWithTeachers = computed(() => {
    const levelFilter = this.selectedEducationLevelFilter();
    const groups = this.groupsWithTeachers();
    if (!levelFilter) return groups;
    return groups.filter(g => g.educationLevelId?.toString() === levelFilter);
  });

  activeGroupsCount = computed(() => this.groups().length);
  registeredStudentsCount = computed(() => this.students().length);
  schoolsCount = computed(() => this.schools().length);
  tutorsCount = computed(() => this.tutors().length);
  selectedQuickGroup = computed(() => this.groups().find(group => group.id === this.quickGroupId()));

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading.set(true);
    this.socialService.getSchools().subscribe({
      next: schools => {
        this.schools.set(schools);
        const firstSchool = schools[0]?.id?.toString() || '';
        this.selectedSchoolId.set(firstSchool);
        this.groupForm.schoolId = firstSchool;
        this.quickForm.groupId = '';
        this.loadGroups();
        this.loadGroupsWithTeachers();
        this.loadStudents();
      },
      error: () => this.showAlert('error', 'No se cargaron las escuelas', 'Tu sesión no tiene escuelas asignadas o el servicio no respondió.')
    });

    this.socialService.getSchoolYears().subscribe(years => {
      this.years.set(years);
      const active = years.find(year => year.isActive || year.activo) || years[0];
      if (active) {
        this.selectedYearId.set(active.id);
        this.groupForm.schoolYearId = active.id;
        this.quickForm.schoolYearId = active.id;
      }
    });

    this.socialService.getGrades().subscribe(grades => this.grades.set(grades));
  }

  loadGroups(): void {
    this.socialService.getGroups(this.selectedSchoolId(), this.selectedYearId()).subscribe({
      next: groups => {
        this.groups.set(groups);
        if (!this.selectedGroupId() && groups[0]) this.selectedGroupId.set(groups[0].id);
        if (!this.quickForm.groupId && groups[0]) this.onQuickGroupChange(groups[0].id);
      },
      error: () => this.showAlert('error', 'No se cargaron los grupos', 'Intenta de nuevo.')
    });
  }

  loadStudents(): void {
    this.loading.set(true);
    this.socialService.getStudents(undefined, this.selectedSchoolId(), this.selectedGroupId()).subscribe({
      next: students => {
        this.students.set(students);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showAlert('error', 'No se cargaron los alumnos', 'Verifica tu conexión o permisos.');
      }
    });
  }

  refreshScopedData(): void {
    this.selectedGroupId.set('');
    this.loadGroups();
    this.loadGroupsWithTeachers();
    this.loadStudents();
  }

  loadGroupsWithTeachers(): void {
    this.socialService.getGroupsWithTeachers(this.selectedSchoolId(), this.selectedYearId()).subscribe({
      next: groups => this.groupsWithTeachers.set(groups),
      error: () => this.showAlert('error', 'No se cargaron los grupos', 'Intenta de nuevo.')
    });
  }

  openGroupModal(): void {
    const schoolId = this.selectedSchoolId() || this.schools()[0]?.id || '';
    this.groupForm = {
      schoolId,
      schoolYearId: this.selectedYearId() || this.years()[0]?.id || '',
      section: 'A',
      grade: Number(this.grades()[0]?.key || 1),
      gradeId: Number(this.grades()[0]?.key || 1)
    };
    this.onGroupSchoolChange(schoolId);
    this.showGroupModal.set(true);
  }

  onGroupSchoolChange(schoolId: string): void {
    this.groupForm.schoolId = schoolId;
    const school = this.schools().find(s => s.id === schoolId);
    if (school?.educationLevelId) {
      this.socialService.getGrades(school.educationLevelId).subscribe(grades => {
        this.modalGrades.set(grades);
        if (grades.length > 0) {
          this.groupForm.gradeId = grades[0].key;
          this.groupForm.grade = grades[0].key;
        }
      });
    } else {
      this.modalGrades.set(this.grades());
    }
  }

  createGroup(): void {
    if (!this.groupForm.schoolId || !this.groupForm.schoolYearId || !this.groupForm.gradeId || !this.groupForm.section.trim()) {
      this.showAlert('error', 'Formulario incompleto', 'Selecciona escuela, ciclo, grado y sección.');
      return;
    }

    this.prepareQuickPayload();
    this.saving.set(true);
    this.socialService.createGroup(this.groupForm).subscribe({
      next: () => {
        this.saving.set(false);
        this.showGroupModal.set(false);
        this.loadGroups();
        this.loadGroupsWithTeachers();
        this.showAlert('success', 'Grupo creado', 'El grupo quedó disponible para registrar alumnos.');
      },
      error: err => this.handleError(err, 'No se pudo crear el grupo')
    });
  }

  saveQuickStudent(): void {
    const validation = this.validateQuickForm();
    if (validation) {
      this.showAlert('error', 'Registro incompleto', validation);
      return;
    }

    this.saving.set(true);
    this.socialService.quickRegisterStudent(this.quickForm).subscribe({
      next: () => {
        this.saving.set(false);
        this.quickForm = this.createQuickForm();
        this.quickForm.schoolYearId = this.selectedYearId();
        this.onQuickGroupChange(this.selectedGroupId() || this.groups()[0]?.id || '');
        this.loadStudents();
        this.activeTab.set('alumnos');
        this.showAlert('success', 'Alumno registrado', 'El alumno, tutor e inscripción fueron guardados correctamente.');
      },
      error: err => this.handleError(err, 'No se pudo registrar el alumno')
    });
  }

  selectStudentForTutors(student: StudentListItem): void {
    this.selectedStudent.set(student);
    this.tutorForm = this.createTutorForm();
    this.tutorAccount = { enabled: false, email: '', password: '' };
    this.loadTutors(student.id);
    this.showTutorModal.set(true);
  }

  loadTutors(studentId: string): void {
    this.socialService.getTutors(studentId).subscribe({
      next: tutors => this.tutors.set(tutors),
      error: () => this.showAlert('error', 'No se cargaron los tutores', 'Intenta de nuevo.')
    });
  }

  addTutor(): void {
    const student = this.selectedStudent();
    if (!student) return;

    if (!this.tutorForm.completeName.trim()) {
      this.showAlert('error', 'Tutor incompleto', 'El nombre completo del tutor es obligatorio.');
      return;
    }

    this.saving.set(true);
    this.socialService.addTutor(student.id, this.tutorForm).subscribe({
      next: result => {
        const tutorId = Number(result.data);
        if (this.tutorAccount.enabled) {
          this.createTutorAccount(student.id, tutorId);
          return;
        }

        this.saving.set(false);
        this.tutorForm = this.createTutorForm();
        this.loadTutors(student.id);
        this.showAlert('success', 'Tutor agregado', 'El tutor fue vinculado al alumno.');
      },
      error: err => this.handleError(err, 'No se pudo agregar el tutor')
    });
  }

  createTutorAccount(studentId: string, tutorId: number): void {
    if (!this.tutorAccount.email || this.tutorAccount.password.length < 8) {
      this.saving.set(false);
      this.showAlert('error', 'Cuenta incompleta', 'Correo y contraseña de al menos 8 caracteres son obligatorios.');
      return;
    }

    this.socialService.createTutorAccount(studentId, tutorId, this.tutorAccount.email, this.tutorAccount.password).subscribe({
      next: () => {
        this.saving.set(false);
        this.tutorForm = this.createTutorForm();
        this.tutorAccount = { enabled: false, email: '', password: '' };
        this.loadTutors(studentId);
        this.showAlert('success', 'Tutor con cuenta', 'El tutor ya puede acceder a la plataforma.');
      },
      error: err => this.handleError(err, 'El tutor se guardó, pero no se pudo crear su cuenta')
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

  openAssignDocente(group: GroupWithTeachers): void {
    this.selectedGroupForDocente.set(group);
    this.assignDocenteForm = { docenteId: '', schoolYearId: this.selectedYearId(), esTitular: false };
    this.socialService.getDocentes(group.schoolId).subscribe(d => this.docentes.set(d));
    this.showAssignDocenteModal.set(true);
  }

  assignDocente(): void {
    const group = this.selectedGroupForDocente();
    if (!group || !this.assignDocenteForm.docenteId) {
      this.showAlert('error', 'Selección incompleta', 'Selecciona un docente.');
      return;
    }
    this.saving.set(true);
    this.socialService.assignDocenteToGroup(group.id, this.assignDocenteForm).subscribe({
      next: () => {
        this.saving.set(false);
        this.showAssignDocenteModal.set(false);
        this.loadGroupsWithTeachers();
        this.showAlert('success', 'Docente asignado', 'El docente fue vinculado al grupo exitosamente.');
      },
      error: err => this.handleError(err, 'No se pudo asignar el docente')
    });
  }

  openGroupDetail(group: GroupWithTeachers): void {
    this.selectedGroupDetail.set(group);
    this.loadGroupStudents(group.id);
  }

  closeGroupDetail(): void {
    this.selectedGroupDetail.set(null);
    this.groupStudents.set([]);
  }

  loadGroupStudents(groupId: string): void {
    this.loadingGroupStudents.set(true);
    this.socialService.getStudents(undefined, undefined, groupId).subscribe({
      next: students => {
        this.groupStudents.set(students);
        this.loadingGroupStudents.set(false);
      },
      error: () => {
        this.loadingGroupStudents.set(false);
        this.showAlert('error', 'Error', 'No se pudieron cargar los alumnos del grupo.');
      }
    });
  }

  openAssignStudentModal(): void {
    const group = this.selectedGroupDetail();
    if (!group) return;
    this.selectedStudentIds.set(new Set());
    this.assignStudentSearch.set('');
    this.socialService.getStudents(undefined, group.schoolId).subscribe(students => {
      this.allSchoolStudents.set(students);
    });
    this.showAssignStudentModal.set(true);
  }

  toggleStudentSelection(studentId: string): void {
    this.selectedStudentIds.update(ids => {
      const next = new Set(ids);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  }

  assignStudentsToGroup(): void {
    const group = this.selectedGroupDetail();
    const ids = Array.from(this.selectedStudentIds());
    if (!group || ids.length === 0) {
      this.showAlert('error', 'Sin selección', 'Selecciona al menos un alumno.');
      return;
    }

    this.saving.set(true);
    this.socialService.bulkRegister({
      studentIds: ids,
      groupId: group.id,
      schoolYearId: this.selectedYearId(),
      isNew: false,
      isTracking: false
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.showAssignStudentModal.set(false);
        this.loadGroupStudents(group.id);
        this.loadStudents();
        this.showAlert('success', 'Alumnos inscritos', `Se inscribieron ${ids.length} alumno(s) al grupo ${group.displayName}.`);
      },
      error: err => this.handleError(err, 'No se pudieron inscribir los alumnos')
    });
  }

  onQuickGroupChange(groupId: string): void {
    this.quickForm.groupId = groupId;
    this.quickGroupId.set(groupId);
    if (this.isTutorManagedLevel()) {
      this.quickForm.createTutorAccount = true;
      this.quickForm.studentEmail = '';
      this.quickForm.studentPassword = '';
      return;
    }

    if (this.isStudentManagedLevel()) {
      this.quickForm.createTutorAccount = false;
      this.quickForm.tutorPassword = '';
    }
  }

  selectedLevelLabel(): string {
    return this.selectedQuickGroup()?.educationLevelName || 'Nivel no definido';
  }

  isTutorManagedLevel(): boolean {
    const levelId = Number(this.selectedQuickGroup()?.educationLevelId || 0);
    return levelId === 1 || levelId === 2;
  }

  isStudentManagedLevel(): boolean {
    const levelId = Number(this.selectedQuickGroup()?.educationLevelId || 0);
    return levelId === 3 || levelId === 4;
  }

  private validateQuickForm(): string {
    if (!this.quickForm.name.trim() || !this.quickForm.fatherLastName.trim()) return 'Nombre y apellido paterno son obligatorios.';
    if (!this.quickForm.birthDate) return 'La fecha de nacimiento es obligatoria.';
    if (!this.quickForm.groupId || !this.quickForm.schoolYearId) return 'Selecciona grupo y ciclo escolar.';
    if (this.isTutorManagedLevel()) {
      if (!this.quickForm.tutorCompleteName.trim()) return 'En preescolar y primaria el tutor principal es obligatorio.';
      if (!this.quickForm.tutorEmail || !this.quickForm.tutorPassword || this.quickForm.tutorPassword.length < 8) {
        return 'En preescolar y primaria se requiere correo y contraseña del tutor, mínimo 8 caracteres.';
      }
    }
    if (this.isStudentManagedLevel() && (!this.quickForm.studentEmail || !this.quickForm.studentPassword || this.quickForm.studentPassword.length < 8)) {
      return 'En secundaria y preparatoria se requiere correo y contraseña del alumno, mínimo 8 caracteres.';
    }
    return '';
  }

  private prepareQuickPayload(): void {
    if (this.isTutorManagedLevel()) {
      this.quickForm.createTutorAccount = true;
      this.quickForm.studentEmail = '';
      this.quickForm.studentPassword = '';
      return;
    }

    if (this.isStudentManagedLevel()) {
      this.quickForm.createTutorAccount = false;
      this.quickForm.tutorPassword = '';
    }
  }

  private createQuickForm(): TrabajoSocialQuickStudentRequest {
    return {
      name: '',
      fatherLastName: '',
      motherLastName: '',
      sexo: Gender.M,
      birthDate: '',
      curp: '',
      photoUrl: '',
      groupId: '',
      schoolYearId: '',
      isNew: true,
      isTracking: false,
      notes: '',
      tutorCompleteName: '',
      tutorParentesco: '',
      tutorPhone: '',
      tutorEmail: '',
      tutorAddress: '',
      createTutorAccount: false,
      tutorPassword: '',
      studentEmail: '',
      studentPassword: ''
    };
  }

  private createTutorForm(): AddTutorRequest {
    return {
      completeName: '',
      parent: '',
      phoneNumber: '',
      email: '',
      address: ''
    };
  }

  private handleError(error: any, title: string): void {
    this.saving.set(false);
    const message = error?.message || error?.error?.data || error?.error || 'Revisa la información e intenta de nuevo.';
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
