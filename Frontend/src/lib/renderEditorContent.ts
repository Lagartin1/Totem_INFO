import type { OutputData } from '@editorjs/editorjs';

// Convierte la estructura de bloques de EditorJS (OutputData) a HTML simple.
export function blocksToHtml(data: OutputData | undefined | null): string {
  if (!data || !Array.isArray((data as any).blocks)) return '';

  const escapeHtml = (str: string) =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const safeTextFromData = (d: any): string => {
    if (!d) return '';
    if (typeof d === 'string') return escapeHtml(d);
    if (typeof d === 'number' || typeof d === 'boolean') return String(d);
    if (typeof d.text === 'string') return escapeHtml(d.text);
    if (typeof d.content === 'string') return escapeHtml(d.content);
    if (typeof d.caption === 'string') return escapeHtml(d.caption);
    if (Array.isArray(d)) return d.map((it) => safeTextFromData(it)).join('');
    if (Array.isArray(d.items)) {
      return d.items
        .map((it: any) => {
          if (typeof it === 'string') return escapeHtml(it);
          if (it && (typeof it.content === 'string' || typeof it.text === 'string')) {
            return escapeHtml(it.content || it.text);
          }
          return safeTextFromData(it);
        })
        .join('\n');
    }
    if (d.file && (d.file.url || (d.file as any).name)) {
      return escapeHtml(d.file.url || d.file.name || '');
    }
    if (d.html && typeof d.html === 'string') return d.html;
    try {
      return escapeHtml(JSON.stringify(d));
    } catch {
      return '';
    }
  };

  // @ts-ignore
  return (data as any).blocks
    .map((block: any) => {
      const type = block.type;
      const d = block.data || {};
      switch (type) {
        case 'header': {
          const lvl = d.level || 2;
          return `<h${lvl}>${escapeHtml(d.text || '')}</h${lvl}>`;
        }
        case 'paragraph': {
          return `<p>${safeTextFromData(d)}</p>`;
        }
        case 'list': {
          const items = Array.isArray(d.items) ? d.items : [];
          const tag = d.style === 'ordered' ? 'ol' : 'ul';
          const itemsHtml = items
            .map((it: any) => `<li>${safeTextFromData(it)}</li>`)
            .join('');
          return `<${tag}>${itemsHtml}</${tag}>`;
        }
        case 'quote': {
          const text = safeTextFromData(d);
          const caption = d.caption ? `<cite>${escapeHtml(d.caption)}</cite>` : '';
          return `<blockquote>${text}${caption}</blockquote>`;
        }
        case 'code': {
          const code = typeof d.code === 'string' ? escapeHtml(d.code) : safeTextFromData(d);
          return `<pre><code>${code}</code></pre>`;
        }
        case 'embed': {
          if (d.html) return d.html;
          if (d.caption) return `<div>${escapeHtml(d.caption)}</div>`;
          if (d.embed && typeof d.embed === 'string') return d.embed;
          return '';
        }
        case 'image': {
          const src = d.file?.url || d.url || '';
          const caption = d.caption ? `<figcaption>${escapeHtml(d.caption)}</figcaption>` : '';
          if (src) return `<figure><img src="${escapeHtml(src)}" alt=""/>${caption}</figure>`;
          return '';
        }
        case 'checklist': {
          const items = Array.isArray(d.items) ? d.items : [];
          const itemsHtml = items
            .map((it: any) => `<li${it.checked ? ' class="checked"' : ''}>${safeTextFromData(it.text || it)}</li>`)
            .join('');
          return `<ul class="checklist">${itemsHtml}</ul>`;
        }
        default: {
          const txt = safeTextFromData(d);
          return txt ? `<div>${txt}</div>` : '';
        }
      }
    })
    .join('\n');
}

// Dado un contenido que puede ser JSON (OutputData string) o HTML, devuelve HTML listo para mostrar.
export function renderEditorContent(raw?: string | null): string {
  if (!raw) return '';

  try {
    const parsed = JSON.parse(raw) as OutputData;
    return blocksToHtml(parsed);
  } catch {
    return raw;
  }
}

export default renderEditorContent;
