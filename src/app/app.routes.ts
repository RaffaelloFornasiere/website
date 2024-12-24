import {Routes} from "@angular/router";

const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  }
]

export default appRoutes;
