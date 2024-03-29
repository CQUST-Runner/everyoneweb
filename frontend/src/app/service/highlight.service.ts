import { Injectable, Inject } from '@angular/core';

import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import 'prismjs';
import 'prismjs/plugins/line-numbers/prism-line-numbers'
import 'prismjs/components/prism-log'

declare var Prism: any;

@Injectable()
export class HighlightService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  highlightAll() {
    if (isPlatformBrowser(this.platformId)) {
      Prism.highlightAll();
    }
  }

  highlight(text: string, language: string): string {
    return Prism.highlight(text, Prism.languages[language], language);
  }

  highlightElement(element: any) {
    return Prism.highlightElement(element);
  }
}
