import React, { useRef, useState, useCallback } from "react";
import { MoveHorizontal } from "lucide-react";

const BeforeAfterSlider = ({ before, after, label = "", testid = "before-after" }) => {
  const [pos, setPos] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const move = useCallback((clientX) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setPos((x / rect.width) * 100);
  }, []);

  const onDown = () => (dragging.current = true);
  const onUp = () => (dragging.current = false);
  const onMove = (e) => {
    if (!dragging.current) return;
    move(e.touches ? e.touches[0].clientX : e.clientX);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden select-none cursor-ew-resize glass-card"
      onMouseMove={onMove}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchMove={onMove}
      onTouchEnd={onUp}
      data-testid={testid}
    >
      <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      <div className="absolute top-4 right-4 z-10 text-xs font-mono uppercase tracking-widest bg-black/50 backdrop-blur px-3 py-1.5 rounded-full text-glow-soft">After</div>

      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={before} alt="Before" className="absolute inset-0 h-full object-cover" style={{ width: containerRef.current ? containerRef.current.offsetWidth : "100%", maxWidth: "none" }} draggable={false} />
        <div className="absolute top-4 left-4 z-10 text-xs font-mono uppercase tracking-widest bg-black/50 backdrop-blur px-3 py-1.5 rounded-full text-white/70">Before</div>
      </div>

      <div
        className="absolute top-0 bottom-0 w-0.5 bg-glow-soft shadow-[0_0_20px_rgba(184,124,248,0.8)] z-20"
        style={{ left: `${pos}%` }}
      >
        <button
          onMouseDown={onDown}
          onTouchStart={onDown}
          aria-label="Drag to compare"
          data-testid={`${testid}-handle`}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-11 w-11 rounded-full glow-btn flex items-center justify-center text-white"
        >
          <MoveHorizontal size={18} />
        </button>
      </div>

      {label && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-sm bg-black/50 backdrop-blur px-4 py-1.5 rounded-full text-white/80">{label}</div>
      )}
    </div>
  );
};

export default BeforeAfterSlider;
