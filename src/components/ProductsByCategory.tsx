import { memo, useRef, useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, ShoppingBag, Star, Shield, Clock, ArrowUpDown, ArrowUp, ArrowDown, Check } from "lucide-react";
import { productsData } from "../data/products";
import { useDragScroll } from "../hooks/useDragScroll";
import { useCart } from "../contexts/CartContext";

interface ProductCardHorizProps {
  product: typeof productsData[0];
  index: number;
  onProductId?: string;
  onSelectProduct?: (id: string) => void;
}

function ProductCardHorizComponent({ product, index, onProductId, onSelectProduct }: ProductCardHorizProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (y - 0.5) * -12;
    const rotateY = (x - 0.5) * 12;

    const tilt = tiltRef.current;
    if (tilt) {
      tilt.style.transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      tilt.style.setProperty("--mouse-x", `${x * 100}%`);
      tilt.style.setProperty("--mouse-y", `${y * 100}%`);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    const tilt = tiltRef.current;
    if (tilt) {
      tilt.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)";
      tilt.style.setProperty("--mouse-x", "50%");
      tilt.style.setProperty("--mouse-y", "50%");
    }
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000 shrink-0"
    >
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => onSelectProduct?.(onProductId || product.id)}
        className="group relative cursor-pointer"
      >
        <motion.div
          ref={tiltRef}
          className={`rounded-2xl overflow-hidden w-[200px] sm:w-[240px] card-shine transition-shadow duration-300 ${
            isHovered ? "glass-card-3d glass-border-glow" : "glass-card-3d"
          }`}
          style={{
            transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)",
            transition: "transform 0.15s ease-out, box-shadow 0.3s ease",
          }}
          whileHover={{
            boxShadow: "0 25px 70px rgba(249,115,22,0.18)",
            y: -2,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${product.color}35 0%, transparent 60%)`,
            }}
          />

          <div className="relative aspect-square overflow-hidden bg-surface-3">
            <div
              className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-700 ease-out"
              style={{ backgroundColor: product.color + "15" }}
            >
              <span className="text-3xl sm:text-4xl select-none">{product.image}</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-surface/10 to-transparent" />

            <div className="absolute top-2 left-2 z-20">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface/80 backdrop-blur-sm text-[8px] text-text-secondary border border-border/30">
                {product.category}
              </span>
            </div>

            <div className="absolute bottom-2 left-2 z-20 preserve-3d">
              <motion.span
                className="inline-block text-sm sm:text-base font-bold text-orange-500 drop-shadow-lg card-3d-depth"
                whileHover={{ scale: 1.1, translateZ: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {product.price}
              </motion.span>
            </div>

            <div className="absolute top-2 right-2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-green-500/15 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[7px] text-green-400 font-medium">Disponível</span>
            </div>
          </div>

          <div className="p-2.5 sm:p-3 space-y-1.5">
            <h3 className="text-[11px] sm:text-xs font-semibold text-text-primary leading-tight line-clamp-2 group-hover:gradient-text transition-all duration-300">
              {product.name}
            </h3>

            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04 + i * 0.03 }}
                >
                  <Star
                    size={8}
                    style={{
                      color: i < product.rating ? "#eab308" : "#334155",
                      fill: i < product.rating ? "#eab308" : "transparent",
                    }}
                  />
                </motion.div>
              ))}
              <span className="text-[9px] text-text-tertiary">({product.rating}.0)</span>
            </div>

<div className="flex items-center gap-1.5">
              <motion.span
                className="flex items-center gap-0.5 text-[8px] text-green-400/80"
                whileHover={{ scale: 1.05 }}
              >
                <Shield size={8} /> Seguro
              </motion.span>
              <motion.span
                className="flex items-center gap-0.5 text-[8px] text-orange-400/80"
                whileHover={{ scale: 1.05 }}
              >
                <Clock size={8} /> Instantâneo
              </motion.span>
            </div>

            <motion.button
              className="w-full flex items-center justify-center gap-1 py-1.5 rounded-xl glass-glow text-[10px] font-medium text-text-secondary hover:text-orange-500 hover:border-orange-500/40 transition-colors"
              whileHover={{ scale: 1.04, y: -1, boxShadow: "0 8px 25px rgba(249,115,22,0.2)" }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); addItem(product); }}
            >
              <ShoppingBag size={11} /> Adicionar
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
const ProductCardHoriz = memo(ProductCardHorizComponent);

interface ProductCardGridProps {
  product: typeof productsData[0];
  index: number;
  onSelectProduct: (id: string) => void;
}

function ProductCardGridComponent({ product, index, onSelectProduct }: ProductCardGridProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const tilt = tiltRef.current;
    if (tilt) {
      tilt.style.transform =
        `perspective(1000px) rotateX(${(y - 0.5) * -12}deg) rotateY(${(x - 0.5) * 12}deg) translateZ(8px)`;
      tilt.style.setProperty("--mouse-x", `${x * 100}%`);
      tilt.style.setProperty("--mouse-y", `${y * 100}%`);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    const tilt = tiltRef.current;
    if (tilt) {
      tilt.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)";
      tilt.style.setProperty("--mouse-x", "50%");
      tilt.style.setProperty("--mouse-y", "50%");
    }
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      onClick={() => onSelectProduct(product.id)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000 group cursor-pointer"
    >
      <div
        ref={tiltRef}
        className={`rounded-2xl overflow-hidden card-shine transition-shadow duration-300 ${
          isHovered ? "glass-card-3d glass-border-glow" : "glass-card-3d"
        }`}
        style={{
          transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)",
          transition: "transform 0.15s ease-out, box-shadow 0.3s ease",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${product.color}35 0%, transparent 60%)`,
          }}
        />
        <div
          className="relative aspect-square overflow-hidden bg-surface-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-700"
          style={{ backgroundColor: product.color + "15" }}
        >
          <span className="text-4xl sm:text-5xl select-none">{product.image}</span>
          <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-surface/10 to-transparent" />

          <div className="absolute top-2 left-2 z-20">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface/80 backdrop-blur-sm text-[8px] text-text-secondary border border-border/30">
              {product.category}
            </span>
          </div>

          <div className="absolute top-2 right-2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-green-500/15 border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[7px] text-green-400 font-medium">Disponível</span>
          </div>

          <div className="absolute bottom-2 left-2 z-20 preserve-3d">
            <motion.span
              className="inline-block text-sm sm:text-base font-bold text-orange-500 drop-shadow-lg card-3d-depth"
              whileHover={{ scale: 1.1, translateZ: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {product.price}
            </motion.span>
          </div>
        </div>
        <div className="p-3 sm:p-4 space-y-2">
          <h3 className="text-xs sm:text-sm font-semibold text-text-primary leading-tight line-clamp-2 group-hover:gradient-text transition-all duration-300">
            {product.name}
          </h3>

          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 + i * 0.03 }}
              >
                <Star
                  size={10}
                  style={{
                    color: i < product.rating ? "#eab308" : "#334155",
                    fill: i < product.rating ? "#eab308" : "transparent",
                  }}
                />
              </motion.div>
            ))}
            <span className="text-[10px] text-text-tertiary ml-1">({product.reviewCount})</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-text-tertiary">
            <motion.span className="flex items-center gap-0.5" whileHover={{ scale: 1.05 }}>
              <Shield size={9} className="text-green-400" /> Seguro
            </motion.span>
            <motion.span className="flex items-center gap-0.5" whileHover={{ scale: 1.05 }}>
              <Clock size={9} className="text-orange-400" /> Instantâneo
            </motion.span>
          </div>

          <motion.button
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl glass-glow text-xs font-medium text-text-secondary hover:text-orange-500 hover:border-orange-500/40 transition-colors"
            whileHover={{ scale: 1.03, y: -1, boxShadow: "0 8px 25px rgba(249,115,22,0.2)" }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); addItem(product); }}
          >
            <ShoppingBag size={13} /> Adicionar
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
const ProductCardGrid = memo(ProductCardGridComponent);

