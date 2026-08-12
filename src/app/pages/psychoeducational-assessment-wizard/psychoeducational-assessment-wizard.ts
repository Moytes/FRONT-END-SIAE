import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Group,
  SavePsychoeducationalAssessmentRequest,
  SchoolYear,
  StudentListItem,
  EvalPsicoBap,
  EvalPsicoColaborador
} from '../../core/models/api-models';
import { PsicologiaService } from '../../core/services/psicologia.service';
import { PsychoService } from '../../core/services/psycho.service';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface WizardForm extends Omit<SavePsychoeducationalAssessmentRequest, 'alumnoId' | 'cicloId' | 'estado'> {
  curp: string;
  nombreCompleto: string;
  grado?: number;
  grupoId: string;
  cicloId: string;
  estado: 'BORRADOR' | 'EN_REVISION';
}

@Component({
  selector: 'app-psychoeducational-assessment-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './psychoeducational-assessment-wizard.html',
  styleUrl: './psychoeducational-assessment-wizard.css'
})
export class PsychoeducationalAssessmentWizard implements OnInit, OnDestroy {
  private psicologiaService = inject(PsicologiaService);
  private psychoService = inject(PsychoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly steps = ['Datos del Alumno', 'Instrumentos', 'Resultados', 'Observaciones', 'Cierre'];
  readonly areas = ['Cognitiva', 'Lenguaje', 'Motricidad', 'Socioemocional', 'Académica', 'Conductual'];
  readonly instruments = ['WISC-V', 'Bender Gestalt II', 'PROLEC-R', 'EDAH', 'Vineland', 'Figura de Rey'];

  currentStep = 1;
  editingId: number | null = null;
  schoolYears: SchoolYear[] = [];
  groups: Group[] = [];
  selectedStudent: StudentListItem | null = null;
  searchingStudent = false;
  studentError = '';
  saving = false;
  loadingEdit = false;
  submitError = '';
  bapRows: EvalPsicoBap[] = [];
  colaboradorRows: EvalPsicoColaborador[] = [];
  private curpTimer?: ReturnType<typeof setTimeout>;

  form: WizardForm = this.emptyForm();

  get pageTitle(): string {
    return this.editingId ? 'Continuar Evaluación Psicopedagógica' : 'Nueva Evaluación Psicopedagógica';
  }

  get availableGrades(): number[] {
    const grades = [...new Set(this.groups.map(group => Number(group.grade)).filter(Boolean))];
    return grades.length ? grades.sort((a, b) => a - b) : [1, 2, 3, 4, 5, 6];
  }

  get filteredGroups(): Group[] {
    if (!this.form.grado) return this.groups;
    return this.groups.filter(group => Number(group.grade) === Number(this.form.grado));
  }

  ngOnInit(): void {
    this.psicologiaService.getSchoolYears(true).subscribe(years => {
      this.schoolYears = years;
      if (!this.editingId) {
        const active = years.find(year => year.isActive || year.activo) || years[0];
        if (active) this.form.cicloId = active.id;
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editingId = Number(idParam);
      this.loadExistingAssessment(this.editingId);
    }
  }

  ngOnDestroy(): void {
    if (this.curpTimer) clearTimeout(this.curpTimer);
  }

  onCurpChange(value: string): void {
    this.form.curp = value.toUpperCase().replace(/\s/g, '').slice(0, 18);
    this.selectedStudent = null;
    this.form.nombreCompleto = '';
    this.form.grado = undefined;
    this.form.grupoId = '';
    this.studentError = '';
    if (this.curpTimer) clearTimeout(this.curpTimer);

    if (this.form.curp.length !== 18) return;
    this.curpTimer = setTimeout(() => this.findStudentByCurp(), 350);
  }

  findStudentByCurp(): void {
    if (this.form.curp.length !== 18) return;
    const searchedCurp = this.form.curp;
    this.searchingStudent = true;
    this.psicologiaService.getStudents(searchedCurp).subscribe({
      next: students => {
        if (this.form.curp !== searchedCurp) return;
        this.searchingStudent = false;
        const student = students.find(item => item.curp?.toUpperCase() === searchedCurp);
        if (!student) {
          this.studentError = 'No se encontró un alumno con este CURP dentro de tu ámbito.';
          return;
        }
        this.applyStudent(student);
      },
      error: () => {
        this.searchingStudent = false;
        this.studentError = 'No fue posible consultar el alumno.';
      }
    });
  }

  private applyStudent(student: StudentListItem): void {
    this.selectedStudent = student;
    this.form.nombreCompleto = [student.name, student.fatherLastName, student.motherLastName]
      .filter(Boolean)
      .join(' ');
    if (student.schoolYearId) this.form.cicloId = student.schoolYearId;

    this.psicologiaService.getGroups(student.schoolId, this.form.cicloId || student.schoolYearId).subscribe(groups => {
      this.groups = groups;
      const currentGroup = groups.find(group => group.id === student.groupId);
      this.form.grado = currentGroup?.grade;
      this.form.grupoId = currentGroup?.id || student.groupId || '';
    });
  }

  onCycleChange(): void {
    if (!this.selectedStudent?.schoolId) return;
    this.psicologiaService.getGroups(this.selectedStudent.schoolId, this.form.cicloId).subscribe(groups => {
      this.groups = groups;
      if (!groups.some(group => group.id === this.form.grupoId)) {
        this.form.grupoId = '';
        this.form.grado = undefined;
      }
    });
  }

  onGradeChange(): void {
    if (!this.filteredGroups.some(group => group.id === this.form.grupoId)) {
      this.form.grupoId = '';
    }
  }

  toggleSelection(collection: string[], value: string): void {
    const index = collection.indexOf(value);
    if (index >= 0) collection.splice(index, 1);
    else collection.push(value);
  }

  isStepValid(step = this.currentStep): boolean {
    switch (step) {
      case 1:
        return !!this.selectedStudent
          && !!this.form.cicloId
          && !!this.form.motivoEvaluacion?.trim()
          && this.form.areasEvaluar.length > 0
          && this.form.instrumentosAplicar.length > 0
          && (!!this.editingId || (!!this.form.grado && !!this.form.grupoId));
      case 2:
        return !!this.form.instrumentosDetalle?.trim();
      case 3:
        return !!this.form.interpretacionResultados?.trim();
      case 4:
        return !!this.form.conductaEvaluacion?.trim();
      case 5:
        return !!this.form.conclusiones?.trim();
      default:
        return false;
    }
  }

  nextStep(): void {
    if (this.isStepValid() && this.currentStep < 5) this.currentStep++;
  }

  previousStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  goToStep(step: number): void {
    if (step < this.currentStep) this.currentStep = step;
  }

  cancel(): void {
    this.router.navigate(['/especialista']);
  }

  save(): void {
    if (!this.selectedStudent || !this.isStepValid(5) || this.saving) return;
    this.saving = true;
    this.submitError = '';

    const { curp, nombreCompleto, grado, grupoId, cicloId, ...clinicalFields } = this.form;
    const request: SavePsychoeducationalAssessmentRequest = {
      ...clinicalFields,
      alumnoId: this.selectedStudent.id,
      cicloId: Number(cicloId)
    };

    const request$ = this.editingId
      ? this.psychoService.updateAssessment(this.editingId, request)
      : this.psychoService.createAssessment(request);

    request$.pipe(
      switchMap(res => {
        const assessmentId = this.editingId ?? Number(res.data);
        if (!assessmentId || Number.isNaN(assessmentId)) {
          return of(null);
        }
        return forkJoin([
          this.psychoService.syncBaps(assessmentId, this.bapRows),
          this.psychoService.syncCollaborators(assessmentId, this.colaboradorRows)
        ]);
      })
    ).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/especialista']);
      },
      error: error => {
        this.saving = false;
        this.submitError = error.error?.message || 'No se pudo guardar la evaluación.';
      }
    });
  }

