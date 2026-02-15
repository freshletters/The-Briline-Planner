
import React, { useRef, useEffect } from 'react';

interface DrawingCanvasProps {
  id: string;
  isActive: boolean;
  color: string;
  brushSize: number;
  isEraser?: boolean;
  initialData?: string;
  onSave: (dataUrl: string) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ id, isActive, color, brushSize, isEraser, initialData, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { desynchronized: true });
    if (!ctx) return;

    // Handle high DPI displays for crisp ink
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    if (initialData) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = initialData;
    }

    const startDrawing = (e: PointerEvent) => {
      if (!isActive) return;
      isDrawing.current = true;
      const rect = canvas.getBoundingClientRect();
      lastX.current = e.clientX - rect.left;
      lastY.current = e.clientY - rect.top;
      
      // Configure stroke
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // True eraser logic: destination-out clears pixels instead of painting white
      if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = brushSize * 2; // Erasers usually feel better slightly larger
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
        // Basic pressure sensitivity if available
        ctx.lineWidth = e.pressure > 0 ? brushSize * (e.pressure * 2) : brushSize;
      }
    };

    const draw = (e: PointerEvent) => {
      if (!isDrawing.current || !isActive) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.beginPath();
      ctx.moveTo(lastX.current, lastY.current);
      ctx.lineTo(x, y);
      ctx.stroke();

      lastX.current = x;
      lastY.current = y;
    };

    const stopDrawing = () => {
      if (isDrawing.current) {
        isDrawing.current = false;
        onSave(canvas.toDataURL());
      }
    };

    // Optimization: Use passive: false to ensure we can prevent default if needed, 
    // though touch-action: none is usually enough.
    canvas.addEventListener('pointerdown', startDrawing);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', stopDrawing);
    canvas.addEventListener('pointerleave', stopDrawing);

    return () => {
      canvas.removeEventListener('pointerdown', startDrawing);
      canvas.removeEventListener('pointermove', draw);
      canvas.removeEventListener('pointerup', stopDrawing);
      canvas.removeEventListener('pointerleave', stopDrawing);
    };
  }, [isActive, color, brushSize, isEraser, initialData, id]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full z-20 ${isActive ? 'cursor-crosshair' : 'pointer-events-none'}`}
      style={{ touchAction: 'none' }}
    />
  );
};

export default DrawingCanvas;
