import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ActivityConfigService } from '../../core/services/activity-config.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  authService = inject(AuthService);
  activityService = inject(ActivityConfigService);
  router = inject(Router);
  
  get user() {
    return this.authService.currentUser();
  }

  get availableMissions() {
    return this.activityService.activities();
  }

  playMission(id: string) {
    this.router.navigate(['/jugar', id]);
  }
}
