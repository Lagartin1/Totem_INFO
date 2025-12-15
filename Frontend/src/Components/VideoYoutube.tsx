import { useRef, useEffect, useState, useCallback } from 'react';
import { Volume2, Volume1,VolumeX} from 'lucide-react';


declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  videoId: string;
  className?: string;
  setLoading?: (loading: boolean) => void;
  clean?: boolean;
}

export default function YouTubePlayer({ 
  videoId, 
  className = '', 
  setLoading = () => {},
  clean = false,
}: YouTubePlayerProps) {
  const [statePlayer, setStatePlayer] = useState<'playing' | 'paused' | 'ended'|null >(null);
  const playerRef = useRef<any>(null);
  const sliderRef = useRef<HTMLInputElement | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [action, setAction] = useState<null | '5-' | '10+'| 'volUP' | 'volDown'| 'volMute' | 'volUnMute'>(null);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    
    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };

    document.body.appendChild(script);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  // Inicializar reproductor
  useEffect(() => {
    if (!apiReady || !videoId) return;
    
    // Limpiar reproductor anterior si existe
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.warn('Error al destruir reproductor anterior:', error);
      }
      playerRef.current = null;
    }

    const initializePlayer = () => {
      try {
        // Crear un ID único para cada instancia del reproductor
        const playerId = `youtube-player-${Date.now()}`;
        const existingPlayer = document.getElementById('youtube-player');
        if (existingPlayer) {
          existingPlayer.id = playerId;
        }

        playerRef.current = new window.YT.Player(playerId || 'youtube-player', {
          host: 'https://www.youtube-nocookie.com',
          videoId: videoId,
          playerVars: {
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            disablekb: 1,
            autoplay: 0,
            controls: 0,
            fs: 0,
            playsinline: 1,
            fullscreen: 0,
            enablejsapi: 1,
            origin: window.location.origin,
            widget_referrer: window.location.origin,
            cc_load_policy: 0,
            hl: 'es',
            showinfo: 0,
            end: 1,
            loop: 1
          },
          events: {
            onReady: (event: any) => {
              console.log('Reproductor de YouTube listo para:', videoId);
              setPlayer(event.target);
              setDuration(event.target.getDuration());
              setIsInitialized(true);
              setIsError(false);
              setErrorMessage('');
              setRetryCount(0);
              trackTime();
              setLoading(false);
            },
            onStateChange: (event: any) => {
              const state = event.data;                      
              if (state === 2) {
                setStatePlayer('paused');
                setIsPaused(true);
              } else if (state === 1) {
                setStatePlayer('playing');
                setIsPaused(false);
              } else if (state === 0) {
                setStatePlayer('ended');
                setIsPaused(false);
                event.target.stopVideo();
              } else if (state === -1) {
                setIsPaused(false);
              } else if (state === 5) {
                setStatePlayer('ended');
                setIsPaused(true);
              } else {
                setIsPaused(false);
              }
            },
            onError:(event: any)=>{
              console.error('Error del reproductor de YouTube:', event.data);
              let errorMsg = 'Error desconocido al cargar el video';
              
              switch(event.data) {
                case 2:
                  errorMsg = 'El ID del video es inválido';
                  break;
                case 5:
                  errorMsg = 'El video no está disponible en HTML5';
                  break;
                case 100:
                  errorMsg = 'Video no encontrado o privado';
                  break;
                case 101:
                case 150:
                  errorMsg = 'Video restringido o no disponible para reproducción embebida';
                  break;
                default:
                  errorMsg = 'Error al cargar el video de YouTube';
              }
              
              setErrorMessage(errorMsg);
              setIsError(true);
              setLoading(false);
              
              // Intentar reinicializar si no se ha superado el límite de reintentos
              if (retryCount < 2) {
                console.log(`Reintentando cargar video... Intento ${retryCount + 1}/2`);
                setTimeout(() => {
                  setRetryCount(prev => prev + 1);
                  setIsError(false);
                  initializePlayer();
                }, 2000);
              }
            }
          },  
        });
      } catch (error) {
        console.error('Error al inicializar reproductor de YouTube:', error);
        setErrorMessage('Error al inicializar el reproductor');
        setIsError(true);
        setLoading(false);
      }
    };

    // Pequeño delay para asegurar que el DOM esté listo
    const timeoutId = setTimeout(() => {
      initializePlayer();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [apiReady, videoId, retryCount]);
  
  // Cambiar video cuando videoId cambia
  useEffect(() => {
    if (playerRef.current && videoId && isInitialized) {
      try {
        playerRef.current.loadVideoById(videoId);
        setIsError(false);
        setErrorMessage('');
      } catch (error) {
        console.error('Error al cargar nuevo video:', error);
        setErrorMessage('Error al cambiar video');
        setIsError(true);
      }
    }
  }, [videoId, isInitialized]);

  const trackTime = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      if (!seeking && playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 200);
  };

  const formatTime = (seconds: number, forceHours = false) => {
    if (!isFinite(seconds) || seconds <= 0) seconds = 0;
    const s = Math.floor(seconds || 0);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (forceHours || h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setCurrentTime(value);
    setSeeking(true);
  };

  const handleBarClick = (e: React.MouseEvent<HTMLInputElement>) => {
    if (!duration || !sliderRef.current) return;
    const el = sliderRef.current;
    const rect = el.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, clickX / rect.width));
    const newTime = ratio * duration;
    setCurrentTime(newTime);
    // seek immediately on single click
    if (playerRef.current) {
      playerRef.current.seekTo(newTime, true);
    }
  };

  const handleBarTouch = (e: React.TouchEvent<HTMLInputElement>) => {
    if (!duration || !sliderRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const el = sliderRef.current;
    const rect = el.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, touchX / rect.width));
    const newTime = ratio * duration;
    setCurrentTime(newTime);
    if (playerRef.current) {
      playerRef.current.seekTo(newTime, true);
    }
  };

  const commitSeek = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(currentTime, true);
    }
    setSeeking(false);
  };

  const resume = () => {
    setIsPaused(false);
    playerRef.current?.playVideo();
  };

  // Manejar clics en áreas bloqueadas
  const handleBlockedClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isPaused && player) {
      player.playVideo();
    }
  }, [isPaused, player]);

  // Manejar clics en toda el área del video para pausar/reproducir
  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!player) return;
    
    if (isPaused) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [isPaused, player]);

  const evaluateControlsVisibility = () => {
    if (statePlayer) {
      switch (statePlayer) {
        case 'playing':
          return false;
        case 'paused':
          return true;
        case 'ended':
          return true;
        default:
          return false;
      }
    }
    return false;
  };



  const PerformAction = (action: '5-' | '10+'| 'volUP' | 'volDown'|'volMute'|'volUnMute') => {
    if (!playerRef.current) return;

    switch (action) {
      case '5-':
        {
          playerRef.current.seekTo(Math.max(0, currentTime - 5), true);
          setAction('5-');
          setTimeout(() => setAction(null), 800);
        }
        break;
      case '10+':
        {
          playerRef.current.seekTo(Math.min(duration || 0, currentTime + 10), true);
          setAction('10+');
          setTimeout(() => setAction(null), 800);
        }
        break;
      case 'volUP':
        {
          if (isMuted) {
            setIsMuted(!isMuted);
            playerRef.current.unMute();
            setAction('volUnMute');
            setTimeout(() => setAction(null), 800);
            break;
          }
          const currentVolume = playerRef.current.getVolume();
          playerRef.current.setVolume(Math.min(100, currentVolume + 10));
          setAction('volUP');
          setTimeout(() => setAction(null), 800);
        }
        break;
      case 'volDown':
        {
          if (isMuted) {
            setIsMuted(!isMuted);
            playerRef.current.unMute();
            setAction('volUnMute');
            setTimeout(() => setAction(null), 800);
            break;
          }
          const currentVolume = playerRef.current.getVolume();
          playerRef.current.setVolume(Math.max(0, currentVolume - 10));
          setAction('volDown');
          setTimeout(() => setAction(null), 800);
          
        }
        break;
      case 'volMute':
        {
          if (!isMuted) {
            setIsMuted(!isMuted);
            playerRef.current.mute();
            setAction('volMute');
            setTimeout(() => setAction(null), 800);
            break;
          }
          setIsMuted(!isMuted);
          playerRef.current.unMute();
          setAction('volUnMute');
          setTimeout(() => setAction(null), 800);

        }
        break;
    }
  }





  return (
    <div className={`rounded-lg overflow-hidden ${className}`} data-interactive="true">
      <div 
        className="relative"
        style={{ paddingTop: '56.25%' }} // 16:9 Aspect Ratio
      >
        {/* Reproductor de YouTube */}
        <div 
          id="youtube-player" 
          className="absolute top-0 left-0 w-full h-full"
        />
        
        {/* Overlay clickeable para pausar/reproducir */}
        <div 
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={handleVideoClick}
        />
        
        {/* Overlay para bloquear sugerencias de "Más videos" */}
        <div 
          className="absolute bottom-0 right-0 w-full h-24 z-25 pointer-events-none"
        />
        
        {/* Overlays transparentes para bloquear áreas no deseadas */}
        
        {/* Logo YouTube / título del video (overlay) - ocultable en modo `clean` */}
        {!clean && (
          <>
            <div 
              className="absolute top-0 right-0 w-full h-16 z-30 cursor-not-allowed"
              onClick={handleBlockedClick}
            />
            {/* Overlay adicional para cubrir área de sugerencias */}
            <div 
              className="absolute bottom-0 left-0 w-full h-20 z-30 pointer-events-none bg-transparent"
            />
          </>
        )}
        
        {/* Overlay Error */}
        <div 
            className={`absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40 cursor-pointer   ${isError ? "block" : "hidden"}`}
          >
            <div className="bg-white/90 rounded-lg p-6 flex flex-col items-center justify-center max-w-md mx-4">  
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16 text-red-600 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <h2 className="text-2xl font-bold mb-2 text-red-600">Error al cargar el video</h2>
              <p className="text-center mb-4 text-gray-700">
                {errorMessage || 'Lo sentimos, ha ocurrido un error al reproducir este video de YouTube.'}
              </p>
              {videoId && (
                <div className="space-y-3 w-full">
                  {retryCount < 2 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRetryCount(prev => prev + 1);
                        setIsError(false);
                        setErrorMessage('');
                      }}
                      className="inline-flex items-center justify-center w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      Reintentar
                    </button>
                  )}
                </div>
              )}
            </div>
        </div>



        {/* OVERLAY blur con boton play */}
          <div 
            className={`absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-20 cursor-pointer   ${isPaused ? "block" : "hidden"}`}
            onClick={handleBlockedClick}
          >
            <button className="bg-white/30 hover:bg-white/50 text-white rounded-full p-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

        {/* OVERLAY con actions de los botones */}
        <div className={`absolute inset-0 bg-transparent flex items-center justify-center z-30 cursor-pointer   ${!action ? "hidden" : "block"}`}> 
          
          { action === '5-' && (
            <div className="bg-black/20 rounded-full p-6 flex gap-2 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
              </svg>
              <span className="text-white text-2xl font-bold justify-center ">5s</span>
            </div>
          ) }
          {
          action === '10+' && (
            <div className="bg-black/20 rounded-full p-4 flex gap-2 items-center justify-center">
              <span className="text-white text-3xl font-bold justify-center">10s</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          )
          }
          {
          action === 'volUP' && ( 
            <div className="bg-black/20 rounded-full p-4 flex gap-2 items-center text-justify-center">
              <Volume2 color='white'/>
              <span className="text-white text-2xl font-bold justify-center">Vol+</span>
            </div>
          )
          }
          {
          action === 'volDown' && ( 
            <div className="bg-black/20 rounded-full p-4 flex gap-2 items-center text-justify-center">
              <Volume1 color='white'/>
              <span className="text-white text-2xl font-bold justify-center">Vol-</span>
            </div>
          )
          }
          {
          action === 'volMute' && ( 
            <div className="bg-black/20 rounded-full p-4 flex gap-2 items-center">
              <VolumeX color='white'/>
              <span className="text-white text-2xl font-bold justify-center">Silenciado</span>
            </div>
          )
          }
          {
          action === 'volUnMute' && ( 
            <div className="bg-black/20 rounded-full p-4 flex gap-2 items-center text-justify-center">
              <Volume2 color='white'/>
              <span className="text-white text-2xl font-bold">Sonido Activado</span>
            </div>
          )
          }
          
        </div>

        
        {/* Controles inferiores (ocultos en modo clean) */}
        {!clean && (statePlayer || statePlayer === 'ended' ) && (
          <div className={` absolute left-0 right-0 bottom-3 bg-black/60 backdrop-blur-lg z-50 w-full h-16 rounded-2xl ${evaluateControlsVisibility() ? "hidden" : "flex"}`}>
            <div className="absolute w-full h-full flex items-center justify-center gap-5 px-4">
              <button
                className="text-white hover:text-red-600 transition p-2 w-10"
                onClick={isPaused ? resume : () => playerRef.current?.pauseVideo()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                </svg>
              </button>

              <button
                className="text-white hover:text-red-600 transition p-3 w-10"
                onClick={() => PerformAction('5-')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                  <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.029v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z" />
                </svg>
              </button>

              <button 
                className="text-white hover:text-red-600 transition p-3 w-10"
                onClick={() => PerformAction('10+')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                  <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
                </svg>
              </button>

              <button
                className="text-white hover:text-red-600 transition p-3 w-10"
                onClick={() => PerformAction('volDown')}
              >
                <Volume1 />
              </button>

              <button
                className="text-white hover:text-red-600 transition p-3 w-10"
                onClick={() => PerformAction('volUP')}
              >
                <Volume2 />
              </button>

              <button
                className={`${isMuted ? 'text-red-600' : 'text-white'} hover:text-red-600 transition p-3 w-10`}
                onClick={() => PerformAction('volMute')}
              >
                <VolumeX />
              </button> 







              <div className="flex items-center gap-3 w-3/5">
                <span className="text-white text-base">
                  {formatTime(currentTime, duration >= 3600)}
                </span>
                <div className="flex-1">
                  <input ref={sliderRef} type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    onMouseUp={commitSeek}
                    onTouchEnd={commitSeek}
                    onClick={handleBarClick}
                    onTouchStart={handleBarTouch}
                    className="w-full h-3 rounded-md appearance-none cursor-pointer bg-white/30"
                    style={{
                      background: `linear-gradient(to right, #E50914 ${ duration ? (currentTime/duration)*100 : 0 }%, #4b5563 ${ duration ? (currentTime/duration)*100 : 0 }%)`
                    }}
                  />
                </div>
                <span className="text-white text-base">
                  {formatTime(duration || 0, duration >= 3600)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );  
}