  addBapRow(): void {
    this.bapRows.push({ tipoBap: '', contexto: '', indicadorInclusion: '', descripcion: '' });
  }

  removeBapRow(index: number): void {
    this.bapRows.splice(index, 1);
  }

  addColaboradorRow(): void {
    this.colaboradorRows.push({ nombreExterno: '', rolColaborador: '' });
  }

  removeColaboradorRow(index: number): void {
    this.colaboradorRows.splice(index, 1);
  }

  private loadExistingAssessment(id: number): void {
    this.loadingEdit = true;
    this.psychoService.getAssessment(id).subscribe({
      next: detail => {
        this.loadingEdit = false;
        this.form = {
          ...this.emptyForm(),
          cicloId: String(detail.cicloId),
          estado: detail.estado === 'EN_REVISION' ? 'EN_REVISION' : 'BORRADOR',
          areasEvaluar: [...(detail.areasEvaluar || [])],
          instrumentosAplicar: [...(detail.instrumentosAplicar || [])],
          instrumentosDetalle: detail.instrumentosDetalle || '',
          motivoEvaluacion: detail.motivoEvaluacion || '',
          conductaEvaluacion: detail.conductaEvaluacion || '',
          antecedentesEmbarazo: detail.antecedentesEmbarazo || '',
          antecedentesHeredo: detail.antecedentesHeredo || '',
          desarrolloMotor: detail.desarrolloMotor || '',
          desarrolloLenguaje: detail.desarrolloLenguaje || '',
          historiaMedica: detail.historiaMedica || '',
          historiaEscolar: detail.historiaEscolar || '',
          situacionFamiliar: detail.situacionFamiliar || '',
          descripcionAlumno: detail.descripcionAlumno || '',
          contextoFamiliar: detail.contextoFamiliar || '',
          contextoEscolar: detail.contextoEscolar || '',
          contextoSocial: detail.contextoSocial || '',
          desarrolloFisico: detail.desarrolloFisico || '',
          desarrolloCognitivo: detail.desarrolloCognitivo || '',
          desarrolloSocioafectivo: detail.desarrolloSocioafectivo || '',
          evaluacionAprendizajes: detail.evaluacionAprendizajes || '',
          creatividad: detail.creatividad || '',
          interpretacionResultados: detail.interpretacionResultados || '',
          conclusiones: detail.conclusiones || '',
          nombreCompleto: detail.studentName || ''
        };

        this.psicologiaService.getStudents().subscribe(students => {
          const student = students.find(s => s.id === detail.alumnoId);
          if (student) {
            this.form.curp = student.curp || '';
            this.applyStudent(student);
          } else {
            this.selectedStudent = {
              id: detail.alumnoId,
              name: detail.studentName || 'Alumno',
              fatherLastName: '',
              gender: 1 as any,
              birthDate: '',
              status: 1 as any,
              schoolYearId: String(detail.cicloId)
            };
          }
        });

        forkJoin([
          this.psychoService.getBaps(id),
          this.psychoService.getCollaborators(id)
        ]).subscribe({
          next: ([baps, cols]) => {
            this.bapRows = baps.map(b => ({ ...b }));
            this.colaboradorRows = cols.map(c => ({ ...c }));
          }
        });

        // Abrir en el primer paso incompleto.
        for (let step = 1; step <= 5; step++) {
          if (!this.isStepValid(step)) {
            this.currentStep = step;
            return;
          }
        }
        this.currentStep = 5;
      },
      error: () => {
        this.loadingEdit = false;
        this.submitError = 'No se pudo cargar la evaluación.';
      }
    });
  }

  private emptyForm(): WizardForm {
    return {
      curp: '',
      nombreCompleto: '',
      grupoId: '',
      cicloId: '',
      estado: 'BORRADOR',
      areasEvaluar: [],
      instrumentosAplicar: [],
      instrumentosDetalle: '',
      motivoEvaluacion: '',
      conductaEvaluacion: '',
      antecedentesEmbarazo: '',
      antecedentesHeredo: '',
      desarrolloMotor: '',
      desarrolloLenguaje: '',
      historiaMedica: '',
      historiaEscolar: '',
      situacionFamiliar: '',
      descripcionAlumno: '',
      contextoFamiliar: '',
      contextoEscolar: '',
      contextoSocial: '',
      desarrolloFisico: '',
      desarrolloCognitivo: '',
      desarrolloSocioafectivo: '',
      evaluacionAprendizajes: '',
      creatividad: '',
      interpretacionResultados: '',
      conclusiones: ''
    };
  }
}
