import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface ConcaveCarouselItem {
  id?: string;
  title: string;
  subtitle?: string;
  image: string;
  iconSvg?: string;
  href?: string;
}

export interface ConcaveCarouselProps {
  items: ConcaveCarouselItem[];
  startIndex?: number;
  aspect?: number;
  curvature?: number; // 0 (flat) to 1 (tight drum wall)
  distance?: number;
  gap?: number;
  radius?: number;
  reflection?: number;
  dim?: number;
  autoplay?: 'drift' | 'step' | 'off';
  speed?: number; // panels per second
  className?: string;
  onItemClick?: (item: ConcaveCarouselItem, index: number) => void;
}

export const ConcaveCarousel: React.FC<ConcaveCarouselProps> = ({
  items,
  startIndex = 0,
  aspect = 0.72,
  curvature = 0.72,
  distance = 4,
  gap = 24,
  radius = 28,
  reflection = 0.08,
  dim = 0.35,
  autoplay = 'drift',
  speed = 0.16,
  className = '',
  onItemClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [currentPos, setCurrentPos] = useState<number>(startIndex);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const isSnappingRef = useRef<boolean>(false);
  const targetPosRef = useRef<number>(startIndex);
  const velocityRef = useRef<number>(0);
  const dragStartRef = useRef<{ x: number; time: number; lastX: number }>({ x: 0, time: 0, lastX: 0 });

  const count = items.length;
  const panelWidth = 240;
  const panelHeight = Math.round(panelWidth / aspect);
  const stepWidth = panelWidth + gap;
  const radiusPx = (stepWidth * count) / (2 * Math.PI * curvature);

  const wrapOffset = useCallback(
    (diff: number) => ((((diff % count) + count * 1.5) % count) - count / 2),
    [count]
  );

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      setCurrentPos((prev) => {
        let next = prev;
        if (isDragging) {
          // Handled in pointer events
        } else if (isSnappingRef.current) {
          const diff = targetPosRef.current - prev;
          if (Math.abs(diff) < 0.005) {
            next = targetPosRef.current;
            isSnappingRef.current = false;
          } else {
            next = prev + diff * Math.min(1, 10 * dt);
          }
        } else if (Math.abs(velocityRef.current) > 0.01) {
          next = prev + velocityRef.current * dt * 60;
          velocityRef.current *= Math.pow(0.92, dt * 60);
        } else if (autoplay === 'drift' && !isHovered) {
          next = prev + speed * dt;
        }

        return ((next % count) + count) % count;
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [autoplay, count, isDragging, isHovered, speed]);

  const snapTo = (idx: number) => {
    const diff = wrapOffset(idx - currentPos);
    targetPosRef.current = currentPos + diff;
    isSnappingRef.current = true;
    velocityRef.current = 0;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    isSnappingRef.current = false;
    velocityRef.current = 0;
    dragStartRef.current = { x: e.clientX, lastX: e.clientX, time: performance.now() };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const now = performance.now();
    const dx = e.clientX - dragStartRef.current.lastX;
    const dt = Math.max((now - dragStartRef.current.time) / 1000, 0.008);

    setCurrentPos((prev) => prev - (dx / stepWidth) * 1.15);
    velocityRef.current = (-dx / stepWidth / dt) * 0.016;

    dragStartRef.current.lastX = e.clientX;
    dragStartRef.current.time = now;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch (_) {}

    if (Math.abs(velocityRef.current) < 0.08) {
      targetPosRef.current = Math.round(currentPos);
      isSnappingRef.current = true;
    }
  };

  const activeIndex = Math.round(currentPos) % count;

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-6xl mx-auto flex flex-col items-center select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Stage with Concave Curve */}
      <div
        ref={stageRef}
        className="relative w-full h-[420px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-visible"
        style={{ perspective: `${distance * panelHeight}px` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >


        {/* Curved Wall Container */}
        <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]">
          {items.map((item, index) => {
            const offset = wrapOffset(index - currentPos);
            const theta = (offset * stepWidth) / radiusPx;
            const x = radiusPx * Math.sin(theta);
            const z = radiusPx * (1 - Math.cos(theta));
            const rotY = -theta * (180 / Math.PI);
            const isCenter = Math.abs(offset) < 0.35;
            const edgeDim = Math.min(dim, Math.pow(Math.abs(theta) / (Math.PI / 2.7), 1.5) * dim);

            return (
              <div
                key={item.id || index}
                onClick={() => {
                  snapTo(index);
                  onItemClick?.(item, index);
                }}
                className={`absolute w-[240px] h-[334px] rounded-[28px] overflow-hidden cursor-pointer transition-shadow duration-300 [transform-style:preserve-3d] shadow-xl`}
                style={{
                  transform: `translate3d(${x.toFixed(2)}px, 0, ${z.toFixed(2)}px) rotateY(${rotY.toFixed(2)}deg)`,
                  zIndex: Math.round((1 - Math.abs(offset) / (count / 2)) * 100),
                  borderRadius: `${radius}px`,
                  WebkitBoxReflect:
                    reflection > 0
                      ? `below 8px linear-gradient(to bottom, rgba(0,0,0,${reflection}) 0%, transparent 42%)`
                      : 'none',
                }}
              >
                {/* Background Image */}
                <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                {/* Navy Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#08193A]/40 via-[#061634]/75 to-[#030E26]/95" />
                {/* Edge Dimming Overlay */}
                <div
                  className="absolute inset-0 bg-[#030D22] pointer-events-none transition-opacity duration-150"
                  style={{ opacity: edgeDim }}
                />

                {/* Card Content */}
                <div className="relative z-10 w-full h-full p-6 flex flex-col items-center text-center justify-start pointer-events-none">
                  {item.iconSvg && (
                    <div
                      className="w-12 h-12 flex items-center justify-center mb-5 drop-shadow-md"
                      dangerouslySetInnerHTML={{ __html: item.iconSvg }}
                    />
                  )}
                  <h4 className="text-[#00E676] text-xl font-extrabold tracking-wide mb-2 leading-snug drop-shadow-md">
                    {item.title}
                  </h4>
                  {item.subtitle && (
                    <p className="text-white/90 text-[11px] font-normal leading-snug max-w-[175px] drop-shadow">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Captions & Controls */}
      <div className="relative w-full max-w-xl mt-6 flex items-center justify-between px-4 z-20">
        <button
          onClick={() => snapTo(Math.round(currentPos) - 1)}
          className="w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-800 flex items-center justify-center shadow-md hover:scale-105 transition-transform"
          aria-label="Previous"
        >
          &#8592;
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="text-xs font-bold text-slate-700 tracking-widest mb-1">
            <span className="text-emerald-600 font-extrabold">
              {String(activeIndex + 1).padStart(2, '0')}
            </span>{' '}
            / {String(count).padStart(2, '0')}
          </div>
          <h3 className="text-lg font-bold text-slate-900">{items[activeIndex]?.title}</h3>
          <p className="text-sm text-slate-500">{items[activeIndex]?.subtitle}</p>
        </div>

        <button
          onClick={() => snapTo(Math.round(currentPos) + 1)}
          className="w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-800 flex items-center justify-center shadow-md hover:scale-105 transition-transform"
          aria-label="Next"
        >
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default ConcaveCarousel;

