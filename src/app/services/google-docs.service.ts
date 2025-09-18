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

export interface AutoSection {
  title: string;
  content: string;
  elements: ParsedElement[];
  isList?: boolean;
}

export interface DocumentContent {
  sections: AutoSection[];
  // Legacy interface for backward compatibility
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
    const autoSections: AutoSection[] = [];
    const legacySections: DocumentContent = { sections: [] };
    const body = docData.body?.content || [];

    let currentSection: AutoSection | null = null;
    let currentText = '';
    let currentElements: ParsedElement[] = [];
    let isList = false;

    body.forEach((element: any) => {
      if (element.paragraph) {
        const paragraph = element.paragraph;
        let paragraphText = '';
        const elements: ParsedElement[] = [];

        // Extract text and links from paragraph
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

        const trimmedText = paragraphText.trim();

        // Check if this is a section header (bracketed or could be detected by style in future)
        const sectionMatch = trimmedText.match(/^\[(.+)\]$/);
        const isSectionHeader = sectionMatch ||
          (paragraph.paragraphStyle?.namedStyleType?.includes('HEADING')) ||
          (paragraph.elements?.[0]?.textRun?.textStyle?.bold && trimmedText.length < 50);

        if (sectionMatch || isSectionHeader) {
          // Save previous section if exists
          if (currentSection) {
            currentSection.content = currentText.trim();
            currentSection.elements = currentElements;
            currentSection.isList = isList;
            autoSections.push(currentSection);

            // Also save to legacy format for backward compatibility
            this.saveLegacySection(legacySections, currentSection.title, currentText, currentElements);
          }

          // Start new section
          const sectionTitle = sectionMatch ? sectionMatch[1] : trimmedText;
          currentSection = {
            title: sectionTitle,
            content: '',
            elements: []
          };
          currentText = '';
          currentElements = [];
          isList = false;
        } else if (trimmedText) {
          // Add content to current section
          if (paragraph.bullet) {
            isList = true;
            currentElements.push({
              type: 'list',
              content: trimmedText,
              items: [trimmedText]
            });
            // For lists, append with newline for proper formatting
            currentText += (currentText ? '\n' : '') + '• ' + trimmedText;
          } else if (currentSection || autoSections.length === 0) {
            // Regular paragraph - add to current section or create default if none exists
            if (!currentSection && autoSections.length === 0) {
              // Create a default section for content before first header
              currentSection = {
                title: 'Introduction',
                content: '',
                elements: []
              };
            }
            if (currentSection) {
              currentText += (currentText ? '\n\n' : '') + trimmedText;
              currentElements.push(...elements);
            }
          }
        }
      }
    });

    // Save last section if exists
    if (currentSection) {
      (currentSection as AutoSection).content = currentText.trim();
      (currentSection as AutoSection).elements = currentElements;
      (currentSection as AutoSection).isList = isList;
      autoSections.push(currentSection as AutoSection);
      this.saveLegacySection(legacySections, (currentSection as AutoSection).title, currentText, currentElements);
    }

    // Return both new auto-detected sections and legacy format
    legacySections.sections = autoSections;
    return legacySections;
  }

  private saveLegacySection(
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

    // Map to legacy fields for backward compatibility
    switch (sectionName.toUpperCase()) {
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