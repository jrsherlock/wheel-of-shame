
import React, { useEffect, useRef, useMemo } from 'react';
import { Punishment } from '../types';

interface PunishmentWheelProps {
  mustSpin: boolean;
  punishments: Punishment[];
  targetId: string | null;
  spinDuration: number;
  slowdownDuration: number;
  onStopSpinning: () => void;
}

const CANVAS_SIZE = 1000; // High res for crisp rendering
const CENTER = CANVAS_SIZE / 2;
const RADIUS = 420; // Slightly larger to fill canvas
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

  // Pre-calculate text layout to ensure fit
  const textLayouts = useMemo(() => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Fallback if canvas not available (SSR)
    if (!tempCtx) return punishments.map(p => ({ 
        text: p.title.toUpperCase().substring(0, 15), 
        font: '900 24px "Russo One", sans-serif' 
    }));

    const maxW = RADIUS - 140; // Available width (Radius - margin - hub buffer)
    const maxFontSize = 48;
    const minFontSize = 14;

    return punishments.map(p => {
        const originalText = p.title.toUpperCase();
        let fontSize = maxFontSize;
        let text = originalText;
        
        // Iterative fit: Scale down font until it fits boundaries
        // We limit iterations for performance
        let fits = false;
        while (fontSize >= minFontSize && !fits) {
            tempCtx.font = `900 ${fontSize}px "Russo One", sans-serif`;
            const metrics = tempCtx.measureText(text);
            const textWidth = metrics.width;
            
            // 1. Check horizontal width constraint
            if (textWidth > maxW) {
                fontSize -= 2;
                continue;
            }

            // 2. Check vertical constraint (wedge height)
            // The text starts at `r_inner` distance from center
            const r_inner = Math.max(60, (RADIUS - 50) - textWidth);
            
            // Calculate chord length at that inner radius: 2 * r * sin(theta/2)
            const availableHeight = 2 * r_inner * Math.sin(sliceAngle / 2);
            
            // Text height is approx equal to fontSize. We leave 20% buffer.
            if (fontSize > availableHeight * 0.8) {
                 fontSize -= 2;
                 continue;
            }

            // Both constraints met
            fits = true;
        }

        // If we hit minFontSize and it still doesn't fit width-wise, truncate
        if (!fits) {
             fontSize = minFontSize; // Enforce min size
             tempCtx.font = `900 ${fontSize}px "Russo One", sans-serif`;
             // Truncate until it fits width
             while (text.length > 3 && tempCtx.measureText(text + '...').width > maxW) {
                 text = text.slice(0, -1);
             }
             if (text.length < originalText.length) text += '...';
        }

        return {
            text,
            font: `900 ${fontSize}px "Russo One", sans-serif`
        };
    });
  }, [punishments, sliceAngle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    ctx.scale(dpr, dpr);
    // CSS size handled by container

    let animationFrameId: number;

    const drawWheel = (currentAngle: number) => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      
      // Save context for rotation
      ctx.save();
      ctx.translate(CENTER, CENTER);
      ctx.rotate(currentAngle);

      // 1. Draw Outer Rim (Modern Bezel)
      ctx.beginPath();
      ctx.arc(0, 0, RADIUS + 20, 0, TWO_PI);
      const bezelGrad = ctx.createLinearGradient(-RADIUS, -RADIUS, RADIUS, RADIUS);
      bezelGrad.addColorStop(0, '#334155'); // Slate 700
      bezelGrad.addColorStop(1, '#0f172a'); // Slate 900
      ctx.fillStyle = bezelGrad;
      ctx.fill();
      
      // Bezel Shadow
      ctx.beginPath();
      ctx.arc(0, 0, RADIUS + 2, 0, TWO_PI);
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#020617'; // Match body bg
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // 2. Draw Slices
      punishments.forEach((p, i) => {
        const startAngle = i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, RADIUS, startAngle, endAngle);
        
        // Modern Slice: Base color + Sheen
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // Subtle Radial Gradient for depth
        const depthGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, RADIUS);
        depthGrad.addColorStop(0, 'rgba(255,255,255,0.05)');
        depthGrad.addColorStop(1, 'rgba(0,0,0,0.1)');
        ctx.fillStyle = depthGrad;
        ctx.fill();
        
        // Thick Modern Dividers
        ctx.strokeStyle = '#0f172a'; // Match deep bg
        ctx.lineWidth = 6;
        ctx.stroke();

        // 3. Draw Text
        ctx.save();
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        // Use pre-calculated layout
        const layout = textLayouts[i];
        
        // Text styling
        ctx.font = layout.font;
        const text = layout.text;
        
        // Soft Shadow for readability
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = '#ffffff';
        
        ctx.fillText(text, RADIUS - 50, 0);
        ctx.restore();
      });

      ctx.restore(); // Undo rotation for static elements overlay

      // 4. Center Hub (Modern Floating Button style)
      ctx.save();
      ctx.translate(CENTER, CENTER);
      
      // Outer shadow ring
      ctx.beginPath();
      ctx.arc(0, 0, 60, 0, TWO_PI);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'black';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Hub Body
      ctx.beginPath();
      ctx.arc(0, 0, 55, 0, TWO_PI);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      
      // Inner Hub Face
      ctx.beginPath();
      ctx.arc(0, 0, 45, 0, TWO_PI);
      const hubGrad = ctx.createLinearGradient(-45, -45, 45, 45);
      hubGrad.addColorStop(0, '#0f172a');
      hubGrad.addColorStop(1, '#020617');
      ctx.fillStyle = hubGrad;
      ctx.fill();
      
      // Accent Ring
      ctx.beginPath();
      ctx.arc(0, 0, 45, 0, TWO_PI);
      ctx.strokeStyle = '#ef4444'; // Red accent
      ctx.lineWidth = 4;
      ctx.stroke();

      // Center Dot
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, TWO_PI);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      
      ctx.restore();

      // 5. Draw Pointer (Static at top)
      drawPointer(ctx);
    };

    const drawPointer = (ctx: CanvasRenderingContext2D) => {
        ctx.save();
        ctx.translate(CENTER, 30); // Top of wheel position
        
        // Drop shadow for pointer
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;

        // Pointer Body - Sleek Inverted Triangle
        ctx.beginPath();
        ctx.moveTo(-20, -25); // Top Left
        ctx.lineTo(20, -25);  // Top Right
        ctx.lineTo(0, 45);    // Tip
        ctx.closePath();
        
        // White Glossy Pointer
        const pGrad = ctx.createLinearGradient(-20, -25, 20, -25);
        pGrad.addColorStop(0, '#f8fafc');
        pGrad.addColorStop(1, '#cbd5e1');
        ctx.fillStyle = pGrad;
        ctx.fill();
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Red indicator line
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(0, 25);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.restore();
    };

    const normalizeAngle = (a: number) => {
      return a - TWO_PI * Math.floor(a / TWO_PI);
    };

    const render = (time: number) => {
      const s = state.current;
      if (!s.lastFrameTime) s.lastFrameTime = time;
      const dt = Math.min((time - s.lastFrameTime) / 1000, 0.1);
      s.lastFrameTime = time;
      s.timeInPhase += dt;

      if (s.phase === 'ACCELERATING') {
        const maxSpeed = 15; 
        s.velocity += (maxSpeed - s.velocity) * 2 * dt;
        if (s.timeInPhase >= 1.0) {
          s.phase = 'SPINNING';
          s.timeInPhase = 0;
        }
      } 
      else if (s.phase === 'SPINNING') {
        if (s.timeInPhase >= spinDuration) {
          s.phase = 'DECELERATING';
          s.timeInPhase = 0;
        }
      }
      else if (s.phase === 'DECELERATING') {
        let friction = 0.5;
        let snapToFinish = false;

        // GUIDANCE LOGIC
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
             }
             else if (s.velocity < 10) {
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
      drawWheel(s.angle);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [punishments, spinDuration, textLayouts]);

  // Trigger Spin logic
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

  // Target Update
  useEffect(() => {
    if (targetId) {
        const idx = punishments.findIndex(p => p.id === targetId);
        state.current.targetIndex = idx;
    } else {
        state.current.targetIndex = -1; 
    }
  }, [targetId, punishments]);

  return (
    <div className="relative w-[340px] h-[340px] sm:w-[500px] sm:h-[500px]">
        {/* Wheel Container with heavy shadow */}
        <div className="absolute inset-0 rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.6)] bg-slate-900 border-[4px] border-slate-800 rounded-full overflow-hidden">
             <canvas ref={canvasRef} className="w-full h-full block" />
             
             {/* Modern Gloss overlay (Subtle) */}
             <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
        </div>
    </div>
  );
};
