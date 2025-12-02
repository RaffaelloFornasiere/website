import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GoogleDocsService, DocPage } from '../../services/google-docs.service';

@Component({
  selector: 'app-main',
  standalone: true,
  templateUrl: './main.component.html',
  imports: [
    RouterOutlet,
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  private googleDocsService = inject(GoogleDocsService);
  pages = signal<DocPage[]>([]);

  ngOnInit() {
    this.googleDocsService.getDocumentContent().subscribe(content => {
      if (content && content.pages.length > 1) {
        this.pages.set(content.pages);
      }
    });
  }
}
