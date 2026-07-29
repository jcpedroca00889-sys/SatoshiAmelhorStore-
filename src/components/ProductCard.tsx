import { memo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Star, Shield, Clock } from "lucide-react";

interface ProductCardProps {
  name: string;
  category: string;
  price: string;
  rating: number;
  image: string;
  color: string;
  index: number;
  onSelect?: () => void;
}

function ProductCardComponent({ name, category, price, rating, image, color, index, onSelect }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const el = cardRef.current?.querySelector(".glass-card-3d") as HTMLElement | null;
    if (el) {
      el.style.setProperty("--mouse-x", `${x}%`);
      el.style.setProperty("--mouse-y", `${y}%`);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current?.querySelector(".glass-card-3d") as HTMLElement | null;
    if (el) {
      el.style.setProperty("--mouse-x", "50%");
      el.style.setProperty("--mouse-y", "50%");
    }
  }, []);

  const stars = Array.from({ length: 5 });

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000"
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.92 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
        onClick={onSelect}
        className="group relative cursor-pointer preserve-3d card-shine hover:z-10"
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="glass-card-3d rounded-2xl overflow-hidden will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
          whileHover={{
            boxShadow: "0 30px 80px rgba(249,115,22,0.15), 0 10px 30px rgba(0,0,0,0.3)",
            rotateX: 2,
            rotateY: -2,
          }}
          transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
        >
          {/* Glow dinâmico */}
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 will-change-transform"
            style={{
              background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${color}30 0%, transparent 60%)`,
            }}
          />

          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-3">
            <div
              className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-600 ease-out"
              style={{ backgroundColor: color + "15" }}
            >
              <span className="text-4xl sm:text-5xl md:text-6xl select-none">
                {image}
              </span>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-surface/10 to-transparent" />

            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20">
              <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-surface/70 backdrop-blur-sm text-text-secondary border border-border/30">
                {category}
              </span>
            </div>

            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-20">
              <span className="text-lg sm:text-xl font-bold text-orange-500 drop-shadow-lg">
                {price}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-3">
            <h3 className="text-xs sm:text-sm font-semibold text-text-primary leading-tight line-clamp-2 group-hover:text-orange-500 transition-colors duration-300">
              {name}
            </h3>

            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                {stars.map((_, i) => (
                  <Star
                    key={i}
                    size={10}
                    className="sm:size-3"
                    style={{
                      color: i < rating ? "#eab308" : "#334155",
                      fill: i < rating ? "#eab308" : "transparent",
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] sm:text-xs text-text-tertiary">({rating}.0)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] text-text-tertiary">
                <Shield size={10} className="text-green-400" /> Seguro
              </span>
              <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] text-text-tertiary">
                <Clock size={10} className="text-orange-400" /> Instantâneo
              </span>
            </div>

            <motion.button
              className="w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-xl glass-glow text-[11px] sm:text-sm font-medium text-text-secondary hover:text-orange-500 hover:border-orange-500/40 transition-colors touch-target"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ShoppingBag size={13} className="sm:size-[15px]" />
              Adicionar ao carrinho
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default memo(ProductCardComponent);
