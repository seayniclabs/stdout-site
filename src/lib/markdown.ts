import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

marked.setOptions({ gfm: true, breaks: true });

// Create DOMPurify instance for server-side use
const window = new JSDOM('').window;
const purify = DOMPurify(window as unknown as Window);

export function renderMarkdown(content: string): string {
  const rawHtml = marked.parse(content) as string;
  return purify.sanitize(rawHtml);
}