// ==================== Category Row (horizontal scroll) ====================
function CategoryRow({
  categoryName, products, catIndex, onSelectProduct,
}: {
  categoryName: string; products: typeof productsData; catIndex: number; onSelectProduct: (id: string) => void;
}) {
  const { ref: scrollRef, dragHandlers } = useDragScroll();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current; if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = useCallback((dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
  }, []);  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });
    return () => { el.removeEventListener("scroll", checkScroll); window.removeEventListener("resize", checkScroll); };
  }, [checkScroll]);

  return (
    <motion.div
      id={`cat-${categoryName.toLowerCase()}`}
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, delay: catIndex * 0.08 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{categoryIcons[categoryName] || "📦"}</span>
          <h3 className="text-base sm:text-lg font-semibold text-text-primary">{categoryName}</h3>
          <span className="text-xs text-text-tertiary bg-surface-3 px-2 py-0.5 rounded-full">{products.length} itens</span>
        </div>
      </div>
      <div className="relative group/row">
        {canScrollLeft && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full glass-glow flex items-center justify-center text-text-secondary hover:text-orange-500 shadow-lg"
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          ><ChevronLeft size={16} /></motion.button>
        )}
        <div ref={scrollRef} {...dragHandlers} onScroll={checkScroll}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none pb-2 select-none cursor-grab active:cursor-grabbing"
          style={{ scrollBehavior: "smooth" }}
        >
          {products.map((product, i) => (
            <div key={product.id} data-drag-card style={{ display: "contents" }}>
              <ProductCardHoriz product={product} index={i} onProductId={product.id} onSelectProduct={onSelectProduct} />
            </div>
          ))}
        </div>
        {canScrollRight && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full glass-glow flex items-center justify-center text-text-secondary hover:text-orange-500 shadow-lg"
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          ><ChevronRight size={16} /></motion.button>
        )}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-surface to-transparent pointer-events-none z-[1] opacity-60" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-surface to-transparent pointer-events-none z-[1] opacity-60" />
      </div>
    </motion.div>
  );
}
const CategoryRowMemo = memo(CategoryRow);

