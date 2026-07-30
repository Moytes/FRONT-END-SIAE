import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/services/catalog.service';
import {
  AddSchoolRequest,
  AddSchoolZoneRequest,
  EnumOption,
  School,
  SchoolZone
} from '../../core/models/api-models';

type AdminTab = 'zones' | 'schools';
type ModalType = 'none' | 'zone' | 'school';
type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  type: ToastType;
  title: string;
  message: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  private catalogService = inject(CatalogService);

  activeTab = signal<AdminTab>('zones');
  showModal = signal<ModalType>('none');
  loading = signal(false);
  toast = signal<ToastMessage | null>(null);

  zones = signal<SchoolZone[]>([]);
  schools = signal<School[]>([]);
  educationLevels = signal<EnumOption[]>([]);

  zoneForm: AddSchoolZoneRequest = this.emptyZoneForm();
  schoolForm: AddSchoolRequest = this.emptySchoolForm();

  ngOnInit() {
    this.loadCatalogs();
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.catalogService.getSchoolZones().subscribe({
      next: zones => this.zones.set(zones),
      error: () => this.notify('error', 'Zonas no disponibles', 'No se pudieron cargar las zonas escolares.')
    });

    this.catalogService.getSchools().subscribe({
      next: schools => this.schools.set(schools),
      error: () => this.notify('error', 'Escuelas no disponibles', 'No se pudieron cargar las escuelas registradas.'),
      complete: () => this.loading.set(false)
    });
  }

  loadCatalogs() {
    this.catalogService.getEducationLevels().subscribe({
      next: levels => {
        this.educationLevels.set(levels);
        this.schoolForm.educationLevelId = levels[0]?.key || 0;
      },
      error: () => this.notify('error', 'Catalogo no disponible', 'No se pudieron cargar los niveles educativos.')
    });
  }

  setTab(tab: AdminTab) {
    this.activeTab.set(tab);
  }

  openModal(type: ModalType) {
    this.showModal.set(type);
  }

  closeModal() {
    this.showModal.set('none');
    this.zoneForm = this.emptyZoneForm();
    this.schoolForm = this.emptySchoolForm();
    this.schoolForm.educationLevelId = this.educationLevels()[0]?.key || 0;
  }

  createZone() {
    if (!this.zoneForm.number || !this.zoneForm.cct) {
      this.notify('info', 'Datos incompletos', 'Ingrese el numero de zona y la clave CCT.');
      return;
    }

    this.catalogService.createSchoolZone(this.zoneForm).subscribe({
      next: () => {
        this.loadData();
        this.closeModal();
        this.notify('success', 'Zona registrada', 'La nueva zona escolar ya aparece en el panel.');
      },
      error: err => this.notify('error', 'No se pudo registrar', this.getErrorMessage(err, 'Revise que la CCT no este duplicada.'))
    });
  }

  createSchool() {
    if (!this.schoolForm.name || !this.schoolForm.cct || !this.schoolForm.schoolZoneId || !this.schoolForm.educationLevelId) {
      this.notify('info', 'Datos incompletos', 'Complete nombre, CCT, zona escolar y nivel educativo.');
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
        this.notify('success', 'Escuela registrada', 'La escuela quedo vinculada a su zona escolar.');
      },
      error: err => this.notify('error', 'No se pudo registrar', this.getErrorMessage(err, 'Revise los datos capturados.'))
    });
  }

  dismissToast() {
    this.toast.set(null);
  }

  getTabDescription(): string {
    switch (this.activeTab()) {
      case 'zones':
        return 'Zonas escolares disponibles para organizar escuelas.';
      case 'schools':
        return 'Escuelas registradas y vinculadas a una zona.';
    }
  }

  private notify(type: ToastType, title: string, message: string) {
    this.toast.set({ type, title, message });
    window.setTimeout(() => {
      if (this.toast()?.title === title) {
        this.toast.set(null);
      }
    }, 4200);
  }

  private getErrorMessage(err: any, fallback: string): string {
    return err?.error?.data || err?.error?.message || err?.error || fallback;
  }

  private emptyZoneForm(): AddSchoolZoneRequest {
    return { number: '', cct: '', name: '', description: '' };
  }

  private emptySchoolForm(): AddSchoolRequest {
    return { name: '', cct: '', turn: 1, educationLevelId: 0, schoolZoneId: '' };
  }
}
