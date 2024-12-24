import { Component } from '@angular/core';
import {MainComponent} from './layouts/main/main.component';

@Component({
  selector: 'app-root',
  template: '<app-main></app-main>',
  standalone: true,
  imports: [
    MainComponent
  ],
})
export class AppComponent {
  title = 'website';
}
