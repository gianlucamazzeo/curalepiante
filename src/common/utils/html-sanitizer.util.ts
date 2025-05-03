// src/common/utils/html-sanitizer.util.ts
import sanitizeHtml, { IOptions } from 'sanitize-html';

export class HtmlSanitizerUtil {
  static sanitize(html: string): string {
    const options: IOptions = {
      allowedTags: [
        'a',
        'b',
        'i',
        'em',
        'strong',
        'p',
        'br',
        'ul',
        'ol',
        'li',
        'h1',
        'h2',
        'h3',
        'h4',
      ],
      allowedAttributes: {
        a: ['href', 'target', 'rel'],
      },
      transformTags: {
        a: sanitizeHtml.simpleTransform('a', {
          target: '_blank',
          rel: 'noopener noreferrer',
        }),
      },
    };
    return sanitizeHtml(html, options);
  }
}
