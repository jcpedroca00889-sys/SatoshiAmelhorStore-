import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR =
  "a, button, [onClick], [role=button], input, textarea, select";

export default function MouseGlow() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const pos = useRef({ x: -200, y: -200 });
  const glowPos = useRef({ x: -200, y: -200 });
  const raf = useRef(0);
  const isVisible = useRef(false);

  useEffect(() => {
    const el = cursorRef.current;
    const glow = glowRef.current;
    const ring = ringRef.current;
    if (!el || !glow || !ring) return;

    const show = () => {
      if (!isVisible.current) {
        isVisible.current = true;
        el.style.opacity = "1";
      }
    };

    const hide = () => {
      isVisible.current = false;
      el.style.opacity = "0";
    };

    const enterHover = () => {
      ring.style.width = "38px";
      ring.style.height = "38px";
      ring.style.borderColor = "rgba(249,115,22,0.75)";
      ring.style.borderWidth = "2px";
      glow.style.width = "160px";
      glow.style.height = "160px";
    };

    const leaveHover = () => {
      ring.style.width = "24px";
      ring.style.height = "24px";
      ring.style.borderColor = "rgba(249,115,22,0.50)";
      ring.style.borderWidth = "1.5px";
      glow.style.width = "120px";
      glow.style.height = "120px";
    };

    const loop = () => {
      el.style.transform = `translate3d(${pos.current.x}px,${pos.current.y}px,0) translate(-50%,-50%)`;

      const dx = pos.current.x - glowPos.current.x;
      const dy = pos.current.y - glowPos.current.y;
      glowPos.current.x += dx * 0.12;
      glowPos.current.y += dy * 0.12;
      glow.style.transform = `translate3d(${glowPos.current.x}px,${glowPos.current.y}px,0) translate(-50%,-50%)`;

      raf.current = requestAnimationFrame(loop);
    };

    const onMouseMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      show();
    };

    const onMouseLeaveDoc = () => hide();

    const onMouseOver = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest(INTERACTIVE_SELECTOR);
      if (t) enterHover();
    };

    const onMouseOut = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest(INTERACTIVE_SELECTOR);
      if (t) leaveHover();
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeaveDoc, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mouseout", onMouseOut, { passive: true });

    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeaveDoc);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      {/* Glow aura — sem overlay, cada elemento é independente com pointer-events:none */}
      <div
        ref={glowRef}
        className="fixed pointer-events-none z-[100] hidden lg:block rounded-full"
        style={{
          width: 120,
          height: 120,
          marginLeft: -60,
          marginTop: -60,
          background:
            "radial-gradient(circle at center, rgba(249,115,22,0.10) 0%, rgba(249,115,22,0.04) 40%, transparent 70%)",
          transition: "width 0.3s ease, height 0.3s ease",
        }}
      />

      {/* Cursor — anel + ponto */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[100] hidden lg:flex items-center justify-center"
        style={{
          width: 24,
          height: 24,
          marginLeft: -12,
          marginTop: -12,
          opacity: 0,
          transition: "opacity 0.35s ease",
        }}
      >
        <div
          ref={ringRef}
          className="absolute rounded-full"
          style={{
            width: 24,
            height: 24,
            border: "1.5px solid rgba(249,115,22,0.50)",
            transition:
              "width 0.25s ease, height 0.25s ease, border-color 0.2s ease, border-width 0.2s ease",
          }}
        />
        <div
          className="rounded-full"
          style={{
            width: 3,
            height: 3,
            background: "#f97316",
            boxShadow:
              "0 0 6px rgba(249,115,22,0.5), 0 0 12px rgba(249,115,22,0.2)",
          }}
        />
      </div>
    </>
  );
}
