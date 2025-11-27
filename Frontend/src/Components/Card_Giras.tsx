import React from 'react';
import YouTubePlayer from "../Components/VideoYoutube";
import QRCanvas from "../Components/Qr_code";



function extractYouTubeVideoId(url:string) {
    if (!url || typeof url !== 'string') {
        console.error('URL no válida');
        return null;
    }
    
    // Limpiar la URL
    const cleanUrl = url.trim();
    
    // Definir todos los patrones posibles
    const regexPatterns = [
        // https://www.youtube.com/watch?v=VIDEO_ID
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:[&\\?].*)?$/,
        
        // https://youtu.be/VIDEO_ID
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
        
        // https://www.youtube.com/embed/VIDEO_ID
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
        
        // https://www.youtube.com/v/VIDEO_ID
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
        
        // https://www.youtube.com/shorts/VIDEO_ID
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
        
        // https://www.youtube.com/live/VIDEO_ID
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
        
        // https://www.youtube.com/live/VIDEO_ID?si=...
        /youtube\.com\/live\/([a-zA-Z0-9_-]+)(?:\?.*)?/,
        
        // Solo el ID (11 caracteres)
        /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of regexPatterns) {
        const match = cleanUrl.match(pattern);
        if (match && match[1]) {
            // Validar que el ID tenga exactamente 11 caracteres
            const videoId = match[1];
            if (videoId.length === 11) {
                return videoId;
            }
        }
    }
    
    console.warn('No se pudo extraer el ID de YouTube de la URL:', url);
    return null;
}

export default function Card_Giras(porps: {title: string, date: string, description: string,link: string, setLoading: (loading: boolean) => void}) {
  const [modal, setModal] = React.useState<boolean>(false);
  const prevOverflowRef = React.useRef<string>("");
  const evaluateYoutubeId = (url: string) => {
    const videoId = extractYouTubeVideoId(url);
    return videoId;
  }
  const performClick = () => {
    porps.setLoading(true);
    setModal(true);
  }

  React.useEffect(() => {
    if (modal) {
      prevOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = prevOverflowRef.current || '';
    }
    return () => {
      document.body.style.overflow = prevOverflowRef.current || '';
    };
  }, [modal]);
  const shortDescription = (desc: string) => {
    if (desc.length > 150) {
      return desc.slice(0, 150) + '...';
    }
    return desc;
  }
  // Try several YouTube thumbnail keys and pick the first that loads
  const thumbKeys = ['maxresdefault','sddefault','hqdefault','mqdefault','default'];
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string>('');

  const probeThumbnail = (videoId: string | null) => {
    return new Promise<string>((resolve) => {
      if (!videoId) {
        resolve('');
        return;
      }

      const MIN_WIDTH = 200; // reject tiny placeholder thumbs
      const MIN_HEIGHT = 120;
      let tried = 0;

      const tryKey = () => {
        if (tried >= thumbKeys.length) {
          resolve('');
          return;
        }
        const key = thumbKeys[tried];
        const url = `https://img.youtube.com/vi/${videoId}/${key}.jpg`;
        const img = new Image();

        // If neither onload nor onerror fire (rare), use a timeout to continue
        let timeoutId: number | undefined = undefined;
        const clear = () => {
          if (timeoutId) window.clearTimeout(timeoutId);
        };

        img.onload = () => {
          clear();
          // Reject very small images (YouTube sometimes serves small placeholders)
          if ((img.naturalWidth || 0) >= MIN_WIDTH && (img.naturalHeight || 0) >= MIN_HEIGHT) {
            resolve(url);
          } else {
            tried++;
            tryKey();
          }
        };
        img.onerror = () => {
          clear();
          tried++;
          tryKey();
        };

        // 2s timeout per attempt
        timeoutId = window.setTimeout(() => {
          // treat as failure and continue
          tried++;
          tryKey();
        }, 2000);

        img.src = url;
      };

      tryKey();
    });
  };

  React.useEffect(() => {
    const vid = evaluateYoutubeId(porps.link);
    // start with empty while probing
    setThumbnailUrl('');
    probeThumbnail(vid).then((url) => {
      if (url) setThumbnailUrl(url);
    });
  }, [porps.link]);



  return (
    <>
    <div key={evaluateYoutubeId(porps.link)}
        role="button" onClick={performClick}
        className={`rounded-lg  p-4 shadow-md 
          hover:shadow-lg transition-shadow-ease-out transition-colors-ease-out duration-300
          
          h-90 w-80 flex flex-col justify-end items-center cursor-pointer relative `}
          style={{backgroundImage: `url(${thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center'}}
      >

      <div className="absolute bg-gradient-to-t from-black/50 to-transparent text-lg font-semibold inset-0 z-10 overflow-hidden rounded-lg ">
          <h1 className='absolute bottom-10 left-5 w-60 text-xl font-bold text-white '>
            {porps.title}
          </h1>
      </div>
    </div>
      {modal && ( <div> 
            <div
                className="fixed inset-0 bg-black/5 w-full h-full top-1/2 left-1/2 
                                transform -translate-x-1/2 -translate-y-1/2 transition 
                                ease-out inset backdrop-blur-sm flex items-center justify-center z-50">
              <div className="flex h-[75vh] w-[90vw] bg-slate-400 rounded-xl flex-row items-center relative">
          
                <div className="w-full p-5">
                  <YouTubePlayer videoId={evaluateYoutubeId(porps.link) ?? ''} className="w-full" setLoading={porps.setLoading} />
                </div>
                <div className="flex flex-col w-[30%] mt-2">
                  <div className="flex flex-col p-5 items-center justify-center text-center">
                    <h1 className="font-bold text-4xl">{porps.title}</h1>
                    <p className="mt-2 italic text-xl">{new Date(porps.date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-2xl p-2 justify-center text-center">{shortDescription(porps.description)}</p>
                  <div className= "items-center justify-center flex flex-col mb-2 text-center">
                    <p> Escanea el siguiente código QR y disfruta de la Gira en tu dispositivo: </p>
                    <QRCanvas link={porps.link}/>
                  </div>
                </div>
              </div>
              <button
                className="absolute top-10 left-20 text-white bg-red-500 rounded-full w-50 h-10 
                            flex items-center justify-center hover:bg-red-600 p-2 gap-2"
                onClick={() => setModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className='h-7'>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                </svg>
                <span className='text-xl'> Volver </span>

              </button>
              
            </div>  
          </div>
        )}  
    </>
  );

}