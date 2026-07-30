import { memo, useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, ShoppingBag, Star, ArrowUpDown, ArrowUp, ArrowDown, Check, RotateCcw, DollarSign, Bell } from "lucide-react";
import { productsData } from "../data/products";
import { useDragScroll } from "../hooks/useDragScroll";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToStock, isUserSubscribed, unsubscribeFromStock } from "../data/stockNotifications";

interface ProductCardHorizProps {
  product: typeof productsData[0];
  index: number;
  onProductId?: string;
  onSelectProduct?: (id: string) => void;
}

function ProductCardHorizComponent({ product, index, onProductId, onSelectProduct }: ProductCardHorizProps) {
  const { addItem } = useCart();
  const { user, openAuthPage } = useAuth();
  const [justAdded, setJustAdded] = useState(false);
  const [notifSent, setNotifSent] = useState(false);

  const isOutOfStock = product.inStock === false;

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.inStock === false) return;
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }, [addItem, product]);

  const handleNotifyMe = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { openAuthPage(); return; }
    if (isUserSubscribed(user.id, product.id)) {
      const subs = JSON.parse(localStorage.getItem("satoshi_stock_notifications") || "[]");
      const sub = subs.find((s: any) => s.userId === user.id && s.productId === product.id && s.notifiedAt === null);
      if (sub) unsubscribeFromStock(sub.id);
      setNotifSent(false);
      return;
    }
    const result = subscribeToStock(user.id, user.email || "", product.id);
    if (result) { setNotifSent(true); setTimeout(() => setNotifSent(false), 2000); }
  }, [user, openAuthPage, product]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onSelectProduct?.(onProductId || product.id)}
      className="group relative cursor-pointer shrink-0"
    >
      <motion.div
        className="card-minimal rounded-2xl overflow-hidden w-[200px] sm:w-[240px] card-shine"
        whileHover={{
          boxShadow: "0 20px 60px rgba(249,115,22,0.1)",
          borderColor: "rgba(249,115,22,0.3)",
          y: -2,
        }}
        transition={{ type: "tween", duration: 0.3 }}
      >
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

          <div className="absolute bottom-2 left-2 z-20">
            <span className="inline-block text-sm sm:text-base font-bold text-orange-500 drop-shadow-lg">
              {product.price}
            </span>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 space-y-1.5">
          <h3 className="text-[11px] sm:text-xs font-semibold text-text-primary leading-tight line-clamp-2 group-hover:text-orange-500 transition-colors duration-300">
            {product.name}
          </h3>

          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={8}
                style={{
                  color: i < product.rating ? "#eab308" : "#334155",
                  fill: i < product.rating ? "#eab308" : "transparent",
                }}
              />
            ))}
          </div>

          {/* Add to Cart / Notify Button */}
          {isOutOfStock ? (
            <motion.button
              onClick={handleNotifyMe}
              className={`relative w-full flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-medium transition-all overflow-hidden ${
                notifSent
                  ? "bg-green-500/15 text-green-400 border border-green-500/30"
                  : "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20"
              }`}
              whileHover={notifSent ? {} : { scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              {notifSent ? (
                <motion.span key="check-notif-h" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                  <Check size={11} /> Assinado!
                </motion.span>
              ) : (
                <><Bell size={10} /> {user && isUserSubscribed(user.id, product.id) ? "Inscrito" : "Avise-me"}</>
              )}
            </motion.button>
          ) : (
            <motion.button
              onClick={handleAddToCart}
              className={`relative w-full flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-medium transition-all overflow-hidden ${
                justAdded
                  ? "bg-green-500/15 text-green-400 border border-green-500/30"
                  : "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border border-orange-500/20"
              }`}
              whileHover={justAdded ? {} : { scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.95 }}
              disabled={justAdded}
            >
              {justAdded && (
                <>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <span key={i} className="sparkle" style={{
                      left: `${20 + Math.random() * 60}%`, top: `${10 + Math.random() * 80}%`,
                      backgroundColor: ["#f97316", "#22c55e", "#eab308", "#a855f7"][i],
                      animationDelay: `${i * 0.08}s`, width: `${3 + Math.random() * 3}px`, height: `${3 + Math.random() * 3}px`,
                    }} />
                  ))}
                </>
              )}
              {justAdded ? (
                <motion.span key="check-h" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                  <Check size={11} className="btn-check" /> Adicionado!
                </motion.span>
              ) : (
                <><ShoppingBag size={11} /> Adicionar</>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
const ProductCardHoriz = memo(ProductCardHorizComponent);

interface ProductCardGridProps {
  product: typeof productsData[0];
  index: number;
  onSelectProduct: (id: string) => void;
}

function ProductCardGridComponent({ product, index, onSelectProduct }: ProductCardGridProps) {
  const { addItem } = useCart();
  const { user, openAuthPage } = useAuth();
  const [justAdded, setJustAdded] = useState(false);
  const [notifSent, setNotifSent] = useState(false);

  const isOutOfStock = product.inStock === false;

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.inStock === false) return;
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }, [addItem, product]);

  const handleNotifyMe = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { openAuthPage(); return; }
    if (isUserSubscribed(user.id, product.id)) {
      const subs = JSON.parse(localStorage.getItem("satoshi_stock_notifications") || "[]");
      const sub = subs.find((s: any) => s.userId === user.id && s.productId === product.id && s.notifiedAt === null);
      if (sub) unsubscribeFromStock(sub.id);
      setNotifSent(false);
      return;
    }
    const result = subscribeToStock(user.id, user.email || "", product.id);
    if (result) { setNotifSent(true); setTimeout(() => setNotifSent(false), 2000); }
  }, [user, openAuthPage, product]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      onClick={() => onSelectProduct(product.id)}
      className="perspective-1000 group cursor-pointer"
    >
      <motion.div
        className="card-minimal rounded-2xl overflow-hidden card-shine"
        whileHover={{
          boxShadow: "0 20px 60px rgba(249,115,22,0.1)",
          borderColor: "rgba(249,115,22,0.3)",
          y: -2,
        }}
        transition={{ type: "tween", duration: 0.3 }}
      >
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

          <div className="absolute bottom-2 left-2 z-20">
            <span className="text-sm sm:text-base font-bold text-orange-500 drop-shadow-lg">
              {product.price}
            </span>
          </div>
        </div>
        <div className="p-3 sm:p-4 space-y-2">
          <h3 className="text-xs sm:text-sm font-semibold text-text-primary leading-tight line-clamp-2 group-hover:text-orange-500 transition-colors duration-300">
            {product.name}
          </h3>

          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={10}
                style={{
                  color: i < product.rating ? "#eab308" : "#334155",
                  fill: i < product.rating ? "#eab308" : "transparent",
                }}
              />
            ))}
            <span className="text-[10px] text-text-tertiary ml-1">({product.reviewCount})</span>
          </div>

          {/* Add to Cart / Notify Button */}
          {isOutOfStock ? (
            <motion.button
              onClick={handleNotifyMe}
              className={`relative w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all overflow-hidden ${
                notifSent
                  ? "bg-green-500/15 text-green-400 border border-green-500/30"
                  : "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20"
              }`}
              whileHover={notifSent ? {} : { scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              {notifSent ? (
                <motion.span key="check-notif-g" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
                  <Check size={13} /> Assinado!
                </motion.span>
              ) : (
                <><Bell size={12} /> {user && isUserSubscribed(user.id, product.id) ? "Inscrito" : "Avise-me"}</>
              )}
            </motion.button>
          ) : (
            <motion.button
              onClick={handleAddToCart}
              className={`relative w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all overflow-hidden ${
                justAdded
                  ? "bg-green-500/15 text-green-400 border border-green-500/30"
                  : "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border border-orange-500/20"
              }`}
              whileHover={justAdded ? {} : { scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.95 }}
              disabled={justAdded}
            >
              {justAdded && (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span key={i} className="sparkle" style={{
                      left: `${20 + Math.random() * 60}%`, top: `${10 + Math.random() * 80}%`,
                      backgroundColor: ["#f97316", "#fb923c", "#22c55e", "#eab308", "#a855f7", "#3b82f6"][i],
                      animationDelay: `${i * 0.08}s`, width: `${4 + Math.random() * 4}px`, height: `${4 + Math.random() * 4}px`,
                    }} />
                  ))}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <span key={`confetti-${i}`} className="confetti-piece" style={{
                      left: `${30 + Math.random() * 40}%`, top: `${40 + Math.random() * 20}%`,
                      backgroundColor: ["#f97316", "#22c55e", "#eab308", "#3b82f6"][i],
                      animationDelay: `${i * 0.1}s`,
                    }} />
                  ))}
                </>
              )}
              {justAdded ? (
                <motion.span key="check-g" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
                  <Check size={13} className="btn-check" /> Adicionado!
                </motion.span>
              ) : (
                <><ShoppingBag size={13} /> Adicionar</>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
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
  }, []);

  useEffect(() => {
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
          <span className="text-xs text-text-tertiary bg-surface-2 px-2 py-0.5 rounded-full">{products.length} itens</span>
        </div>
      </div>
      <div className="relative group/row">
        {canScrollLeft && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-surface-2/80 backdrop-blur-sm border border-border/30 flex items-center justify-center text-text-secondary hover:text-orange-500 shadow-lg"
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          ><ChevronLeft size={16} /></motion.button>
        )}
        <div ref={scrollRef} {...dragHandlers} onScroll={checkScroll}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none pb-2 select-none cursor-grab active:cursor-grabbing"
          style={{ scrollBehavior: "smooth" }}
        >
          {products.map((product, i) => (
            <ProductCardHoriz key={product.id} product={product} index={i} onProductId={product.id} onSelectProduct={onSelectProduct} />
          ))}
        </div>
        {canScrollRight && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-surface-2/80 backdrop-blur-sm border border-border/30 flex items-center justify-center text-text-secondary hover:text-orange-500 shadow-lg"
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          ><ChevronRight size={16} /></motion.button>
        )}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-surface to-transparent pointer-events-none z-[1] opacity-40" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-surface to-transparent pointer-events-none z-[1] opacity-40" />
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
  Streaming: "🎬", Produtividade: "🤖",
  Design: "🎨", Educação: "📚", Segurança: "🔒", Cloud: "☁️",
  Assinaturas: "📋", Cursos: "📖", Software: "💿", "Gift Cards": "🎁",
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

  return (
    <div className="relative mb-4">
      {canScrollLeft && (
        <button onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-surface-2/80 backdrop-blur-sm border border-border/30 flex items-center justify-center text-text-secondary hover:text-orange-500 shadow-lg"
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
              className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl whitespace-nowrap shrink-0 transition-all duration-300 border ${
                isSelected
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-500"
                  : "bg-surface-2/30 border-border/30 text-text-secondary hover:text-orange-500 hover:border-orange-500/20"
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="text-sm font-medium">{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? "bg-orange-500/20 text-orange-400" : "bg-surface-2 text-text-tertiary"}`}>
                {cat.item_count}
              </span>
            </button>
          );
        })}
      </div>
      {canScrollRight && (
        <button onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-surface-2/80 backdrop-blur-sm border border-border/30 flex items-center justify-center text-text-secondary hover:text-orange-500 shadow-lg"
        ><ChevronRight size={18} /></button>
      )}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-surface to-transparent pointer-events-none z-[1]" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface to-transparent pointer-events-none z-[1]" />
    </div>
  );
}

// ==================== Price Range Filter ====================
const PRICE_PRESETS = [
  { label: "Até R$100", min: 0, max: 100 },
  { label: "R$100 - R$500", min: 100, max: 500 },
  { label: "R$500 - R$2.000", min: 500, max: 2000 },
  { label: "R$2.000 - R$5.000", min: 2000, max: 5000 },
  { label: "R$5.000 - R$10.000", min: 5000, max: 10000 },
  { label: "Acima de R$10.000", min: 10000, max: Infinity },
];

interface PriceRangeFilterProps {
  priceMin: number | null;
  priceMax: number | null;
  onPriceMinChange: (v: number | null) => void;
  onPriceMaxChange: (v: number | null) => void;
}

function PriceRangeFilter({ priceMin, priceMax, onPriceMinChange, onPriceMaxChange }: PriceRangeFilterProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const activePreset = PRICE_PRESETS.find(
    (p) => (priceMin ?? -1) === p.min && ((priceMax ?? Infinity) === p.max || (p.max === Infinity && priceMax === null))
  );

  const hasPriceFilter = priceMin !== null || priceMax !== null;

  const handlePreset = (p: typeof PRICE_PRESETS[0]) => {
    onPriceMinChange(p.min);
    onPriceMaxChange(p.max === Infinity ? null : p.max);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs sm:text-sm transition-all ${
          hasPriceFilter
            ? "bg-orange-500/10 border-orange-500/30 text-orange-500"
            : "bg-surface-2/30 border-border/30 text-text-secondary hover:text-orange-500 hover:border-orange-500/20"
        }`}
      >
        <DollarSign size={14} />
        <span>{activePreset ? activePreset.label : "Preço"}</span>
        {hasPriceFilter && (
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setShowDropdown(false)} />
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="absolute top-full mt-1 left-0 z-20 w-52 glass rounded-xl border border-border/50 shadow-xl overflow-hidden p-3"
          >
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">Faixa de Preço</p>

            {/* Custom range inputs */}
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-text-tertiary">R$</span>
                <input
                  type="number"
                  placeholder="Mín"
                  value={priceMin ?? ""}
                  onChange={(e) => onPriceMinChange(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-surface-2/50 border border-border/30 rounded-lg px-6 py-1.5 text-xs text-text-primary placeholder-text-tertiary/50 focus:outline-none focus:border-orange-500/50 transition-colors"
                  min={0}
                />
              </div>
              <span className="text-text-tertiary text-xs">—</span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-text-tertiary">R$</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={priceMax ?? ""}
                  onChange={(e) => onPriceMaxChange(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-surface-2/50 border border-border/30 rounded-lg px-6 py-1.5 text-xs text-text-primary placeholder-text-tertiary/50 focus:outline-none focus:border-orange-500/50 transition-colors"
                  min={0}
                />
              </div>
            </div>

            <div className="space-y-1">
              {PRICE_PRESETS.map((p) => {
                const isActive = activePreset === p;
                return (
                  <button key={p.label} onClick={() => handlePreset(p)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                      isActive
                        ? "bg-orange-500/10 text-orange-500"
                        : "text-text-secondary hover:bg-surface-2/50 hover:text-text-primary"
                    }`}
                  >
                    <span>{p.label}</span>
                    {isActive && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

// ==================== Filtered Grid View ====================
interface FilteredGridViewProps {
  categoryName: string;
  products: typeof productsData;
  totalCount: number;
  onSelectProduct: (id: string) => void;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  priceMin: number | null;
  priceMax: number | null;
  onPriceMinChange: (v: number | null) => void;
  onPriceMaxChange: (v: number | null) => void;
  onClearAll: () => void;
}

function FilteredGridView({
  categoryName, products, totalCount, onSelectProduct,
  sort, onSortChange,
  priceMin, priceMax, onPriceMinChange, onPriceMaxChange, onClearAll,
}: FilteredGridViewProps) {
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortedProducts = useMemo(() => sortProducts(products, sort), [products, sort]);
  const hasAnyFilter = categoryName !== "Todos" || priceMin !== null || priceMax !== null || sort !== "relevance";

  return (
    <div className="mt-3">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{categoryIcons[categoryName] || "📦"}</span>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary">{categoryName}</h3>
            <p className="text-xs sm:text-sm text-text-tertiary">{sortedProducts.length} de {totalCount} produto{sortedProducts.length !== 1 ? "s" : ""}</p>
          </div>

          {/* Clear all filters */}
          {hasAnyFilter && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onClearAll}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2/30 border border-border/30 text-[10px] text-text-tertiary hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
            >
              <RotateCcw size={12} />
              Limpar filtros
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Filter & Sort Toolbar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <PriceRangeFilter
          priceMin={priceMin}
          priceMax={priceMax}
          onPriceMinChange={onPriceMinChange}
          onPriceMaxChange={onPriceMaxChange}
        />

        <div className="relative">
          <button onClick={() => setShowSortMenu(!showSortMenu)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs sm:text-sm transition-all ${
              sort !== "relevance"
                ? "bg-orange-500/10 border-orange-500/30 text-orange-500"
                : "bg-surface-2/30 border-border/30 text-text-secondary hover:text-orange-500 hover:border-orange-500/20"
            }`}
          >
            <ArrowUpDown size={14} />
            {sortOptions.find((o) => o.value === sort)?.label || "Ordenar"}
            {sort !== "relevance" && (
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            )}
          </button>
          {showSortMenu && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setShowSortMenu(false)} />
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-1 left-0 z-20 w-44 glass rounded-xl border border-border/50 shadow-xl overflow-hidden"
              >
                {sortOptions.map((option) => (
                  <button key={option.value} onClick={() => { onSortChange(option.value); setShowSortMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors ${
                      sort === option.value
                        ? "text-orange-500 bg-orange-500/10"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-2/50"
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
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {sortedProducts.map((product, i) => (
          <ProductCardGrid key={product.id} product={product} index={i} onSelectProduct={onSelectProduct} />
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-12"
        >
          <span className="text-5xl">🔍</span>
          <p className="text-sm font-medium text-text-primary">Nenhum produto encontrado</p>
          <p className="text-xs text-text-tertiary">Tente ajustar os filtros ou escolher outra categoria</p>
          <button onClick={onClearAll}
            className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500/10 text-orange-500 text-xs font-medium border border-orange-500/20 hover:bg-orange-500/20 transition-all"
          >
            <RotateCcw size={12} />
            Limpar todos os filtros
          </button>
        </motion.div>
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
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("relevance");

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

  const hasActiveFilters = selectedCategory !== null || priceMin !== null || priceMax !== null || sortOption !== "relevance";

  const allFilteredProducts = useMemo(() => {
    let result = [...productsData];

    // Apply category filter
    if (selectedCategory && selectedCategory !== "todos") {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory);
    }

    // Apply price filter
    if (priceMin !== null) result = result.filter((p) => p.priceNumber >= priceMin);
    if (priceMax !== null) result = result.filter((p) => p.priceNumber <= priceMax);

    // Apply sort
    result = sortProducts(result, sortOption);

    return result;
  }, [selectedCategory, priceMin, priceMax, sortOption]);

  const handleCategoryChange = useCallback((id: string | null, name: string) => {
    setSelectedCategory(id === "todos" ? null : id);
    setSelectedCategoryName(id === "todos" ? "Todos" : name);
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedCategory(null);
    setSelectedCategoryName("Todos");
    setPriceMin(null);
    setPriceMax(null);
    setSortOption("relevance");
  }, []);

  const handleSelect = useCallback((id: string) => onProductSelect(id), [onProductSelect]);

  return (
    <section id="todos-produtos" className="relative py-8 sm:py-12 scroll-mt-20">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-sm text-orange-500 mb-4">
            <Sparkles size={14} />
            <span>
              {hasActiveFilters
                ? selectedCategoryName !== "Todos" ? selectedCategoryName : "Resultados Filtrados"
                : "Todos os Produtos"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Escolha o <span className="gradient-text">Melhor</span> para Você
          </h2>
          <p className="text-text-secondary text-sm sm:text-base mt-1 max-w-xl mx-auto">
            {hasActiveFilters
              ? `${allFilteredProducts.length} produto${allFilteredProducts.length !== 1 ? "s" : ""} encontrado${allFilteredProducts.length !== 1 ? "s" : ""}`
              : "Navegue por categorias e encontre o produto perfeito."}
          </p>
        </motion.div>

        <CategoryFilterBar selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />

        {hasActiveFilters ? (
          <FilteredGridView
            categoryName={selectedCategoryName}
            products={allFilteredProducts}
            totalCount={productsData.length}
            onSelectProduct={handleSelect}
            sort={sortOption}
            onSortChange={setSortOption}
            priceMin={priceMin}
            priceMax={priceMax}
            onPriceMinChange={setPriceMin}
            onPriceMaxChange={setPriceMax}
            onClearAll={handleClearAll}
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
