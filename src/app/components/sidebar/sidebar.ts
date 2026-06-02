import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  authService = inject(AuthService);
  router = inject(Router);
  isCollapsed = false;
  isMobileOpen = false;
  showLogoutModal = false;

  get currentUser() {
    return this.authService.currentUser();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleMobile() {
    this.isMobileOpen = !this.isMobileOpen;
  }

  closeMobile() {
    this.isMobileOpen = false;
  }

  confirmLogout() {
    this.showLogoutModal = true;
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }

  async executeLogout() {
    this.showLogoutModal = false;
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
