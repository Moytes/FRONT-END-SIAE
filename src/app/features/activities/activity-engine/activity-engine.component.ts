import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityConfigService, ActivityConfig } from '../../../core/services/activity-config.service';

import { FlashcardRenderer } from '../flashcard-renderer/flashcard-renderer';
import { ChecklistRenderer } from '../checklist-renderer/checklist-renderer';
import { AianalysisRenderer } from '../aianalysis-renderer/aianalysis-renderer';
import { ActionPlanRenderer } from '../action-plan-renderer/action-plan-renderer';
import { StepByStepRenderer } from '../step-by-step-renderer/step-by-step-renderer';
import { FonemaRendererComponent } from '../fonema-renderer/fonema-renderer';
import { ParesRendererComponent } from '../pares-renderer/pares-renderer';
import { PragmaticaRendererComponent } from '../pragmatica-renderer/pragmatica-renderer';

@Component({
  selector: 'app-activity-engine',
  standalone: true,
  imports: [
    CommonModule,
    FonemaRendererComponent,
    ParesRendererComponent,
    PragmaticaRendererComponent,
    FlashcardRenderer,
    ChecklistRenderer,
    AianalysisRenderer,
    ActionPlanRenderer,
    StepByStepRenderer
  ],
  template: `
    <div class="engine-wrapper" *ngIf="loadedConfig()">
      <!-- Header general o barra de progreso opcional podría ir aquí -->

      <!-- Switch dinámico de Renderers dependiente del JSON (activityType) -->
      <ng-container [ngSwitch]="getRendererType(loadedConfig()!.activityType)">

        <app-fonema-renderer
           *ngSwitchCase="'FONEMA'"
           [config]="loadedConfig()!.config"
           (resultSaved)="handleSave($event)">
        </app-fonema-renderer>

        <app-pares-renderer
           *ngSwitchCase="'PARES'"
           [config]="loadedConfig()!.config"
           (resultSaved)="handleSave($event)">
        </app-pares-renderer>

        <app-pragmatica-renderer
           *ngSwitchCase="'PRAGMATICA'"
           [config]="loadedConfig()!.config"
           (resultSaved)="handleSave($event)">
        </app-pragmatica-renderer>

        <app-flashcard-renderer
           *ngSwitchCase="'FLASHCARD'"
           [config]="loadedConfig()!.config"
           (resultSaved)="handleSave($event)">
        </app-flashcard-renderer>

        <app-checklist-renderer 
           *ngSwitchCase="'CHECKLIST'" 
           [config]="loadedConfig()!.config"
           (resultSaved)="handleSave($event)">
        </app-checklist-renderer>

        <app-aianalysis-renderer 
           *ngSwitchCase="'IA'" 
           [config]="loadedConfig()!.config"
           (resultSaved)="handleSave($event)">
        </app-aianalysis-renderer>

        <app-action-plan-renderer 
           *ngSwitchCase="'ACTION_PLAN'" 
           [config]="loadedConfig()!.config"
           (resultSaved)="handleSave($event)">
        </app-action-plan-renderer>

        <app-step-by-step-renderer 
           *ngSwitchCase="'STEP'" 
           [config]="loadedConfig()!.config"
           (resultSaved)="handleSave($event)">
        </app-step-by-step-renderer>

        <div *ngSwitchDefault class="error-state">
           <p>Error: Tipo de actividad ({{ loadedConfig()!.activityType }}) no soportada por el motor actual.</p>
        </div>

      </ng-container>
    </div>
    
    <div *ngIf="!loadedConfig() && !loading()" class="empty-state">
       <h2>⚠️ Configuración No Encontrada</h2>
       <p>La actividad solicitada no existe o no tienes permisos para acceder a ella.</p>
       <button (click)="router.navigate(['/'])">Regresar al Inicio</button>
    </div>
  `,
  styles: [`
    .engine-wrapper {
       animation: fadeIn 0.4s ease;
    }
    .empty-state, .error-state {
       background: #fef2f2;
       border: 1px solid #fecaca;
       padding: 3rem;
       border-radius: 12px;
       text-align: center;
       color: #ef4444;
       margin: 2rem auto;
       max-width: 600px;
    }
    .empty-state h2 { color: #b91c1c; margin-top: 0; }
    .empty-state p { color: #991b1b; margin-bottom: 1.5rem; }
    .empty-state button {
       background: #b91c1c; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ActivityEngineComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  configService = inject(ActivityConfigService);

  loadedConfig = signal<ActivityConfig | null>(null);
  loading = signal(true);

  ngOnInit() {
     this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
           const conf = this.configService.getActivity(id);
           this.loadedConfig.set(conf || null);
        }
        this.loading.set(false);
     });
  }

  getRendererType(activityType: number): string {
     // FonemaRenderer Act. 1
     if (activityType === 1) return 'FONEMA';
     // ParesRenderer Act. 2
     if (activityType === 2) return 'PARES';
     // FlashcardRenderer Act. 4, 7, 8
     if ([4, 7, 8].includes(activityType)) return 'FLASHCARD';
     // PragmaticaRenderer Act. 3
     if (activityType === 3) return 'PRAGMATICA';
     // ChecklistRenderer Act. 9, 10
     if ([9, 10].includes(activityType)) return 'CHECKLIST';
     // IARenderer Act. 5
     if (activityType === 5) return 'IA';
     // ActionPlanRenderer Act. 6
     if (activityType === 6) return 'ACTION_PLAN';
     // StepRenderer Act. 11
     if (activityType === 11) return 'STEP';
     
     return 'UNKNOWN';
  }

  handleSave(result: any) {
    console.log('Evaluación guardada exitosamente en el Engine', result);
    alert('¡Resultados guardados correctamente!');
    // Volver al Home del maestro
    this.router.navigate(['/']); 
  }
}
