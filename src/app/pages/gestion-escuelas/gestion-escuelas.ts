import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/services/catalog.service';
import { AuthService } from '../../services/auth.service';
import { School, Group, SchoolYear } from '../../core/models/api-models';

@Component({
  selector: 'app-gestion-escuelas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './gestion-escuelas.html',
  styleUrl: './gestion-escuelas.css'
})
export class GestionEscuelas implements OnInit {
  private catalogService = inject(CatalogService);
  private authService = inject(AuthService);

  schools = signal<School[]>([]);
  groups = signal<Group[]>([]);
  schoolYears = signal<SchoolYear[]>([]);
  loading = signal(false);
  showModal = signal<string>('none');

  // Form Models
  schoolForm = { name: '', cct: '', schoolZoneId: '' };
  yearForm = { name: '', startDate: '', endDate: '', isActive: true };

  ngOnInit() {
    this.loadData();
    this.loadCatalogs();
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
    this.schoolForm = { name: '', cct: '', schoolZoneId: '' };
    this.yearForm = { name: '', startDate: '', endDate: '', isActive: true };
  }

  createSchool() {
    const user = this.authService.currentUser();
    if (!this.schoolForm.name || !this.schoolForm.cct || !user?.schoolZoneId) return;

    const payload = { ...this.schoolForm, schoolZoneId: user.schoolZoneId };

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
