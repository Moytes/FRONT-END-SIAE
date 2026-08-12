import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/services/catalog.service';
import { School, Group, SchoolYear, SchoolZone, EnumOption, AddSchoolRequest } from '../../core/models/api-models';

@Component({
  selector: 'app-gestion-escuelas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './gestion-escuelas.html',
  styleUrl: './gestion-escuelas.css'
})
export class GestionEscuelas implements OnInit {
  private catalogService = inject(CatalogService);

  schools = signal<School[]>([]);
  groups = signal<Group[]>([]);
  schoolYears = signal<SchoolYear[]>([]);
  zones = signal<SchoolZone[]>([]);
  educationLevels = signal<EnumOption[]>([]);
  loading = signal(false);
  showModal = signal<string>('none');

  // Form Models
  schoolForm: AddSchoolRequest = this.emptySchoolForm();
  yearForm = { name: '', startDate: '', endDate: '', isActive: true };

  ngOnInit() {
    this.loadData();
    this.loadCatalogs();
  }

  private emptySchoolForm(): AddSchoolRequest {
    return { name: '', cct: '', turn: 1, educationLevelId: 0, schoolZoneId: '' };
  }

  loadData() {
    this.loading.set(true);
    
    this.catalogService.getSchools().subscribe(allSchools => {
      this.schools.set(allSchools);
    });

    this.catalogService.getGroups().subscribe(allGroups => {
      this.groups.set(allGroups);
      this.loading.set(false);
    });
  }

  loadCatalogs() {
    this.catalogService.getSchoolYears().subscribe(res => this.schoolYears.set(res));
    this.catalogService.getSchoolZones().subscribe(res => this.zones.set(res));
    this.catalogService.getEducationLevels().subscribe(res => {
      this.educationLevels.set(res);
      this.schoolForm.educationLevelId = res[0]?.key || 0;
    });
  }

  getGroupsForSchool(schoolId: string): Group[] {
    return this.groups().filter(g => g.schoolId === schoolId);
  }

  openModal(type: string) {
    this.showModal.set(type);
  }

  closeModal() {
    this.showModal.set('none');
    this.resetForms();
  }

  resetForms() {
    this.schoolForm = this.emptySchoolForm();
    this.schoolForm.educationLevelId = this.educationLevels()[0]?.key || 0;
    this.yearForm = { name: '', startDate: '', endDate: '', isActive: true };
  }

  createSchool() {
    if (!this.schoolForm.name || !this.schoolForm.cct || !this.schoolForm.schoolZoneId || !this.schoolForm.educationLevelId) {
      alert('Complete nombre, CCT, zona escolar y nivel educativo.');
      return;
    }

    const payload = {
      ...this.schoolForm,
      turn: Number(this.schoolForm.turn),
      educationLevelId: Number(this.schoolForm.educationLevelId),
      schoolZoneId: Number(this.schoolForm.schoolZoneId)
    };

    this.catalogService.createSchool(payload).subscribe({
      next: () => {
        this.loadData();
        this.closeModal();
      },
      error: (err) => alert(err.error?.message || 'Error al crear escuela')
    });
  }

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
}
