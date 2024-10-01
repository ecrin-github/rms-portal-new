import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import * as $ from 'jquery';

if (environment.production) {
  enableProdMode();

  const matomoIcon = document.getElementById('matomo-opt-out-icon');
  matomoIcon.addEventListener("click", (e) => {
    $("#matomo-wrapper").fadeToggle(100);
  });

  const matomoClose = document.getElementById('matomo-close');
  matomoClose.addEventListener("click", (e) => {
    $("#matomo-wrapper").fadeToggle(100);
  });
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));