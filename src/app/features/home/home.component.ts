import {HttpClient} from '@angular/common/http';
import {AfterViewInit, Component, effect, ElementRef, inject, NgZone, OnInit, signal, ViewChild} from '@angular/core';
import {GoogleDocsService, DocumentContent, AutoSection} from '../../services/google-docs.service';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,

  templateUrl: './home.component.html',
  imports: [CommonModule],
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild("textContainer") textContainer!: ElementRef<HTMLDivElement>
  private http = inject(HttpClient);
  private googleDocsService = inject(GoogleDocsService);
  private route = inject(ActivatedRoute);
  private ngZone = inject(NgZone);
  displayText = signal('');
  text = signal('');
  documentContent = signal<DocumentContent | null>(null);
  loading = signal(true);
  error = signal<string | null>(null)
  activeTabTitle = signal<string>('');

  viewInitialized = signal(false);

  constructor() {
    effect(() => {
      if (!this.viewInitialized() || !this.text) return;
      let charIterator = this.text()[Symbol.iterator]()
      let initialText = charIterator.next().value ?? '';
      for (let i = 0; i < 1500; i++) {
        initialText += charIterator.next().value ?? '';
      }
      this.displayText.set(initialText);
      let firstTurn = true;
      const interval = setInterval(() => {
        const next = charIterator.next();
        if (next.done) {
          firstTurn = false
          console.log(this.displayText().length)
          charIterator = this.text()[Symbol.iterator]();
          return;
        }
        if (firstTurn)
          this.displayText.set(this.displayText() + next.value);
        else
          this.displayText.set(this.displayText().slice(1) + next.value);
      }, 10);
    });
  }

  skills = [
    {name: "TypeScript", level: 6},
    {name: "Java", level: 6},
    {name: "Python", level: 5},
    {name: "C++", level: 3},
    {name: "Angular", level: 6},
    {name: "Tailwind", level: 7},
    {name: "Docker", level: 3},
    {name: "LLMs", level: 6},
  ]

  learning = [
    {name: "Kubernetes", level: 1},
    {name: "Vue", level: 2},
  ]

  projects = [
    {
      name: "sage-v2",
      label: "Sage V2",
      description: "A proactive AI agent with tool integration, conversation management, and autonomous task handling using Claude",
    },
    {
      name: "llmed",
      label: "Medical Data Extraction with LLMs",
      description: "Thesis project: Extracting medical data from unstructured text using large language models. (the UI is ugly but these were the requirements)",
      link: "https://llmed.rf-98.com"
    },
    {
      name: "prompt-log",
      label: "Prompt Log",
      description: "PromptLog is a tool for managing and keeping track of AI prompts",
      link: "https://prompt-log.rf-98.com"
    },
  ]


  ngOnInit(): void {
    this.http.get('/code.txt', {responseType: 'text'}).subscribe(data => {
      this.text.set(data);
    });

    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTabTitle.set(params['tab']);
      }
    });

    this.fetchGoogleDocContent();
  }

  fetchGoogleDocContent(): void {
    this.googleDocsService.getDocumentContent().subscribe({
      next: (content) => {
        this.documentContent.set(content);
        this.loading.set(false);

        // Set default tab if none selected
        if (!this.activeTabTitle() && content.pages.length > 0) {
          this.activeTabTitle.set(content.pages[0].title);
        }
      },
      error: (err) => {
        console.error('Error fetching Google Doc:', err);
        this.error.set('Failed to load content from Google Docs');
        this.loading.set(false);
      }
    });
  }

  ngAfterViewInit() {
    this.viewInitialized.set(true);
  }

  formatContent(section: any): string {
    let html = section.content;

    // Replace links in the content
    if (section.elements) {
      section.elements.forEach((element: any) => {
        if (element.type === 'link' && element.url) {
          const linkHtml = `<a href="${element.url}" class="font-medium text-slate-300">${element.content}</a>`;
          html = html.replace(element.content, linkHtml);
        }
      });
    }

    // Convert line breaks to <br>
    html = html.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');

    return html;
  }

  formatListItem(content: string, item: any): string {
    let html = content;

    // Find and replace links in the list item
    if (item.links) {
      item.links.forEach((element: any) => {
        if (element.type === 'link' && element.url && content.includes(element.content)) {
          const linkHtml = `<a href="${element.url}" class="font-bold">${element.content}</a>`;
          html = html.replace(element.content, linkHtml);
        }
      });
    } else if (Array.isArray(item)) {
       // Fallback for legacy calls if any (though we updated the template)
       item.forEach((element: any) => {
        if (element.type === 'link' && element.url && content.includes(element.content)) {
          const linkHtml = `<a href="${element.url}" class="font-bold">${element.content}</a>`;
          html = html.replace(element.content, linkHtml);
        }
      });
    }

    // Format the list item: bold title before the dash
    const parts = html.split(' – ');
    if (parts.length > 1 && !html.includes('<a')) {
      html = `<span class="font-bold">${parts[0]}</span> – ${parts.slice(1).join(' – ')}`;
    }

    return html;
  }

  getTitleContent(): string {
    const content = this.documentContent();
    if (!content || content.pages.length === 0) return '';

    // Check for TITLE in the first page (Home) sections
    const homeSections = content.pages[0].sections;
    const titleSection = homeSections.find(s => s.title.toUpperCase() === 'TITLE');
    return titleSection ? titleSection.content : '';
  }

  getSubtitleContent(): string {
    const content = this.documentContent();
    if (!content || content.pages.length === 0) return '';

    // Check for SUBTITLE in the first page (Home) sections
    const homeSections = content.pages[0].sections;
    const subtitleSection = homeSections.find(s => s.title.toUpperCase() === 'SUBTITLE');
    return subtitleSection ? subtitleSection.content : '';
  }

  getContentSections(): AutoSection[] {
    const content = this.documentContent();
    if (!content?.pages) return [];

    // Find active page or default to the first one
    const activePage = content.pages.find(p => p.title === this.activeTabTitle()) || content.pages[0];
    const sections = activePage.sections;

    if (!sections) return [];

    // Filter out TITLE and SUBTITLE as they're displayed in the header
    // Also filter out Technologies sections as requested
    return sections.filter(s => {
      const upperTitle = s.title.toUpperCase();
      return upperTitle !== 'TITLE' &&
             upperTitle !== 'SUBTITLE' &&
             !upperTitle.includes('TECHNOLOGIES');
    });
  }

  formatSectionContent(section: AutoSection): string {
    let html = section.content;

    // Replace links in the content
    if (section.elements) {
      section.elements.forEach((element: any) => {
        if (element.type === 'link' && element.url) {
          const linkHtml = `<a href="${element.url}" class="font-medium text-slate-300">${element.content}</a>`;
          html = html.replace(element.content, linkHtml);
        }
      });
    }

    // Convert line breaks to <br>
    html = html.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');

    return html;
  }

  protected readonly Array = Array;
}
