import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";
import QRCode from "qrcode";

export default function QRCodeDisplay({ text }: { text: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, text, { width: 128 });
    }
  }, [text]);

  return <canvas ref={canvasRef} class="mx-auto mt-4" />;
}
