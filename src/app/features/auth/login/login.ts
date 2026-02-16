import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
      // TODO: Conectar con el backend ASP.NET
      console.log('Login:', { email: this.email, password: this.password });

      // Simulación de llamada al servidor
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Aquí irá la navegación al dashboard
      console.log('Login exitoso');
    } catch (error) {
      this.errorMessage.set('Credenciales incorrectas. Intenta de nuevo.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
