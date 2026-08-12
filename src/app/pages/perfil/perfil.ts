import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  authService = inject(AuthService);

  get user() {
    return this.authService.currentUser();
  }

  // --- Edición de datos personales ---
  editing = signal(false);
  savingProfile = signal(false);
  profileError = signal<string | null>(null);
  profileSuccess = signal<string | null>(null);

  editName = '';
  editFatherLastName = '';
  editMotherLastName = '';
  editPhone = '';
  editAvatarUrl = '';

  startEditing() {
    const u = this.user;
    if (!u) return;
    this.editName = u.name;
    this.editFatherLastName = u.fatherLastName;
    this.editMotherLastName = u.motherLastName ?? '';
    this.editPhone = u.phoneNumber ?? '';
    this.editAvatarUrl = u.avatarUrl ?? '';
    this.profileError.set(null);
    this.profileSuccess.set(null);
    this.editing.set(true);
  }

  cancelEditing() {
    this.editing.set(false);
    this.profileError.set(null);
  }

  async saveProfile() {
    if (!this.editName.trim() || !this.editFatherLastName.trim()) {
      this.profileError.set('Nombre y apellido paterno son obligatorios.');
      return;
    }
    this.savingProfile.set(true);
    this.profileError.set(null);
    this.profileSuccess.set(null);
    const result = await this.authService.updateMyProfile({
      name: this.editName.trim(),
      fatherLastName: this.editFatherLastName.trim(),
      motherLastName: this.editMotherLastName.trim() || undefined,
      phone: this.editPhone.trim() || undefined,
      avatarUrl: this.editAvatarUrl.trim() || undefined,
    });
    this.savingProfile.set(false);
    if (result.ok) {
      this.editing.set(false);
      this.profileSuccess.set('Perfil actualizado correctamente.');
    } else {
      this.profileError.set(result.error ?? 'No se pudo actualizar el perfil.');
    }
  }

  // --- Cambio de contraseña ---
  changingPassword = signal(false);
  savingPassword = signal(false);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<string | null>(null);

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  startChangingPassword() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError.set(null);
    this.passwordSuccess.set(null);
    this.changingPassword.set(true);
  }

  cancelChangingPassword() {
    this.changingPassword.set(false);
    this.passwordError.set(null);
  }

  async savePassword() {
    if (!this.currentPassword || !this.newPassword) {
      this.passwordError.set('Completa ambos campos de contraseña.');
      return;
    }
    if (this.newPassword.length < 8) {
      this.passwordError.set('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('La confirmación no coincide con la nueva contraseña.');
      return;
    }
    this.savingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(null);
    const result = await this.authService.changeMyPassword(this.currentPassword, this.newPassword);
    this.savingPassword.set(false);
    if (result.ok) {
      this.changingPassword.set(false);
      this.passwordSuccess.set('Contraseña actualizada correctamente.');
    } else {
      this.passwordError.set(result.error ?? 'No se pudo cambiar la contraseña.');
    }
  }
}
