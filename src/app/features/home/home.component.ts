import {HttpClient} from '@angular/common/http';
import {AfterViewInit, Component, effect, ElementRef, inject, NgZone, OnInit, signal, ViewChild} from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,

  templateUrl: './home.component.html',
  imports: [],
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild("textContainer") textContainer!: ElementRef<HTMLDivElement>
  private http = inject(HttpClient);
  private ngZone = inject(NgZone);
  displayText = signal('');
  text = signal('')

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
  }

  ngAfterViewInit() {
    this.viewInitialized.set(true);
  }

  protected readonly Array = Array;
}
