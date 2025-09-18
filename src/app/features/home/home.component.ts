import {HttpClient} from '@angular/common/http';
import {AfterViewInit, Component, effect, ElementRef, inject, NgZone, OnInit, signal, ViewChild} from '@angular/core';
import {GoogleDocsService, DocumentContent} from '../../services/google-docs.service';
import {CommonModule} from '@angular/common';

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
  private ngZone = inject(NgZone);
  displayText = signal('');
  text = signal('');
  documentContent = signal<DocumentContent | null>(null);
  loading = signal(true);
  error = signal<string | null>(null)

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

    this.fetchGoogleDocContent();
  }

  fetchGoogleDocContent(): void {
    this.googleDocsService.getDocumentContent().subscribe({
      next: (content) => {
        this.documentContent.set(content);
        this.loading.set(false);

        // Update projects from Google Doc if available
        if (content.projectDemos?.elements) {
          const projects = content.projectDemos.elements
            .filter(el => el.type === 'list')
            .map(el => {
              const parts = el.content.split(' – ');
              const titleParts = parts[0]?.match(/(.*?)\s*(?:\((.*?)\))?$/);
              return {
                name: titleParts?.[1]?.toLowerCase().replace(/\s+/g, '-') || '',
                label: titleParts?.[1] || parts[0] || '',
                description: parts[1] || '',
                link: content.projectDemos?.elements?.find(link =>
                  link.type === 'link' && el.content.includes(link.content)
                )?.url
              };
            });
          this.projects = projects;
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

  formatListItem(content: string, elements: any[]): string {
    let html = content;

    // Find and replace links in the list item
    elements.forEach((element: any) => {
      if (element.type === 'link' && element.url && content.includes(element.content)) {
        const linkHtml = `<a href="${element.url}" class="font-bold">${element.content}</a>`;
        html = html.replace(element.content, linkHtml);
      }
    });

    // Format the list item: bold title before the dash
    const parts = html.split(' – ');
    if (parts.length > 1 && !html.includes('<a')) {
      html = `<span class="font-bold">${parts[0]}</span> – ${parts.slice(1).join(' – ')}`;
    }

    return html;
  }

  protected readonly Array = Array;
}
