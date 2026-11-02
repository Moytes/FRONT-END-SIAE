import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit, OnDestroy {
  email = '';
  password = '';
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  // Recuperación de contraseña (RQF04): login → solicitar código → verificar → nueva contraseña → listo
  view = signal<'login' | 'request' | 'verify' | 'reset' | 'done'>('login');
  resetCode = '';
  newPassword = '';
  confirmPassword = '';
  infoMessage = signal('');
  /** Segundos restantes del código; solo informativo, el backend es quien valida la expiración. */
  secondsLeft = signal(0);
  private countdownId: ReturnType<typeof setInterval> | null = null;

  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.authService.getDefaultRoute()]);
    }
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }

  /** Simple email regex validation */
  get isEmailValid(): boolean {
    if (!this.email) return true; // don't show error if empty
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  get isCodeValid(): boolean {
    return /^\d{6}$/.test(this.resetCode);
  }

  get passwordsMatch(): boolean {
    return this.newPassword === this.confirmPassword;
  }

  get isNewPasswordValid(): boolean {
    return this.newPassword.length >= 8 && this.passwordsMatch;
  }

  get countdownLabel(): string {
    const s = this.secondsLeft();
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  goTo(view: 'login' | 'request' | 'verify' | 'reset' | 'done', event?: Event): void {
    event?.preventDefault();
    this.errorMessage.set('');
    if (view === 'login' || view === 'request') {
      this.infoMessage.set('');
      this.resetCode = '';
      this.stopCountdown();
    }
    if (view !== 'reset') {
      this.newPassword = '';
      this.confirmPassword = '';
    }
    this.view.set(view);
  }

  async onRequestCode(): Promise<void> {
    if (!this.email || !this.isEmailValid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    const result = await this.authService.requestPasswordReset(this.email.trim());
    this.isLoading.set(false);

    if (!result.ok) {
      this.errorMessage.set(result.error ?? 'No se pudo solicitar el código.');
      return;
    }

    this.infoMessage.set('Si el correo está registrado, recibirás un código de 6 dígitos. Revisa también tu carpeta de spam.');
    this.resetCode = '';
    this.startCountdown((result.expiresInMinutes ?? 10) * 60);
    this.view.set('verify');
  }

  async onVerifyCode(): Promise<void> {
    if (!this.isCodeValid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    const result = await this.authService.verifyResetCode(this.email.trim(), this.resetCode);
    this.isLoading.set(false);

    if (!result.ok) {
      this.errorMessage.set(result.error ?? 'El código no es válido.');
      return;
    }
    this.goTo('reset');
  }

  async onResetPassword(): Promise<void> {
    if (!this.isNewPasswordValid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    const result = await this.authService.resetPassword(this.email.trim(), this.resetCode, this.newPassword);
    this.isLoading.set(false);

    if (!result.ok) {
      this.errorMessage.set(result.error ?? 'No se pudo restablecer la contraseña.');
      return;
    }

    this.stopCountdown();
    this.password = '';
    this.goTo('done');
  }

  private startCountdown(seconds: number): void {
    this.stopCountdown();
    this.secondsLeft.set(seconds);
    this.countdownId = setInterval(() => {
      const next = this.secondsLeft() - 1;
      this.secondsLeft.set(Math.max(0, next));
      if (next <= 0) this.stopCountdown();
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.countdownId) {
      clearInterval(this.countdownId);
      this.countdownId = null;
    }
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
        const defaultRoute = this.authService.getDefaultRoute();
        this.router.navigate([defaultRoute]);
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
