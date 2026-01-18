import { Component, Input } from '@angular/core';
import { AutoSection, ParsedElement } from '../../services/google-docs.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generic-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generic-page.component.html',
  styleUrl: './generic-page.component.scss'
})
export class GenericPageComponent {
  @Input() sections: AutoSection[] = [];

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

  getListItems(section: AutoSection): ParsedElement[] {
    return (section.elements || []).filter(
      (element: ParsedElement) => element.type === 'list' && (element.nestingLevel ?? 0) === 0
    );
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
    }

    // Format the list item: bold title before the dash
    const parts = html.split(' – ');
    if (parts.length > 1 && !html.includes('<a')) {
      html = `<span class="font-bold">${parts[0]}</span> – ${parts.slice(1).join(' – ')}`;
    }

    return html;
  }
}