// ==================== Sort Options ====================
type SortOption = "relevance" | "price-asc" | "price-desc" | "rating" | "name";

const sortOptions: { value: SortOption; label: string; icon: typeof ArrowUpDown }[] = [
  { value: "relevance", label: "Relevância", icon: ArrowUpDown },
  { value: "price-asc", label: "Menor Preço", icon: ArrowUp },
  { value: "price-desc", label: "Maior Preço", icon: ArrowDown },
  { value: "rating", label: "Melhor Avaliação", icon: Star },
  { value: "name", label: "A-Z", icon: ArrowUpDown },
];

function sortProducts(products: typeof productsData, sort: SortOption): typeof productsData {
  const sorted = [...products];
  switch (sort) {
    case "price-asc": return sorted.sort((a, b) => a.priceNumber - b.priceNumber);
    case "price-desc": return sorted.sort((a, b) => b.priceNumber - a.priceNumber);
    case "rating": return sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "name": return sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    default: return sorted;
  }
}

// ==================== Category Filter Bar ====================
const categoryIcons: Record<string, string> = {
  Áudio: "🎧", Wearables: "⌚", Câmeras: "📷", Computadores: "💻",
  Games: "🎮", Smartphones: "📱", Streaming: "🎬", Produtividade: "🤖",
  Design: "🎨", Educação: "📚", Segurança: "🔒", Cloud: "☁️", Assinaturas: "📋",
};

interface CategoryFilterBarProps {
  selectedCategory: string | null;
  onCategoryChange: (id: string | null, name: string) => void;
}

