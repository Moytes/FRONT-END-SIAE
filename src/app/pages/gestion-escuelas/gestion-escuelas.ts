import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/services/catalog.service';
import { AuthService } from '../../services/auth.service';
import { School, Group, UserRole, SchoolYear } from '../../core/models/api-models';

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

  readonly UserRole = UserRole;

  ngOnInit() {
    this.loadData();
    this.loadCatalogs();
  }

  loadData() {
    this.loading.set(true);
    
    // Load both and then filter
    this.catalogService.getSchools().subscribe(allSchools => {
      const user = this.authService.currentUser();
      
      if (user && user.role === UserRole.TRABAJO_SOCIAL && user.schoolIds) {
        const mySchoolIds = new Set(user.schoolIds);
        this.schools.set(allSchools.filter(s => mySchoolIds.has(s.id)));
      } else {
        this.schools.set(allSchools);
      }
    });

    this.catalogService.getGroups().subscribe(allGroups => {
      const user = this.authService.currentUser();

      if (user && user.role === UserRole.TRABAJO_SOCIAL && user.schoolIds) {
        const mySchoolIds = new Set(user.schoolIds);
        this.groups.set(allGroups.filter(g => mySchoolIds.has(g.schoolId)));
      } else {
        this.groups.set(allGroups);
      }
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
