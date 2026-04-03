'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  size: number;
  angle: number;
  angleSpeed: number;
  colorProgress: number;
}

// Blue → Purple → Magenta → Coral → Orange gradient (matches Antigravity)
function getColor(progress: number, alpha: number): string {
  const stops = [
    { p: 0,    r: 34,  g: 85,  b: 200 },
    { p: 0.25, r: 120, g: 60,  b: 210 },
    { p: 0.5,  r: 190, g: 50,  b: 180 },
    { p: 0.75, r: 230, g: 80,  b: 100 },
    { p: 1,    r: 255, g: 150, b: 50  },
  ];
  let i = 0;
  while (i < stops.length - 2 && progress > stops[i + 1].p) i++;
  const a = stops[i], b = stops[i + 1];
  const t = Math.max(0, Math.min(1, (progress - a.p) / (b.p - a.p)));
  return `rgba(${Math.round(a.r + (b.r - a.r) * t)},${Math.round(a.g + (b.g - a.g) * t)},${Math.round(a.b + (b.b - a.b) * t)},${alpha})`;
}

const PARTICLE_COUNT = 250;
const MAX_DIST      = 180;   // px — mouse influence radius
const REPEL_FORCE   = 4.2;   // scatter strength
const RETURN_SPEED  = 0.048; // spring-back stiffness
const DAMPING       = 0.80;  // velocity damping per frame

export default function ParticleBackground() {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const mouseRef   = useRef({ x: -9999, y: -9999 });
  const particles  = useRef<Particle[]>([]);
  const rafRef     = useRef<number>(0);

  useEffect(() => {
    const wrap   = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* ─── Resize + init ─────────────────────────────── */
    const init = () => {
      const { width, height } = wrap.getBoundingClientRect();
      canvas.width  = width;
      canvas.height = height;

      particles.current = Array.from({ length: PARTICLE_COUNT }, () => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        return {
          x, y,
          baseX: x, baseY: y,
          vx: 0, vy: 0,
          size: 1.0 + Math.random() * 2.4,
          angle: Math.random() * Math.PI * 2,
          angleSpeed: 0.0015 + Math.random() * 0.004,
          colorProgress: y / height,
        };
      });
    };

    /* ─── Mouse tracking (on window – filtered by section rect) ─ */
    const handleMouseMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      // Only track when cursor is inside the section
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top  && e.clientY <= rect.bottom
      ) {
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      } else {
        mouseRef.current = { x: -9999, y: -9999 };
      }
    };

    /* ─── Animation loop ─────────────────────────────── */
    const tick = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.current.forEach((p) => {
        p.angle += p.angleSpeed;

        // Cursor influence — scatter outward
        const dx   = p.x - mx;
        const dy   = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST && dist > 0) {
          const force = (1 - dist / MAX_DIST) * REPEL_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Spring back
        p.vx += (p.baseX - p.x) * RETURN_SPEED;
        p.vy += (p.baseY - p.y) * RETURN_SPEED;

        // Damp & integrate
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x  += p.vx;
        p.y  += p.vy;

        p.colorProgress = Math.max(0, Math.min(1, p.y / H));

        // Draw dash stroke
        const len    = p.size * 4.5;
        const cos    = Math.cos(p.angle);
        const sin    = Math.sin(p.angle);
        // Pulse alpha gently
        const alpha  = 0.45 + 0.38 * (0.5 + 0.5 * Math.sin(p.angle * 1.7));

        ctx.strokeStyle = getColor(p.colorProgress, alpha);
        ctx.lineWidth   = p.size * 0.55;
        ctx.lineCap     = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x - cos * len, p.y - sin * len);
        ctx.lineTo(p.x + cos * len, p.y + sin * len);
        ctx.stroke();
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    const onResize = () => init();

    init();
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize',    onResize,        { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize',    onResize);
    };
  }, []);

  return (
    /* Full-section overlay — pointer-events:none so nothing is blocked */
    <div
      ref={wrapRef}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
