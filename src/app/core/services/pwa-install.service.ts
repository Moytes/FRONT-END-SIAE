import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class PwaInstallService {
    private deferredPrompt: any = null;

    /** Whether the app can be installed (Android/PC) */
    canInstall = signal(false);

    /** Whether we're on iOS and should show manual instructions */
    isIos = signal(false);

    /** Whether the banner was dismissed by the user */
    dismissed = signal(false);

    constructor() {
        this.checkDismissed();
        this.detectIos();
        this.listenForInstallPrompt();
        this.listenForAppInstalled();
    }

    private checkDismissed(): void {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed === 'true') {
            this.dismissed.set(true);
        }
    }

    private detectIos(): void {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIos = /iphone|ipad|ipod/.test(userAgent);
        const isInStandaloneMode = ('standalone' in (window.navigator as any)) && (window.navigator as any).standalone;

        if (isIos && !isInStandaloneMode) {
            this.isIos.set(true);
        }
    }

    private listenForInstallPrompt(): void {
        window.addEventListener('beforeinstallprompt', (e: Event) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.canInstall.set(true);
        });
    }

    private listenForAppInstalled(): void {
        window.addEventListener('appinstalled', () => {
            this.canInstall.set(false);
            this.deferredPrompt = null;
        });
    }

    async install(): Promise<boolean> {
        if (!this.deferredPrompt) return false;

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            this.deferredPrompt = null;
            this.canInstall.set(false);
            return true;
        }

        return false;
    }

    dismiss(): void {
        this.dismissed.set(true);
        localStorage.setItem('pwa-install-dismissed', 'true');
    }

    /** Should we show any banner at all? */
    get shouldShowBanner(): boolean {
        if (this.dismissed()) return false;
        return this.canInstall() || this.isIos();
    }
}
