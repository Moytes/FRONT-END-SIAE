import { Component, inject } from '@angular/core';
import { PwaInstallService } from '../../../core/services/pwa-install.service';

@Component({
    selector: 'app-pwa-install-banner',
    standalone: true,
    templateUrl: './pwa-install-banner.html',
    styleUrl: './pwa-install-banner.css',
})
export class PwaInstallBanner {
    pwa = inject(PwaInstallService);

    async onInstall(): Promise<void> {
        await this.pwa.install();
    }

    onDismiss(): void {
        this.pwa.dismiss();
    }
}
