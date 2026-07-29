import { useEffect, useRef } from "react";

export default function MouseGlow() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -200, y: -200 });
  const pos = useRef({ x: -200, y: -200 });
  const tail = useRef({ x: -200, y: -200 });
  const raf = useRef(0);

  useEffect(() => {
    const el = cursorRef.current;
    const g = glowRef.current;
    if (!el || !g) return;

    const handleMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const handleLeave = () => {
      mouse.current.x = -500;
      mouse.current.y = -500;
    };

    const loop = () => {
      const dx = mouse.current.x - pos.current.x;
      const dy = mouse.current.y - pos.current.y;
      pos.current.x += dx * 0.3;
      pos.current.y += dy * 0.3;

      const tx = mouse.current.x - tail.current.x;
      const ty = mouse.current.y - tail.current.y;
      tail.current.x += tx * 0.05;
      tail.current.y += ty * 0.05;

      el.style.transform = `translate3d(${pos.current.x}px,${pos.current.y}px,0) translate(-50%,-50%)`;
      g.style.transform = `translate3d(${tail.current.x}px,${tail.current.y}px,0) translate(-50%,-50%)`;

      raf.current = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseleave", handleLeave, { passive: true });
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] hidden lg:block" aria-hidden="true">
      {/* Glow */}
      <div
        ref={glowRef}
        className="absolute will-change-transform rounded-full"
        style={{
          width: 200,
          height: 200,
          marginLeft: -100,
          marginTop: -100,
          background:
            "radial-gradient(circle at center, rgba(56,189,248,0.10) 0%, rgba(56,189,248,0.04) 45%, transparent 70%)",
        }}
      />
      {/* Cursor (ring + dot centralizados) */}
      <div
        ref={cursorRef}
        className="absolute will-change-transform flex items-center justify-center"
        style={{
          width: 20,
          height: 20,
          marginLeft: -10,
          marginTop: -10,
        }}
      >
        {/* Ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: 20,
            height: 20,
            border: "1.5px solid rgba(56,189,248,0.6)",
            boxShadow: "0 0 10px rgba(56,189,248,0.15), inset 0 0 8px rgba(56,189,248,0.08)",
          }}
        />
        {/* Dot (centralizado no ring via flex) */}
        <div
          className="rounded-full"
          style={{
            width: 3,
            height: 3,
            background: "#38bdf8",
            boxShadow: "0 0 6px rgba(56,189,248,0.8), 0 0 16px rgba(56,189,248,0.35)",
          }}
        />
      </div>
    </div>
  );
}
