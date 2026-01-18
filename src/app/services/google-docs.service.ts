import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

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
  links?: ParsedElement[];
  nestingLevel?: number;
  children?: ParsedElement[];
}

export interface AutoSection {
  title: string;
  content: string;
  elements: ParsedElement[];
  isList?: boolean;
}

export interface DocPage {
  id: string;
  title: string;
  sections: AutoSection[];
}

export interface DocumentContent {
  pages: DocPage[];
}

@Injectable({
  providedIn: 'root'
})
export class GoogleDocsService {
  private apiUrl = '/api/google-docs';
  private content$: Observable<DocumentContent> | null = null;

  constructor(private http: HttpClient) {}

  getDocumentContent(): Observable<DocumentContent> {
    if (!this.content$) {
      this.content$ = this.http.get<any>(`${this.apiUrl}/content`).pipe(
        map(response => this.parseDocument(response)),
        shareReplay(1)
      );
    }
    return this.content$;
  }

  private parseDocument(docData: any): DocumentContent {
    let pages: DocPage[] = [];

    // Check for new "Tabs" feature
    if (docData.tabs && docData.tabs.length > 0) {
      pages = docData.tabs.map((tab: any) => {
        const content = tab.documentTab?.body?.content || [];
        const parsed = this.parseBodyContent(content);
        
        return {
          id: tab.tabProperties?.tabId || 'unknown',
          title: tab.tabProperties?.title || 'Untitled',
          sections: parsed.sections
        };
      });
    } else {
      // Fallback to single-doc structure as one page
      const content = docData.body?.content || [];
      const parsed = this.parseBodyContent(content);
      
      pages.push({
        id: 'main',
        title: 'Home',
        sections: parsed.sections
      });
    }

    return { pages };
  }

  private parseBodyContent(body: any[]): { sections: AutoSection[] } {
    const autoSections: AutoSection[] = [];

    let currentSection: AutoSection | null = null;
    let currentText = '';
    let currentElements: ParsedElement[] = [];
    let isList = false;
    let listStack: ParsedElement[] = [];

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
          listStack = [];
        } else if (trimmedText) {
          // Add content to current section
          if (paragraph.bullet) {
            isList = true;
            const nestingLevel = paragraph.bullet.nestingLevel ?? 0;
            const listItem: ParsedElement = {
              type: 'list',
              content: trimmedText,
              items: [trimmedText],
              links: elements, // Attach detected links to the list item
              nestingLevel,
              children: []
            };
            if (nestingLevel === 0) {
              currentElements.push(listItem);
              listStack = [listItem];
            } else {
              if (listStack.length > nestingLevel) {
                listStack = listStack.slice(0, nestingLevel);
              }
              const parent = listStack[nestingLevel - 1];
              if (parent) {
                parent.children = parent.children || [];
                parent.children.push(listItem);
              } else {
                currentElements.push(listItem);
              }
              listStack[nestingLevel] = listItem;
              listStack.length = nestingLevel + 1;
            }
            // For lists, append with newline for proper formatting
            currentText += (currentText ? '\n' : '') + '• ' + trimmedText;
          } else if (currentSection) {
            currentText += (currentText ? '\n\n' : '') + trimmedText;
            currentElements.push(...elements);
            listStack = [];
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
    }
    
    return { sections: autoSections };
  }
}
