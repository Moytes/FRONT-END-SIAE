import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  authService = inject(AuthService);
  router = inject(Router);

  /** Simple email regex validation */
  get isEmailValid(): boolean {
    if (!this.email) return true; // don't show error if empty
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  get isFormValid(): boolean {
    return this.email.length > 0 && this.password.length > 0 && this.isEmailValid;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      // Intentar iniciar sesión real
      const success = await this.authService.login(this.email, this.password);

      // Simular un poco de espera para mostrar la animación
      await new Promise(resolve => setTimeout(resolve, 800));

      if (success) {
        this.router.navigate(['/']); // Navegar al home
      } else {
        this.errorMessage.set('Correo o contraseña incorrectos. Intenta de nuevo.');
      }
    } catch (error) {
      this.errorMessage.set('Ocurrió un error inesperado al iniciar sesión.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