function CategoryFilterBar({ selectedCategory, onCategoryChange }: CategoryFilterBarProps) {
  const { ref: scrollRef, dragHandlers: filterDragHandlers } = useDragScroll();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const categoryMap = useMemo(() =>
    productsData.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {} as Record<string, number>),
  []);

  const allCategories = useMemo(() => [
    { id: "todos", name: "Todos", icon: "✨", item_count: productsData.length },
    ...Object.entries(categoryMap).map(([name, count]) => ({ id: name.toLowerCase(), name, icon: categoryIcons[name] || "📦", item_count: count })),
  ], [categoryMap]);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current; if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });
    return () => { el.removeEventListener("scroll", checkScroll); window.removeEventListener("resize", checkScroll); };
  }, [checkScroll]);

  const scroll = useCallback((dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  }, []);

  return (        <div className="relative mb-4">
      {canScrollLeft && (
        <button onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass-glow flex items-center justify-center text-text-secondary hover:text-orange-500 shadow-lg hover:scale-110 transition-transform"
        ><ChevronLeft size={18} /></button>
      )}
      <div ref={scrollRef} {...filterDragHandlers}
        className="flex gap-3 overflow-x-auto scrollbar-none py-2 px-1 cursor-grab active:cursor-grabbing select-none"
        style={{ scrollBehavior: "smooth" }}
      >
        {allCategories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button key={cat.id} onClick={() => onCategoryChange(isSelected ? null : cat.id, cat.name)}
              className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl whitespace-nowrap shrink-0 transition-all duration-300 ${
                isSelected
                  ? "glass-glow text-orange-500 border-orange-500/40"
                  : "glass-premium text-text-secondary hover:text-orange-500 hover:border-orange-500/20 hover:scale-105 hover:-translate-y-0.5"
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="text-sm font-medium">{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? "bg-orange-500/20 text-orange-400" : "bg-surface-3 text-text-tertiary"}`}>
                {cat.item_count}
              </span>
            </button>
          );
        })}
      </div>
      {canScrollRight && (
        <button onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass-glow flex items-center justify-center text-text-secondary hover:text-orange-500 shadow-lg hover:scale-110 transition-transform"
        ><ChevronRight size={18} /></button>
      )}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-surface to-transparent pointer-events-none z-[1]" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface to-transparent pointer-events-none z-[1]" />
    </div>
  );
}

// ==================== Filtered Category View ====================
function FilteredCategoryView({
  categoryName, products, onSelectProduct,
}: {
  categoryName: string; products: typeof productsData; onSelectProduct: (id: string) => void;
}) {
  const [sort, setSort] = useState<SortOption>("relevance");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortedProducts = useMemo(() => sortProducts(products, sort), [products, sort]);

  return (        <div className="mt-3">
      {/* Category header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{categoryIcons[categoryName] || "📦"}</span>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary">{categoryName}</h3>
            <p className="text-xs sm:text-sm text-text-tertiary">{products.length} produto{products.length !== 1 ? "s" : ""} disponíve{products.length !== 1 ? "is" : "l"}</p>
          </div>
        </div>
      </motion.div>

      {/* Sort bar */}
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="relative">
          <button onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl glass-premium text-xs sm:text-sm text-text-secondary hover:text-orange-500 transition-colors"
          >
            <ArrowUpDown size={14} />
            {sortOptions.find((o) => o.value === sort)?.label || "Ordenar"}
          </button>
          {showSortMenu && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setShowSortMenu(false)} />
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-1 left-0 z-20 w-44 glass rounded-xl border border-border/50 shadow-xl overflow-hidden"
              >
                {sortOptions.map((option) => (
                  <button key={option.value} onClick={() => { setSort(option.value); setShowSortMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors ${
                      sort === option.value
                        ? "text-orange-500 bg-orange-500/10"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-3/50"
                    }`}
                  >
                    <option.icon size={14} />
                    <span className="flex-1 text-left">{option.label}</span>
                    {sort === option.value && <Check size={12} />}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </div>

        <span className="text-[10px] sm:text-xs text-text-tertiary">
          {sortedProducts.length} de {products.length} produtos
        </span>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {sortedProducts.map((product, i) => (
          <ProductCardGrid key={product.id} product={product} index={i} onSelectProduct={onSelectProduct} />
        ))}
      </div>

      {/* Empty state */}
      {sortedProducts.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-8">
          <span className="text-4xl">📦</span>
          <p className="text-sm text-text-tertiary">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  );
}

// ==================== Main Component ====================
interface ProductsByCategoryProps {
  onProductSelect: (id: string) => void;
}

export default function ProductsByCategory({ onProductSelect }: ProductsByCategoryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState("Todos");

  const categoryEntries = useMemo(() => {
    return Object.entries(
      productsData.reduce((acc, product) => {
        const cat = product.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
      }, {} as Record<string, typeof productsData>)
    );
  }, []);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory || selectedCategory === "todos") return null;
    return productsData.filter((p) => p.category.toLowerCase() === selectedCategory);
  }, [selectedCategory]);

  const handleCategoryChange = useCallback((id: string | null, name: string) => {
    setSelectedCategory(id);
    setSelectedCategoryName(name);
  }, []);

  const handleSelect = useCallback((id: string) => onProductSelect(id), [onProductSelect]);

  return (
    <section id="todos-produtos" className="relative py-8 sm:py-12 scroll-mt-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-orange-500/5 blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-orange-400/5 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-sm text-orange-500 mb-4">
            <Sparkles size={14} />
            <span>{selectedCategory && selectedCategory !== "todos" ? selectedCategoryName : "Todos os Produtos"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Escolha o <span className="gradient-text">Melhor</span> para Você
          </h2>
          <p className="text-text-secondary text-sm sm:text-base mt-1 max-w-xl mx-auto">
            {selectedCategory && selectedCategory !== "todos"
              ? `Explore todos os produtos de ${selectedCategoryName}`
              : "Navegue por categorias e encontre o produto perfeito."}
          </p>
        </motion.div>

        <CategoryFilterBar selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />

        {/* Filtered view or All categories */}
        {filteredProducts ? (
          <FilteredCategoryView
            categoryName={selectedCategoryName}
            products={filteredProducts}
            onSelectProduct={handleSelect}
          />
        ) : (
          <div className="space-y-6 sm:space-y-8 mt-4">
            {categoryEntries.map(([categoryName, products], catIndex) => (
              <CategoryRowMemo key={categoryName} categoryName={categoryName} products={products} catIndex={catIndex} onSelectProduct={handleSelect} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
