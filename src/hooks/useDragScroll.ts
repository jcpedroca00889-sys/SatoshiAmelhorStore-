import { useRef, useCallback, useEffect } from "react";

export function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
    moved: false,
    clickPrevented: false,
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Ignora cliques em botões, links, inputs
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input") || target.closest("textarea")) {
      return;
    }

    const s = state.current;
    s.isDragging = true;
    s.startX = e.pageX - (ref.current?.offsetLeft || 0);
    s.startY = e.pageY - (ref.current?.offsetTop || 0);
    s.scrollLeft = ref.current?.scrollLeft || 0;
    s.scrollTop = ref.current?.scrollTop || 0;
    s.moved = false;
    s.clickPrevented = false;

    if (ref.current) {
      ref.current.style.cursor = "grabbing";
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const s = state.current;
    if (!s.isDragging || !ref.current) return;

    const x = e.pageX - (ref.current.offsetLeft || 0);
    const y = e.pageY - (ref.current.offsetTop || 0);
    const dx = x - s.startX;
    const dy = y - s.startY;

    // Só considera como movimento se arrastou mais de 5px (evita falsos positivos em clique)
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      s.moved = true;
      if (!s.clickPrevented) {
        s.clickPrevented = true;
        // Aplica pointer-events:none temporário nos cards pra não disparar onClick
        const cards = ref.current.querySelectorAll("[data-drag-card]");
        cards.forEach((card) => (card as HTMLElement).style.pointerEvents = "none");
      }
    }

    if (s.moved) {
      ref.current.scrollLeft = s.scrollLeft - dx;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    const s = state.current;
    if (!s.isDragging) return;
    s.isDragging = false;

    if (ref.current) {
      ref.current.style.cursor = "";
      // Restaura pointer-events nos cards
      const cards = ref.current.querySelectorAll("[data-drag-card]");
      cards.forEach((card) => (card as HTMLElement).style.pointerEvents = "");
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener("mousemove", handleMouseMove, { passive: false });
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const dragHandlers = {
    onMouseDown: handleMouseDown,
  };

  return { ref, dragHandlers };
}
