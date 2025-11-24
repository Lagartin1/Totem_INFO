import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QRCanvas(props: {link: string}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      props.link,
      { width: 256,
        color: {
          dark: "#000000",
          light: "#ffffff00" // transparente
        }
      },

      (err) => {
        if (err) console.error(err);
      }
    );
  }, []);

  return (
    <canvas ref={canvasRef} />
  );
}
