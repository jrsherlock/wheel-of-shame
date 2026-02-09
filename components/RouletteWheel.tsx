import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { Punishment } from '../types';

interface PunishmentWheelProps {
  mustSpin: boolean;
  punishments: Punishment[];
  targetId: string | null;
  spinDuration: number;
  slowdownDuration: number;
  onStopSpinning: () => void;
}

const CANVAS_SIZE = 600;
const CENTER = CANVAS_SIZE / 2;
const RADIUS = 260;
const TWO_PI = Math.PI * 2;

export const PunishmentWheel: React.FC<PunishmentWheelProps> = ({
  mustSpin,
  punishments,
  targetId,
  spinDuration,
  slowdownDuration,
  onStopSpinning,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const state = useRef({
    phase: 'IDLE' as 'IDLE' | 'ACCELERATING' | 'SPINNING' | 'DECELERATING' | 'STOPPED',
    angle: 0,
    velocity: 0,
    timeInPhase: 0,
    lastFrameTime: 0,
    finished: false,
    targetIndex: -1,
  });

  const sliceAngle = TWO_PI / Math.max(1, punishments.length);

  const textLayouts = useMemo(() => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) return punishments.map(p => ({
      text: p.title.toUpperCase().substring(0, 15),
      font: '900 18px "Russo One", sans-serif',
    }));

    const maxW = RADIUS - 100;
    const maxFontSize = 32;
    const minFontSize = 11;

    return punishments.map(p => {
      const originalText = p.title.toUpperCase();
      let fontSize = maxFontSize;
      let text = originalText;
      let fits = false;

      while (fontSize >= minFontSize && !fits) {
        tempCtx.font = `900 ${fontSize}px "Russo One", sans-serif`;
        const textWidth = tempCtx.measureText(text).width;

        if (textWidth > maxW) {
          fontSize -= 2;
          continue;
        }

        const r_inner = Math.max(40, (RADIUS - 35) - textWidth);
        const availableHeight = 2 * r_inner * Math.sin(sliceAngle / 2);

        if (fontSize > availableHeight * 0.75) {
          fontSize -= 2;
          continue;
        }

        fits = true;
      }

      if (!fits) {
        fontSize = minFontSize;
        tempCtx.font = `900 ${fontSize}px "Russo One", sans-serif`;
        while (text.length > 3 && tempCtx.measureText(text + '...').width > maxW) {
          text = text.slice(0, -1);
        }
        if (text.length < originalText.length) text += '...';
      }

      return {
        text,
        font: `900 ${fontSize}px "Russo One", sans-serif`,
      };
    });
  }, [punishments, sliceAngle]);

  const drawHub = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.translate(CENTER, CENTER);

    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, TWO_PI);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, TWO_PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, TWO_PI);
    const hubGrad = ctx.createRadialGradient(0, -10, 0, 0, 0, 30);
    hubGrad.addColorStop(0, '#1e293b');
    hubGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = hubGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, TWO_PI);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, TWO_PI);
    ctx.fillStyle = '#dc2626';
    ctx.fill();

    ctx.restore();
  }, []);

  const drawPointer = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.translate(CENTER, 22);

    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    ctx.moveTo(-16, -20);
    ctx.lineTo(16, -20);
    ctx.lineTo(0, 34);
    ctx.closePath();

    const pGrad = ctx.createLinearGradient(0, -20, 0, 34);
    pGrad.addColorStop(0, '#f8fafc');
    pGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = pGrad;
    ctx.fill();

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(0, 20);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();
  }, []);

  const normalizeAngle = useCallback((a: number) => {
    return a - TWO_PI * Math.floor(a / TWO_PI);
  }, []);

  // Main render loop — draws wheel every frame (no offscreen cache needed at this canvas size)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let animationFrameId: number;

    const render = (time: number) => {
      const s = state.current;
      if (!s.lastFrameTime) s.lastFrameTime = time;
      const dt = Math.min((time - s.lastFrameTime) / 1000, 0.1);
      s.lastFrameTime = time;
      s.timeInPhase += dt;

      // Physics
      if (s.phase === 'ACCELERATING') {
        const maxSpeed = 15;
        s.velocity += (maxSpeed - s.velocity) * 2 * dt;
        if (s.timeInPhase >= 1.0) {
          s.phase = 'SPINNING';
          s.timeInPhase = 0;
        }
      } else if (s.phase === 'SPINNING') {
        if (s.timeInPhase >= spinDuration) {
          s.phase = 'DECELERATING';
          s.timeInPhase = 0;
        }
      } else if (s.phase === 'DECELERATING') {
        let friction = 0.5;
        let snapToFinish = false;

        if (s.targetIndex !== -1) {
          const targetCenter = s.targetIndex * sliceAngle + sliceAngle / 2;
          const goalAngle = -Math.PI / 2 - targetCenter;
          const currentNorm = normalizeAngle(s.angle);
          const goalNorm = normalizeAngle(goalAngle);

          let distToGoal = goalNorm - currentNorm;
          if (distToGoal < 0) distToGoal += TWO_PI;

          if (distToGoal < 0.02 && s.velocity < 1.0) {
            s.angle = goalAngle;
            s.velocity = 0;
            snapToFinish = true;
          } else if (s.velocity < 10) {
            const snapDecel = 2.0;
            const desiredVelocity = Math.sqrt(2 * snapDecel * distToGoal);
            if (s.velocity < 5) {
              const blend = 5.0 * dt;
              s.velocity += (desiredVelocity - s.velocity) * blend;
              friction = 0;
            }
          }
        }

        if (!snapToFinish) {
          s.velocity *= Math.max(0, 1 - friction * dt);
        }

        if (s.velocity < 0.05 || snapToFinish) {
          s.velocity = 0;
          s.phase = 'STOPPED';
          if (!s.finished) {
            s.finished = true;
            onStopSpinning();
          }
        }
      }

      s.angle += s.velocity * dt;

      // ── Draw ──
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      ctx.save();
      ctx.translate(CENTER, CENTER);
      ctx.rotate(s.angle);

      // Outer rim
      ctx.beginPath();
      ctx.arc(0, 0, RADIUS + 14, 0, TWO_PI);
      const rimGrad = ctx.createLinearGradient(-RADIUS, -RADIUS, RADIUS, RADIUS);
      rimGrad.addColorStop(0, '#334155');
      rimGrad.addColorStop(0.5, '#1e293b');
      rimGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = rimGrad;
      ctx.fill();

      // Tick marks
      const tickCount = punishments.length * 4;
      for (let i = 0; i < tickCount; i++) {
        const angle = (i / tickCount) * TWO_PI;
        const isMajor = i % 4 === 0;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(RADIUS + 2, 0);
        ctx.lineTo(RADIUS + (isMajor ? 12 : 7), 0);
        ctx.strokeStyle = isMajor ? '#64748b' : '#334155';
        ctx.lineWidth = isMajor ? 2 : 1;
        ctx.stroke();
        ctx.restore();
      }

      // Inner shadow ring
      ctx.beginPath();
      ctx.arc(0, 0, RADIUS + 1, 0, TWO_PI);
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Slices
      punishments.forEach((p, i) => {
        const startAngle = i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, RADIUS, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = p.color;
        ctx.fill();

        // Depth gradient
        const depthGrad = ctx.createRadialGradient(0, 0, RADIUS * 0.1, 0, 0, RADIUS);
        depthGrad.addColorStop(0, 'rgba(255,255,255,0.06)');
        depthGrad.addColorStop(0.7, 'rgba(0,0,0,0.0)');
        depthGrad.addColorStop(1, 'rgba(0,0,0,0.15)');
        ctx.fillStyle = depthGrad;
        ctx.fill();

        // Divider line
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(startAngle) * RADIUS, Math.sin(startAngle) * RADIUS);
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Text
        ctx.save();
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        const layout = textLayouts[i];
        ctx.font = layout.font;

        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(layout.text, RADIUS - 30, 0);
        ctx.shadowBlur = 0;

        ctx.restore();
      });

      ctx.restore(); // undo rotation

      // Static elements (hub + pointer)
      drawHub(ctx);
      drawPointer(ctx);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [punishments, spinDuration, sliceAngle, textLayouts, drawHub, drawPointer, normalizeAngle, onStopSpinning]);

  // Trigger spin
  useEffect(() => {
    if (mustSpin) {
      const s = state.current;
      if (s.phase === 'IDLE' || s.phase === 'STOPPED') {
        s.phase = 'ACCELERATING';
        s.timeInPhase = 0;
        s.finished = false;
      }
    }
  }, [mustSpin]);

  // Target update
  useEffect(() => {
    if (targetId) {
      const idx = punishments.findIndex(p => p.id === targetId);
      state.current.targetIndex = idx;
    } else {
      state.current.targetIndex = -1;
    }
  }, [targetId, punishments]);

  return (
    <div ref={containerRef} className="relative aspect-square w-[min(80vw,400px)] sm:w-[460px]">
      {/* Shadow ring behind wheel */}
      <div className="absolute inset-[-4px] rounded-full bg-black/40 blur-xl pointer-events-none" />

      {/* Wheel container */}
      <div className="absolute inset-0 rounded-full border-2 border-slate-800/80 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <canvas ref={canvasRef} className="w-full h-full block" />
        {/* Subtle gloss overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
