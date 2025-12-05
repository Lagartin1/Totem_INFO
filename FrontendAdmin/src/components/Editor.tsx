import { useEffect, useRef } from 'react';
// Importa el core y las herramientas
import EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
// @ts-ignore
import Paragraph from '@editorjs/paragraph';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import InlineCode from '@editorjs/inline-code';
import { blocksToHtml } from '../lib/renderEditorContent';
import renderEditorContent from '../lib/renderEditorContent';

interface EditorComponentProps {
  initialData?: string | OutputData;
  onChangeData?: (data: OutputData) => void;
  onChangeHtml?: (html: string) => void;
  onReady?: (editor: EditorJS | null) => void;
  readOnly?: boolean;
}

function EditorComponent({ initialData, onChangeData, onChangeHtml, onReady, readOnly }: EditorComponentProps) {
  // Usamos useRef para crear una referencia al elemento DOM y al editor
  const editorRef = useRef<EditorJS | null>(null);
  // Generar un ID único para el contenedor del editor por instancia
  const holderIdRef = useRef<string>(`editorjs-container-${Math.random().toString(36).slice(2)}`);

  // Parsear initialData si viene como string.
  // Si viene como JSON (string) lo parsea a OutputData.
  // Si viene como HTML/texto plano, lo envuelve en un bloque de párrafo.
  const parseInitialData = (): OutputData | undefined => {
    if (!initialData) return undefined;
    if (typeof initialData === 'string') {
      try {
        return JSON.parse(initialData) as OutputData;
      } catch {
        // Si no es JSON, asumimos que es HTML/texto y lo ponemos en un párrafo
        return {
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: initialData,
              },
            },
          ],
        };
      }
    }
    return initialData;
  };

  // Clase única para el viewer (si se usa readOnly)
  const viewerClassRef = useRef<string>(`editor-viewer-${Math.random().toString(36).slice(2)}`);

  // HTML que se mostrará en modo lector
  const viewerHtml = (() => {
    if (!initialData) return '';
    if (typeof initialData === 'string') {
      return renderEditorContent(initialData);
    }
    return blocksToHtml(initialData as OutputData);
  })();

  // useEffect se encarga del ciclo de vida (montaje y desmontaje)
  useEffect(() => {
    if (readOnly) {
      // No inicializamos EditorJS en modo lectura
      if (onReady) onReady(null);
      return undefined;
    }
    // Inicializar el editor solo una vez. Si `initialData` cambia después,
    // intentamos renderizar los bloques en la instancia existente para evitar
    // recrear la instancia y producir loops entre onChange -> prop update -> reinit.
    const init = async () => {
      // Inicializar solo si no existe instancia
      if (!editorRef.current) {
        const holderId = holderIdRef.current;
        let holder = document.getElementById(holderId);
        let attempts = 0;
        while (!holder && attempts < 5) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise((res) => setTimeout(res, 50));
          holder = document.getElementById(holderId);
          attempts += 1;
        }
        if (!holder) {
          console.error(`Editor.js initialization failed: element with ID ${holderId} is missing.`);
          if (onReady) {
            try { onReady(null); } catch (e) { console.warn('onReady handler error', e); }
          }
          return;
        }

        const editor = new EditorJS({
          holder: holderIdRef.current,
          i18n: {
            messages: {
              ui: {
                blockTunes: { toggler: { "Click to tune": "Clic para configurar", "or drag to move": "o arrastra para mover" } },
                inlineToolbar: { converter: { "Convert to": "Convertir a" } },
                toolbar: { toolbox: { Add: "Agregar" } }
              },
              toolNames: {
                "Text": "Texto",
                "Heading": "Título",
                "List": "Lista",
                "Ordered List": "Lista ordenada",
                "Unordered List": "Lista desordenada",
                "Checklist": "Lista de verificación",
                "Bold": "Negrita",
                "Italic": "Cursiva",
                "InlineCode": "Código"
              },
              tools: {
                header: { "Heading 1": "Título 1", "Heading 2": "Título 2", "Heading 3": "Título 3", "Heading 4": "Título 4", "Heading 5": "Título 5", "Heading 6": "Título 6" },
                paragraph: { "Enter something": "Escribe algo" },
                list: { "Ordered": "Ordenada", "Unordered": "Desordenada" }
              },
              blockTunes: { delete: { "Delete": "Eliminar" }, moveUp: { "Move up": "Mover arriba" }, moveDown: { "Move down": "Mover abajo" } }
            }
          },
          tools: {
            header: {
              // @ts-ignore
              class: Header,
              config: {
                placeholder: 'Escribe un título',
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2,
              },
            },
            paragraph: {
              // @ts-ignore
              class: Paragraph,
              inlineToolbar: true,
              config: {
                placeholder: 'Escribe tu texto aquí...',
              },
            },
            list: {
              // @ts-ignore
              class: List,
              inlineToolbar: true,
              config: {
                defaultStyle: 'unordered',
              },
            },
            inlineCode: {
              // @ts-ignore
              class: InlineCode,
              shortcut: 'CMD+SHIFT+M',
            },
          },
          data: parseInitialData() || { blocks: [] }
        });

        // Guardar instancia
        editorRef.current = editor;

        // Cuando el editor esté listo, registrar handlers y notificar onReady
        editor.isReady
          .then(() => {
            if (!readOnly && (onChangeData || onChangeHtml)) {
              editor.on('change', async () => {
                const content = await editor.save();
                if (onChangeData) onChangeData(content);
                if (onChangeHtml) onChangeHtml(blocksToHtml(content));
              });
            }
            if (onReady) {
              try { onReady(editor); } catch (e) { console.warn('onReady handler error', e); }
            }
          })
          .catch(() => {
            if (onReady) {
              try { onReady(null); } catch (e) { console.warn('onReady handler error', e); }
            }
          });
      }

      // Si ya existe una instancia y llega nuevo `initialData`, renderizamos en lugar de reiniciar.
      const parsed = parseInitialData();
      if (editorRef.current && parsed && Array.isArray((parsed as any).blocks)) {
        try {
          // `blocks.render` existe en EditorJS para renderizar bloques
          // @ts-ignore
          if (editorRef.current.blocks && typeof editorRef.current.blocks.render === 'function') {
            // @ts-ignore
            editorRef.current.blocks.render((parsed as any).blocks);
          }
        } catch (err) {
          console.warn('No se pudo renderizar bloques en la instancia existente:', err);
        }
      }

    };

    init();

    // Cleanup: destruir instancia al desmontar
    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
      if (onReady) onReady(null);
    };
  // Solo dependemos de las callbacks; initialData se maneja internamente para render
  // en la instancia existente para evitar loops.
  }, [onChangeData, onChangeHtml, readOnly]);

  if (readOnly) {
    const cls = viewerClassRef.current;
    return (
      <div className={cls} style={{ maxWidth: '800px', margin: '20px 0' }}>
        <style>{`
          .${cls} h1, .${cls} h2, .${cls} h3, .${cls} h4, .${cls} h5, .${cls} h6, .${cls} .ce-header {
            font-weight: 700;
            margin: 1em 0 0.5em;
          }
          .${cls} h1, .${cls} h1.ce-header { font-size: 2.5em; line-height: 1.2; }
          .${cls} h2, .${cls} h2.ce-header { font-size: 2em; line-height: 1.3; }
          .${cls} h3, .${cls} h3.ce-header { font-size: 1.75em; line-height: 1.4; }
          .${cls} h4, .${cls} h4.ce-header { font-size: 1.5em; line-height: 1.4; }
          .${cls} h5, .${cls} h5.ce-header { font-size: 1.25em; line-height: 1.5; }
          .${cls} h6, .${cls} h6.ce-header { font-size: 1.1em; line-height: 1.5; }
          .${cls} p, .${cls} .ce-paragraph { font-size: 1em; line-height: 1.6; font-weight: 400; }
          .${cls} p b, .${cls} p strong, .${cls} .ce-paragraph b, .${cls} .ce-paragraph strong { font-weight: 700; }
          .${cls} ul, .${cls} ol, .${cls} .cdx-list { font-size: 1em; line-height: 1.6; margin: 0.75em 0 0.75em 1.25em; }
          .${cls} ul li, .${cls} ol li { margin: 0.25em 0; }
          .${cls} ul.checklist { list-style: disc; }
          .${cls} blockquote { margin: 0.75em 0; padding-left: 1em; border-left: 3px solid rgba(0,0,0,0.08); }
          .${cls} pre { background: #f7f7f8; padding: 0.75em; overflow: auto; }
        `}</style>
        <div dangerouslySetInnerHTML={{ __html: viewerHtml }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto' }}>
      <style>{`
        /* Estilos para los títulos del editor */
        .ce-header {
          font-weight: 700;
          margin: 1em 0 0.5em;
        }
        
        [data-placeholder]:empty:before {
          color: #707684;
          font-weight: normal;
        }
        
        /* H1 */
        .ce-header[contenteditable="true"][data-placeholder]:empty:before {
          font-weight: 700;
        }
        
        h1.ce-header {
          font-size: 2.5em;
          line-height: 1.2;
        }
        
        /* H2 */
        h2.ce-header {
          font-size: 2em;
          line-height: 1.3;
        }
        
        /* H3 */
        h3.ce-header {
          font-size: 1.75em;
          line-height: 1.4;
        }
        
        /* H4 */
        h4.ce-header {
          font-size: 1.5em;
          line-height: 1.4;
        }
        
        /* H5 */
        h5.ce-header {
          font-size: 1.25em;
          line-height: 1.5;
        }
        
        /* H6 */
        h6.ce-header {
          font-size: 1.1em;
          line-height: 1.5;
        }
        
        /* Párrafos normales */
        .ce-paragraph {
          font-size: 1em;
          line-height: 1.6;
          font-weight: 400;
        }
        
        /* Negritas más visibles */
        .ce-paragraph b,
        .ce-paragraph strong {
          font-weight: 700;
        }
        
        /* Listas */
        .cdx-list {
          font-size: 1em;
          line-height: 1.6;
        }
      `}</style>

      {/* 3. El div contenedor con el ID que definimos en 'holder' */}
      <div id={holderIdRef.current} style={{ border: '1px solid #ddd', padding: '10px' }} />
    </div>
  );
}

export default EditorComponent;