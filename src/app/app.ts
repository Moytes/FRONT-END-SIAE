import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PwaInstallBanner } from './shared/components/pwa-install-banner/pwa-install-banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PwaInstallBanner],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App { }
