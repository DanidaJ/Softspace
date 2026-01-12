import React, { useState, useEffect, useRef } from 'react';

export const BlackHole: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [thought, setThought] = useState('');
  const [isReleasing, setIsReleasing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Particle system state
  const particles = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with DPI awareness
    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Initialize accretion disk particles
    const initParticles = () => {
      const p = [];
      const count = 1400; // Higher density for a fuller accretion disk
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 200 + Math.random() * 400; // Wider disk for bigger black hole
        p.push({
          angle,
          distance,
          speed: 0.001 + (200 / distance) * 0.002,
          length: Math.random() * 60 + 30, // Longer arcs compensate for fewer particles
          width: Math.random() * 3 + 1.5,
          // Blue Palette: Cyan, Blue, Deep Blue, White
          color: Math.random() > 0.8 ? '#ffffff' : 
                 Math.random() > 0.6 ? '#a5f3fc' : // Cyan-200
                 Math.random() > 0.4 ? '#60a5fa' : // Blue-400
                 '#3b82f6', // Blue-500
          yOffset: (Math.random() - 0.5) * 25
        });
      }
      particles.current = p;
    };
    initParticles();

    // Animation Loop
    const animate = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const centerX = width / 2;
      const centerY = height / 2;

      // Clear with trail effect for motion blur feel
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // More trail for smoother continuous effect
      ctx.fillRect(0, 0, width, height);

      // Physics constants
      const tilt = 0.15; // Flatter tilt for the main disk
      const holeRadius = 180; // Much larger black hole
      
      // Helper to convert hex color to rgba with alpha
      const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };
      
      // Helper to draw a smooth curved arc of light
      const drawArc = (x: number, y: number, z: number, p: any, scale: number, alpha: number) => {
         // Draw smooth arc using quadratic curve (much faster than multiple line segments)
         const arcLength = p.length * 0.008;
         const endAngle = p.angle - arcLength;
         
         const startX = Math.cos(p.angle) * p.distance;
         const startY = Math.sin(p.angle) * p.distance * tilt;
         const endX = Math.cos(endAngle) * p.distance;
         const endY = Math.sin(endAngle) * p.distance * tilt;
         const midAngle = (p.angle + endAngle) / 2;
         const controlX = Math.cos(midAngle) * p.distance;
         const controlY = Math.sin(midAngle) * p.distance * tilt;
         
         ctx.beginPath();
         ctx.moveTo(centerX + startX, centerY + startY);
         ctx.quadraticCurveTo(
           centerX + controlX, centerY + controlY,
           centerX + endX, centerY + endY
         );
         
         ctx.strokeStyle = p.color;
         ctx.lineWidth = p.width * scale;
         ctx.lineCap = 'round';
         ctx.globalAlpha = alpha * 0.7; // Slightly transparent for depth
         ctx.stroke();
         ctx.globalAlpha = 1;
      };

      particles.current.forEach(p => {
        p.angle += p.speed * (isReleasing ? 15 : 2);
        
        const cos = Math.cos(p.angle);
        const sin = Math.sin(p.angle);
        
        const x = cos * p.distance;
        const y = sin * p.distance * tilt;
        const z = sin * p.distance; 

        const isBehind = z < 0;
        
        // 1. Draw Back Particles (Real position)
        if (isBehind) {
           const distFromCenter = Math.sqrt(x*x + y*y);
           
           // Occlusion logic: if it's behind the sphere, don't draw the "flat" version
           if (distFromCenter > holeRadius * 0.95) {
             const scale = 1 - (Math.abs(z) / 1000);
             drawArc(x, y, z, p, scale, 0.5);
           }
        }
      });

      // 3. Draw The Black Hole (Event Horizon)
      // Blue Glow
      const gradient = ctx.createRadialGradient(centerX, centerY, holeRadius * 0.85, centerX, centerY, holeRadius * 1.5);
      gradient.addColorStop(0, '#000');
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)'); // Blue glow
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, holeRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Pure Black Void
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(centerX, centerY, holeRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Photon ring (thin bright circle inside)
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.9)'; // Blue-300
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, holeRadius + 2, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Draw Front Particles
      particles.current.forEach(p => {
        const cos = Math.cos(p.angle);
        const sin = Math.sin(p.angle);
        const x = cos * p.distance;
        const y = sin * p.distance * tilt;
        const z = sin * p.distance;
        
        const isFront = z >= 0;
        
        if (isFront) {
           const scale = 1 + (z / 800);
           drawArc(x, y, z, p, scale, 0.9);
        }
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', updateSize);
    };
  }, [isReleasing]);

  const handleRelease = () => {
    if (!thought.trim()) return;
    
    setIsReleasing(true);
    
    // Animation timing
    setTimeout(() => {
      setThought('');
      setIsReleasing(false);
      setShowSuccess(true);
      setTimeout(() => {
        // Auto-return after 3 seconds
        setShowSuccess(false);
        setShowForm(false);
        setIsReturning(true);
        setTimeout(() => {
          setIsReturning(false);
        }, 2000);
      }, 3000);
    }, 2000); // Match CSS animation duration
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden">
      
      {/* Close Button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 text-white/50 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Canvas Layer with zoom animation */}
      <div className={`absolute inset-0 w-full h-full transition-all duration-[2000ms] ${
        isReleasing ? 'scale-[3] opacity-0 ease-in' : 
        isReturning ? 'scale-100 opacity-100 ease-out' :
        showSuccess ? 'scale-[3] opacity-0' :
        'scale-100 opacity-100'
      }`}>
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-0"
        />
      </div>

      {/* Content Layer */}
      <div className={`relative z-10 w-full px-6 h-full ${
        !showForm && !showSuccess 
          ? 'flex flex-col items-center justify-end pb-16 max-w-md' 
          : 'flex flex-col items-center justify-center max-w-lg'
      }`} style={{ perspective: '1000px' }}>
        
        {!showForm && !showSuccess ? (
          // Initial Button - Smaller
          <button
            onClick={() => setShowForm(true)}
            className="group relative px-8 py-3 rounded-xl bg-gradient-to-r from-blue-900/80 to-indigo-900/80 hover:from-blue-800 hover:to-indigo-800 text-blue-100 font-semibold text-base tracking-wider border border-blue-500/30 transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] overflow-hidden backdrop-blur-sm"
          >
            <span className="relative z-10">RELEASE NEGATIVITY</span>
            <div className="absolute inset-0 bg-blue-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        ) : showForm && !showSuccess ? (
          <div className={`
            transition-all duration-[2000ms] ease-in-out relative w-full
            ${isReleasing ? 'spaghettify' : ''}
          `} style={{ transformStyle: 'preserve-3d' }}>
            <style>{`
              @keyframes spaghettify {
                0% {
                  transform: scale(1) translateZ(0) rotateX(0deg);
                  opacity: 1;
                  filter: blur(0px);
                }
                20% {
                  transform: scale(1.05, 0.95) translateZ(-50px) rotateX(15deg);
                  opacity: 0.9;
                }
                60% {
                  transform: scale(0.2, 8) translateZ(-200px) rotateX(45deg);
                  opacity: 0.5;
                  filter: blur(2px);
                }
                100% {
                  transform: scale(0.01, 30) translateZ(-500px) rotateX(75deg);
                  opacity: 0;
                  filter: blur(6px);
                }
              }
              .spaghettify {
                animation: spaghettify 2s forwards cubic-bezier(0.55, 0.055, 0.675, 0.19);
                transform-style: preserve-3d;
                perspective: 1000px;
              }
            `}</style>

            <div className="bg-black/60 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
              <h3 className="text-2xl font-bold text-center text-blue-100 mb-6 tracking-widest uppercase">Event Horizon</h3>
              
              <textarea
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="What burden do you wish to release?"
                className="w-full h-32 bg-black/50 border border-blue-500/30 rounded-xl p-4 text-blue-50 placeholder-blue-500/50 focus:outline-none focus:border-blue-400 resize-none mb-6 transition-colors"
              />
              
              <button
                onClick={handleRelease}
                disabled={!thought.trim() || isReleasing}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-900/80 to-indigo-900/80 hover:from-blue-800 hover:to-indigo-800 text-blue-100 font-bold tracking-wider border border-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 group overflow-hidden relative"
              >
                <span className="relative z-10">CAST INTO THE VOID</span>
                <div className="absolute inset-0 bg-blue-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-black/60 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(59,130,246,0.2)] animate-fade-in w-full">
            <div className="text-center">
              <div className="text-6xl mb-6 animate-pulse">✨</div>
              <h3 className="text-3xl font-bold text-blue-100 mb-4 tracking-widest uppercase">Singularity Reached</h3>
              <p className="text-blue-200/80 text-lg mb-8">Your burden has been atomized.</p>
              <button 
                onClick={() => {
                  setShowSuccess(false);
                  setShowForm(false);
                  setIsReturning(true);
                  setTimeout(() => {
                    setIsReturning(false);
                  }, 2000); // Match animation duration
                }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-900/80 to-indigo-900/80 hover:from-blue-800 hover:to-indigo-800 text-blue-100 font-bold tracking-wider border border-blue-500/30 transition-all shadow-lg shadow-blue-900/20 group overflow-hidden relative"
              >
                <span className="relative z-10">RETURN</span>
                <div className="absolute inset-0 bg-blue-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
