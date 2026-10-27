import React, { useEffect, useRef } from 'react';

export const ClothWaveCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleResize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Wave parameters representing silk fabric folds & underwater shore swells
    const layers = [
      {
        baseY: 0.68,
        speed: 0.0008,
        freq1: 0.0018,
        freq2: 0.0035,
        amp1: 45,
        amp2: 25,
        colorCrest: 'rgba(0, 210, 255, 0.45)',
        colorFillTop: 'rgba(0, 180, 255, 0.08)',
        colorFillBottom: 'rgba(0, 20, 60, 0.0)',
        lineWidth: 1.5,
      },
      {
        baseY: 0.74,
        speed: 0.0011,
        freq1: 0.0022,
        freq2: 0.0045,
        amp1: 55,
        amp2: 30,
        colorCrest: 'rgba(56, 189, 248, 0.5)',
        colorFillTop: 'rgba(0, 130, 255, 0.1)',
        colorFillBottom: 'rgba(0, 10, 40, 0.0)',
        lineWidth: 1.75,
      },
      {
        baseY: 0.80,
        speed: 0.0009,
        freq1: 0.0015,
        freq2: 0.0032,
        amp1: 65,
        amp2: 35,
        colorCrest: 'rgba(0, 235, 255, 0.6)',
        colorFillTop: 'rgba(0, 200, 255, 0.12)',
        colorFillBottom: 'rgba(0, 5, 30, 0.0)',
        lineWidth: 2.0,
      },
      {
        baseY: 0.86,
        speed: 0.0013,
        freq1: 0.0025,
        freq2: 0.005,
        amp1: 50,
        amp2: 28,
        colorCrest: 'rgba(125, 211, 252, 0.65)',
        colorFillTop: 'rgba(0, 150, 255, 0.14)',
        colorFillBottom: 'rgba(0, 0, 20, 0.0)',
        lineWidth: 2.25,
      },
      {
        baseY: 0.92,
        speed: 0.001,
        freq1: 0.0019,
        freq2: 0.0038,
        amp1: 70,
        amp2: 40,
        colorCrest: 'rgba(0, 210, 255, 0.7)',
        colorFillTop: 'rgba(0, 110, 240, 0.16)',
        colorFillBottom: 'rgba(0, 0, 0, 0.0)',
        lineWidth: 2.5,
      }
    ];

    let time = 0;

    const render = () => {
      time += 1;

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Render each rolling cloth ridge
      layers.forEach((layer, idx) => {
        const startY = height * layer.baseY;
        const currentSpeed = time * layer.speed;

        ctx.beginPath();
        ctx.moveTo(0, height);

        // Plot points across the width
        const step = 8;
        for (let x = 0; x <= width + step; x += step) {
          // Primary oceanic swell
          const swell = Math.sin(x * layer.freq1 + currentSpeed + idx * 0.7) * layer.amp1;
          
          // Secondary ripple wave (fabric wrinkle / cross-current)
          const wrinkle = Math.cos(x * layer.freq2 - currentSpeed * 1.4 + idx * 1.2) * layer.amp2;

          // Rhythmic shore-surge envelope: slowly surges upward and recedes like tide
          const surgeCycle = Math.sin(time * 0.0006 + idx * 0.5);
          const surge = surgeCycle * 25;

          // Subtle interaction with mouse: fabric lifts slightly near cursor
          const distToMouse = Math.hypot(x - mouseX, startY - mouseY);
          const mouseLift = Math.max(0, 1 - distToMouse / 350) * -35;

          const y = startY + swell + wrinkle + surge + mouseLift;

          if (x === 0) {
            ctx.lineTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Fill with deep oceanic water/silk gradient
        const gradient = ctx.createLinearGradient(0, startY - layer.amp1, 0, height);
        gradient.addColorStop(0, layer.colorFillTop);
        gradient.addColorStop(1, layer.colorFillBottom);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Stroke the illuminated crest line (the fold of the cloth catching light)
        ctx.beginPath();
        for (let x = 0; x <= width + step; x += step) {
          const swell = Math.sin(x * layer.freq1 + currentSpeed + idx * 0.7) * layer.amp1;
          const wrinkle = Math.cos(x * layer.freq2 - currentSpeed * 1.4 + idx * 1.2) * layer.amp2;
          const surgeCycle = Math.sin(time * 0.0006 + idx * 0.5);
          const surge = surgeCycle * 25;
          const distToMouse = Math.hypot(x - mouseX, startY - mouseY);
          const mouseLift = Math.max(0, 1 - distToMouse / 350) * -35;

          const y = startY + swell + wrinkle + surge + mouseLift;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = layer.colorCrest;
        ctx.lineWidth = layer.lineWidth;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      {/* Dark Vignettes to preserve solid contrast for text and buttons */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/70 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none" />
    </div>
  );
};
