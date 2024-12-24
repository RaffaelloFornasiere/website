import { ApplicationConfig, LOCALE_ID, importProvidersFrom, inject } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import {
  Router,
  RouterFeatures,
  provideRouter,
  withComponentInputBinding,
  withNavigationErrorHandler,
  NavigationError,
} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import appRoutes from './app.routes';

const routerFeatures: Array<RouterFeatures> = [
  withComponentInputBinding(),
  withNavigationErrorHandler((e: NavigationError) => {
    const router = inject(Router);
    if (e.error.status === 403) {
      router.navigate(['/accessdenied']);
    } else if (e.error.status === 404) {
      router.navigate(['/404']);
    } else if (e.error.status === 401) {
      router.navigate(['/login']);
    } else {
      router.navigate(['/error']);
    }
  }),
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, ...routerFeatures),
    importProvidersFrom(BrowserModule),
    // Set this to true to enable service worker (PWA)
    provideHttpClient(),
    Title,
    { provide: LOCALE_ID, useValue: 'it' },
    // jhipster-needle-angular-add-module JHipster will add new module here
  ],
};
