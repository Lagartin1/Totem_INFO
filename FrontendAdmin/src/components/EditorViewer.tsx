import renderEditorContent from '../lib/renderEditorContent';
import { useRef } from 'react';

interface ViewerProps {
  initialData?: string;
  className?: string;
}

// Viewer that scopes editor-like styles to its own container to avoid
// leaking styles into the rest of the app. Uses inline <style> for scoping.
export default function EditorViewer({ initialData, className }: ViewerProps) {
  const viewerClassRef = useRef<string>(`editor-viewer-${Math.random().toString(36).slice(2)}`);
  const cls = className ? `${viewerClassRef.current} ${className}` : viewerClassRef.current;
  const html = renderEditorContent(initialData);

  return (
    <div className={cls}>
      <style>{`
        /* Headings */
        .${viewerClassRef.current} h1, .${viewerClassRef.current} h2, .${viewerClassRef.current} h3, .${viewerClassRef.current} h4, .${viewerClassRef.current} h5, .${viewerClassRef.current} h6, .${viewerClassRef.current} .ce-header {
          font-weight: 700;
          margin: 1em 0 0.5em;
        }
        .${viewerClassRef.current} h1 { font-size: 2.5em; line-height: 1.2; }
        .${viewerClassRef.current} h2 { font-size: 2em; line-height: 1.3; }
        .${viewerClassRef.current} h3 { font-size: 1.75em; line-height: 1.4; }
        .${viewerClassRef.current} h4 { font-size: 1.5em; line-height: 1.4; }
        .${viewerClassRef.current} h5 { font-size: 1.25em; line-height: 1.5; }
        .${viewerClassRef.current} h6 { font-size: 1.1em; line-height: 1.5; }

        /* Paragraphs and inline formatting */
        .${viewerClassRef.current} p, .${viewerClassRef.current} .ce-paragraph {
          font-size: 1em;
          line-height: 1.6;
          font-weight: 400;
          margin: 0 0 1em 0;
        }
        .${viewerClassRef.current} p b, .${viewerClassRef.current} p strong, .${viewerClassRef.current} .ce-paragraph b, .${viewerClassRef.current} .ce-paragraph strong { font-weight: 700; }
        .${viewerClassRef.current} p em, .${viewerClassRef.current} .ce-paragraph em { font-style: italic; }
        .${viewerClassRef.current} a { color: inherit; text-decoration: underline; }
        .${viewerClassRef.current} code, .${viewerClassRef.current} pre code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Courier New', monospace; background: rgba(27,31,35,0.05); padding: 0.1em 0.25em; border-radius: 4px; }

        /* Lists */
        .${viewerClassRef.current} ul, .${viewerClassRef.current} ol, .${viewerClassRef.current} .cdx-list {
          font-size: 1em;
          line-height: 1.6;
          margin: 0.75em 0 0.75em 1.25em;
        }
        .${viewerClassRef.current} ul li, .${viewerClassRef.current} ol li { margin: 0.25em 0; }
        .${viewerClassRef.current} ol { list-style-type: decimal; }
        .${viewerClassRef.current} ul { list-style-type: disc; }

        /* Checklist */
        .${viewerClassRef.current} ul.checklist { list-style: none; padding: 0; }
        .${viewerClassRef.current} ul.checklist li { position: relative; padding-left: 1.6em; }
        .${viewerClassRef.current} ul.checklist li::before { content: ''; position: absolute; left: 0; top: 0.3em; width: 1em; height: 1em; border: 1px solid #ccc; border-radius: 3px; background: #fff; }
        .${viewerClassRef.current} ul.checklist li.checked::before { background: #2563eb; border-color: #2563eb; }

        /* Blockquote */
        .${viewerClassRef.current} blockquote { margin: 0.75em 0; padding-left: 1em; border-left: 3px solid rgba(0,0,0,0.08); color: rgba(0,0,0,0.8); background: rgba(0,0,0,0.02); }

        /* Code blocks */
        .${viewerClassRef.current} pre { background: #f7f7f8; padding: 0.75em; overflow: auto; border-radius: 6px; }

        /* Images and figures */
        .${viewerClassRef.current} figure { margin: 0.75em 0; }
        .${viewerClassRef.current} figure img { max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 6px; }
        .${viewerClassRef.current} figcaption { font-size: 0.9em; color: #6b7280; text-align: center; margin-top: 0.5em; }

        /* Embeds (responsive) */
        .${viewerClassRef.current} .embed, .${viewerClassRef.current} iframe { max-width: 100%; }

        /* Inline tools: marks, del, strong, emphasis */
        .${viewerClassRef.current} .cdx-marker { background: #fff59d; padding: 0 3px; border-radius: 2px; }
        .${viewerClassRef.current} del { text-decoration: line-through; }

        /* Misc spacing and helper classes used by EditorJS */
        .${viewerClassRef.current} .cdx-block { margin: 0 0 1rem 0; }
        .${viewerClassRef.current} .cdx-tool--header { margin: 0.5rem 0; }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
