import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  SchoolYear,
  StudentListItem,
  TEAIndicatorCatalog,
  TeaScreeningRespuestaInput
} from '../../core/models/api-models';
import { CatalogService } from '../../core/services/catalog.service';
import { PsicologiaService } from '../../core/services/psicologia.service';
import { TeaService } from '../../core/services/tea.service';

interface IndicatorAnswer extends TeaScreeningRespuestaInput {
  observacion: string;
}

@Component({
  selector: 'app-tea-screening-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tea-screening-wizard.html',
  styleUrl: './tea-screening-wizard.css'
})
export class TeaScreeningWizard implements OnInit, OnDestroy {
  private teaService = inject(TeaService);
  private psicologiaService = inject(PsicologiaService);
  private catalogService = inject(CatalogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // La app usa detección de cambios zoneless (provideZonelessChangeDetection): mutar una
  // propiedad normal de clase dentro de un callback async (subscribe/setTimeout) no dispara
  // un re-render — la vista se queda congelada mostrando el estado viejo aunque el dato ya
  // haya llegado. Por eso todo el estado que se toca fuera de un evento propio de Angular
  // (input/click/submit) tiene que ser un signal.
  indicators = signal<TEAIndicatorCatalog[]>([]);
  answers = new Map<number, IndicatorAnswer>();
  schoolYears = signal<SchoolYear[]>([]);
  students = signal<StudentListItem[]>([]);

  curp = signal('');
  cicloId = signal('');
  contextoObs = signal('');
  selectedStudentId = signal('');
  selectedStudent = signal<StudentListItem | null>(null);
  searchingStudent = signal(false);
  studentError = signal('');
  loadingIndicators = signal(true);
  saving = signal(false);
  submitError = signal('');
  private curpTimer?: ReturnType<typeof setTimeout>;

  dominios = computed(() => [...new Set(this.indicators().map(i => i.dominio).filter(Boolean))]);

  ngOnInit(): void {
    this.catalogService.getSchoolYears(true).subscribe(years => {
      this.schoolYears.set(years);
      const active = years.find(y => y.isActive || y.activo) || years[0];
      if (active) this.cicloId.set(active.id);
    });

    this.psicologiaService.getStudents().subscribe(list => {
      this.students.set(list);
      const studentId = this.route.snapshot.queryParamMap.get('studentId');
      if (studentId) {
        const found = list.find(s => s.id === studentId);
        if (found) this.applyStudent(found);
      }
    });

    this.teaService.getIndicators().subscribe({
      next: items => {
        const sorted = [...items].sort((a, b) => a.orden - b.orden || a.id - b.id);
        this.indicators.set(sorted);
        for (const ind of sorted) {
          this.answers.set(ind.id, {
            indicadorId: ind.id,
            frecuencia: 0,
            intensidad: 0,
            observacion: ''
          });
        }
        this.loadingIndicators.set(false);
      },
      error: () => {
        this.loadingIndicators.set(false);
        this.submitError.set('No se pudo cargar el catálogo de indicadores TEA.');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.curpTimer) clearTimeout(this.curpTimer);
  }

  indicatorsForDominio(dominio: string): TEAIndicatorCatalog[] {
    return this.indicators().filter(i => i.dominio === dominio);
  }

  onStudentSelect(studentId: string): void {
    this.selectedStudentId.set(studentId);
    if (!studentId) {
      this.selectedStudent.set(null);
      return;
    }
    const student = this.students().find(s => s.id === studentId);
    if (student) this.applyStudent(student);
  }

  onCurpChange(value: string): void {
    const cleaned = value.toUpperCase().replace(/\s/g, '').slice(0, 18);
    this.curp.set(cleaned);
    this.selectedStudent.set(null);
    this.studentError.set('');
    if (this.curpTimer) clearTimeout(this.curpTimer);
    if (cleaned.length !== 18) return;
    this.curpTimer = setTimeout(() => this.findStudentByCurp(), 350);
  }

  findStudentByCurp(): void {
    const searched = this.curp();
    if (searched.length !== 18) return;
    this.searchingStudent.set(true);
    this.psicologiaService.getStudents(searched).subscribe({
      next: list => {
        if (this.curp() !== searched) return;
        this.searchingStudent.set(false);
        const student = list.find(s => s.curp?.toUpperCase() === searched);
        if (!student) {
          this.studentError.set('No se encontró un alumno con este CURP.');
          return;
        }
        this.applyStudent(student);
      },
      error: () => {
        this.searchingStudent.set(false);
        this.studentError.set('No fue posible consultar el alumno.');
      }
    });
  }

  private applyStudent(student: StudentListItem): void {
    this.selectedStudent.set(student);
    this.selectedStudentId.set(student.id);
    this.curp.set(student.curp || '');
    if (student.schoolYearId) this.cicloId.set(student.schoolYearId);
  }

  answerFor(id: number): IndicatorAnswer {
    return this.answers.get(id)!;
  }

  canSubmit(): boolean {
    return !!this.selectedStudent() && !!this.cicloId() && this.indicators().length > 0 && !this.saving();
  }

  submit(): void {
    const student = this.selectedStudent();
    if (!this.canSubmit() || !student) return;
    this.saving.set(true);
    this.submitError.set('');

    const respuestas = this.indicators().map(ind => {
      const a = this.answerFor(ind.id);
      return {
        indicadorId: ind.id,
        frecuencia: Number(a.frecuencia),
        intensidad: Number(a.intensidad),
        observacion: a.observacion?.trim() || undefined
      };
    });

    this.teaService.createScreening({
      studentId: student.id,
      cicloId: Number(this.cicloId()),
      contextoObs: this.contextoObs().trim() || undefined,
      respuestas
    }).subscribe({
      next: res => {
        this.saving.set(false);
        const level = res.data?.alertLevel || 'registrado';
        alert(`Tamizaje TEA guardado. Nivel de alerta: ${level}`);
        this.router.navigate(['/especialista']);
      },
      error: err => {
        this.saving.set(false);
        this.submitError.set(err.error?.message || 'No se pudo guardar el tamizaje.');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/especialista']);
  }
}
