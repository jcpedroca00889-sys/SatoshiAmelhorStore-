import { memo, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Star, Check } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { productsData } from "../data/products";

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
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Use the name to find the full product from data
    const fullProduct = productsData.find(p => p.name === name);
    if (fullProduct) {
      addItem(fullProduct);
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }, [addItem, name]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const el = cardRef.current;
    if (el) {
      el.style.setProperty("--mouse-x", `${x}%`);
      el.style.setProperty("--mouse-y", `${y}%`);
    }
  }, []);

  const stars = Array.from({ length: 5 });

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="perspective-1000"
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.92 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
        onClick={onSelect}
        className="group relative cursor-pointer card-shine"
      >
        <motion.div
          className="card-minimal rounded-2xl overflow-hidden"
          whileHover={{
            boxShadow: "0 20px 60px rgba(249,115,22,0.1), 0 8px 20px rgba(0,0,0,0.2)",
            borderColor: "rgba(249,115,22,0.3)",
            y: -2,
          }}
          transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
        >
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

            {/* Add to Cart Button with Animation */}
            <motion.button
              onClick={handleAddToCart}
              className={`relative w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-sm font-medium transition-all touch-target overflow-hidden ${
                justAdded
                  ? "bg-green-500/15 text-green-400 border border-green-500/30"
                  : "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40"
              }`}
              whileHover={justAdded ? {} : { scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              disabled={justAdded}
            >
              {/* Sparkle particles */}
              {justAdded && (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span
                      key={i}
                      className="sparkle"
                      style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${10 + Math.random() * 80}%`,
                        backgroundColor: ["#f97316", "#fb923c", "#22c55e", "#eab308", "#a855f7", "#3b82f6"][i],
                        animationDelay: `${i * 0.08}s`,
                        width: `${4 + Math.random() * 4}px`,
                        height: `${4 + Math.random() * 4}px`,
                      }}
                    />
                  ))}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <span
                      key={`confetti-${i}`}
                      className="confetti-piece"
                      style={{
                        left: `${30 + Math.random() * 40}%`,
                        top: `${40 + Math.random() * 20}%`,
                        backgroundColor: ["#f97316", "#fb923c", "#22c55e", "#eab308"][i],
                        animationDelay: `${i * 0.1}s`,
                        width: `${4 + Math.random() * 3}px`,
                        height: `${4 + Math.random() * 3}px`,
                      }}
                    />
                  ))}
                </>
              )}
              {justAdded ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1.5"
                >
                  <Check size={14} className="btn-check" />
                  Adicionado!
                </motion.span>
              ) : (
                <>
                  <ShoppingBag size={13} className="sm:size-[15px]" />
                  Adicionar ao carrinho
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default memo(ProductCardComponent);
