import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ParsedSection {
  type: string;
  content: string;
  elements?: ParsedElement[];
}

export interface ParsedElement {
  type: 'text' | 'list' | 'link';
  content: string;
  url?: string;
  items?: string[];
}

export interface DocumentContent {
  title?: ParsedSection;
  subtitle?: ParsedSection;
  aboutMe?: ParsedSection;
  projectDemos?: ParsedSection;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleDocsService {
  private apiUrl = '/api/google-docs';

  constructor(private http: HttpClient) {}

  getDocumentContent(): Observable<DocumentContent> {
    return this.http.get<any>(`${this.apiUrl}/content`).pipe(
      map(response => this.parseDocument(response))
    );
  }

  private parseDocument(docData: any): DocumentContent {
    const sections: DocumentContent = {};
    const body = docData.body?.content || [];

    let currentSection: string | null = null;
    let currentContent: ParsedElement[] = [];
    let currentText = '';

    body.forEach((element: any) => {
      if (element.paragraph) {
        const paragraph = element.paragraph;
        let paragraphText = '';
        const elements: ParsedElement[] = [];

        if (paragraph.elements) {
          paragraph.elements.forEach((elem: any) => {
            if (elem.textRun?.content) {
              const text = elem.textRun.content;
              paragraphText += text;

              if (elem.textRun.textStyle?.link) {
                elements.push({
                  type: 'link',
                  content: text.trim(),
                  url: elem.textRun.textStyle.link.url
                });
              }
            }
          });
        }

        const sectionMatch = paragraphText.match(/\[(TITLE|SUBTITLE|ABOUT ME|PROJECT DEMOS)\]/);

        if (sectionMatch) {
          if (currentSection) {
            this.saveSection(sections, currentSection, currentText, currentContent);
          }
          currentSection = sectionMatch[1];
          currentContent = [];
          currentText = '';
        } else if (currentSection && paragraphText.trim()) {
          if (paragraph.bullet) {
            currentContent.push({
              type: 'list',
              content: paragraphText.trim(),
              items: [paragraphText.trim()]
            });
          } else {
            currentText += paragraphText;
            currentContent.push(...elements);
          }
        }
      }
    });

    if (currentSection) {
      this.saveSection(sections, currentSection, currentText, currentContent);
    }

    return sections;
  }

  private saveSection(
    sections: DocumentContent,
    sectionName: string,
    text: string,
    elements: ParsedElement[]
  ): void {
    const section: ParsedSection = {
      type: sectionName,
      content: text.trim(),
      elements: elements.length > 0 ? elements : undefined
    };

    switch (sectionName) {
      case 'TITLE':
        sections.title = section;
        break;
      case 'SUBTITLE':
        sections.subtitle = section;
        break;
      case 'ABOUT ME':
        sections.aboutMe = section;
        break;
      case 'PROJECT DEMOS':
        sections.projectDemos = section;
        break;
    }
  }
}