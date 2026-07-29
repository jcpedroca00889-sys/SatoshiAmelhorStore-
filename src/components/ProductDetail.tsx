import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ShoppingBag, Star, Heart, Share2, Check, Shield, ChevronDown, ChevronUp, Minus, Plus,
} from "lucide-react";
import type { Product } from "../data/products";
import { productsData } from "../data/products";

type TabType = "descricao" | "detalhes" | "especificacoes" | "reviews";

const reviews = [
  { id: 1, name: "Rafael M.", avatar: "👨‍💻", rating: 5, date: "2 semanas atrás", title: "Simplesmente incrível!", content: "Produto superou minhas expectativas. A qualidade é excepcional e a entrega foi instantânea. Recomendo para todos!" },
  { id: 2, name: "Ana L.", avatar: "👩‍🎨", rating: 5, date: "1 mês atrás", title: "Melhor compra do ano", content: "Estou impressionado com a qualidade. Produto veio exatamente como descrito." },
  { id: 3, name: "Carlos S.", avatar: "👨‍💼", rating: 4, date: "3 semanas atrás", title: "Muito bom", content: "Produto excelente no geral. Entregou tudo que prometeu." },
];

const relatedProducts = productsData.slice(0, 4);

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("descricao");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [startY, setStartY] = useState(0);

  const tabs: { key: TabType; label: string }[] = [
    { key: "descricao", label: "Descrição" },
    { key: "detalhes", label: "Detalhes" },
    { key: "especificacoes", label: "Especificações" },
    { key: "reviews", label: `Reviews (${reviews.length})` },
  ];

  // Touch to close (pull down)
  const handleTouchStart = (e: React.TouchEvent) => setStartY(e.touches[0].clientY);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startY - e.changedTouches[0].clientY < -80) onClose();
  };

  return (      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-black/80 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{ perspective: "1200px" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.92, rotateX: -5 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 25,
          }}
          className="relative w-full sm:max-w-5xl sm:glass sm:rounded-3xl sm:overflow-hidden sm:my-4 sm:mx-auto sm:my-auto min-h-screen sm:min-h-0 preserve-3d"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Close - fixo no topo em mobile */}
        <motion.button
          onClick={onClose}
          className="sticky sm:absolute top-3 left-3 sm:top-4 sm:right-4 sm:left-auto z-20 p-2 sm:p-2.5 rounded-xl glass-card-3d card-shine text-text-secondary hover:text-orange-500 transition-all duration-300 float-right sm:float-none mr-3 sm:mr-0 touch-target"
          whileTap={{ scale: 0.9 }}
          aria-label="Fechar"
        >
          <X size={16} className="sm:size-[18px]" />
        </motion.button>

        {/* Pull indicator - mobile only */}
        <div className="sm:hidden flex justify-center pt-2 pb-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-0">
          {/* Gallery */}
          <div className="relative">
            <div className="relative aspect-square sm:aspect-square bg-surface-3 flex items-center justify-center overflow-hidden">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center w-full h-full"
                style={{ backgroundColor: product.color + "10" }}
              >
                <span className="text-[5rem] xs:text-[6rem] sm:text-[8rem] lg:text-[10rem] select-none">
                  {product.gallery[selectedImage]}
                </span>
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-surface/40 via-transparent to-transparent pointer-events-none" />

              {/* Actions overlay */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex gap-1.5 sm:gap-2">
                <motion.button className="p-2 sm:p-2.5 rounded-xl glass-card-3d card-shine text-white/70 hover:text-red-400 transition-all duration-300 touch-target" whileTap={{ scale: 0.9 }}>
                  <Heart size={14} className="sm:size-4" />
                </motion.button>
                <motion.button className="p-2 sm:p-2.5 rounded-xl glass-card-3d card-shine text-white/70 hover:text-white transition-all duration-300 touch-target" whileTap={{ scale: 0.9 }}>
                  <Share2 size={14} className="sm:size-4" />
                </motion.button>
              </div>

              <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-medium glass-card-3d card-shine text-text-primary">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Thumbnails - horizontal scroll no mobile */}
            <div className="flex gap-1.5 sm:gap-2 p-2 sm:p-4 bg-surface-2/50 overflow-x-auto scrollbar-none">
              {product.gallery.map((img, i) => (
                <motion.button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-12 h-12 sm:w-14 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 ${
                    i === selectedImage ? "ring-2 ring-orange-500 bg-surface-4" : "bg-surface-3 hover:bg-surface-4"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-xl sm:text-2xl">{img}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 overscroll-contain">
              {/* Nome e preço */}
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary tracking-tight leading-tight">{product.name}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < product.rating ? "text-yellow-400 fill-yellow-400" : "text-border"} />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-text-tertiary">({product.reviewCount})</span>
                </div>
                <div className="mt-2 sm:mt-3 flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-500">{product.price}</span>
                  <span className="text-xs sm:text-sm text-text-tertiary line-through">
                    R$ {(product.priceNumber * 1.2).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                  </span>
                  <span className="px-1.5 sm:px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] sm:text-xs font-medium rounded-full">-20%</span>
                </div>
              </div>

              {/* Highlights - wrap */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {product.highlights.map((h, i) => (
                  <span key={i} className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-surface-4/50 text-text-secondary border border-border/50">
                    {h}
                  </span>
                ))}
              </div>

              <div className="border-t border-border/50" />

              {/* Tabs - horizontal scroll no mobile */}
              <div>
                <div className="flex gap-1 overflow-x-auto scrollbar-none -mx-1 px-1 pb-1">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg whitespace-nowrap glass-card-3d card-shine transition-colors shrink-0 touch-target ${
                        activeTab === tab.key ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
                      }`}
                      whileTap={{ scale: 0.97 }}
                    >
                      {tab.label}
                      {activeTab === tab.key && (
                        <motion.div layoutId="tab-pill-mobile" className="absolute inset-0 bg-surface-4/50 rounded-lg -z-10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                      )}
                    </motion.button>
                  ))}
                </div>

                <div className="mt-3 sm:mt-4 min-h-[180px] sm:min-h-[200px]">
                  <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                      {/* DESCRIÇÃO */}
                      {activeTab === "descricao" && (
                        <div>
                          <p className={`text-text-secondary leading-relaxed text-xs sm:text-sm ${!isExpanded ? "line-clamp-3 sm:line-clamp-4" : ""}`}>
                            {product.description}
                          </p>
                          {product.description.length > 150 && (
                            <button onClick={() => setIsExpanded(!isExpanded)} className="mt-1.5 text-[11px] sm:text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1">
                              {isExpanded ? <>Mostrar menos <ChevronUp size={11} /></> : <>Ler mais <ChevronDown size={11} /></>}
                            </button>
                          )}
                          <div className="mt-4 sm:mt-5">
                            <h4 className="text-xs sm:text-sm font-medium text-text-primary mb-2 sm:mb-3">O que está incluso:</h4>
                            <ul className="space-y-1.5 sm:space-y-2">
                              {product.whatIncluded.map((item, i) => (
                                <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-text-secondary">
                                  <Check size={12} className="sm:size-[14px] text-green-400 mt-0.5 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* DETALHES */}
                      {activeTab === "detalhes" && (
                        <ul className="space-y-2 sm:space-y-2.5">
                          {product.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-text-secondary">
                              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-orange-500 mt-1.5 sm:mt-2 shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* ESPECIFICAÇÕES */}
                      {activeTab === "especificacoes" && (
                        <div className="overflow-hidden rounded-lg sm:rounded-xl border border-border/50">
                          <table className="w-full text-xs sm:text-sm">
                            <tbody>
                              {product.specifications.map((spec, i) => (
                                <tr key={i} className={i % 2 === 0 ? "bg-surface-4/20" : ""}>
                                  <td className="px-2.5 sm:px-4 py-2 sm:py-3 text-text-tertiary font-medium w-2/5 border-b border-border/30">{spec.label}</td>
                                  <td className="px-2.5 sm:px-4 py-2 sm:py-3 text-text-primary border-b border-border/30">{spec.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* REVIEWS */}
                      {activeTab === "reviews" && (
                        <div className="space-y-3 sm:space-y-4">
                          {reviews.map((review) => (
                            <div key={review.id} className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-surface-4/20 border border-border/30">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <span className="text-lg sm:text-xl">{review.avatar}</span>
                                  <div>
                                    <h5 className="text-xs sm:text-sm font-medium text-text-primary">{review.name}</h5>
                                    <span className="text-[10px] sm:text-xs text-text-tertiary">{review.date}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  {Array.from({ length: 5 }).map((_, j) => (
                                    <Star key={j} size={10} className={j < review.rating ? "text-yellow-400 fill-yellow-400" : "text-border"} />
                                  ))}
                                </div>
                              </div>
                              <h6 className="text-xs sm:text-sm font-medium text-text-primary mb-0.5 sm:mb-1">{review.title}</h6>
                              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{review.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Bottom bar - fixo no mobile */}
            <div className="sticky sm:static bottom-0 p-3 sm:p-5 lg:p-6 border-t border-border/50 bg-surface-2/95 sm:bg-surface-2/50 backdrop-blur-md sm:backdrop-blur-none">
              <div className="flex flex-wrap gap-1.5 sm:gap-3 mb-2.5 sm:mb-3 text-[10px] sm:text-xs text-text-tertiary">
                <span className="flex items-center gap-1"><Shield size={11} className="sm:size-3 text-green-400" /> Compra segura</span>
                <span className="flex items-center gap-1 hidden xs:flex"><Shield size={11} className="sm:size-3 text-orange-500" /> Entrega instantânea</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-0.5 glass rounded-lg sm:rounded-xl p-0.5 sm:p-1">
                  <motion.button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1.5 sm:p-2 rounded-md sm:rounded-lg text-text-secondary hover:text-orange-500 hover:bg-orange-500/10 touch-target" whileTap={{ scale: 0.9 }} disabled={quantity <= 1}>
                    <Minus size={14} className="sm:size-4" />
                  </motion.button>
                  <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium text-text-primary">{quantity}</span>
                  <motion.button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="p-1.5 sm:p-2 rounded-md sm:rounded-lg text-text-secondary hover:text-orange-500 hover:bg-orange-500/10 touch-target" whileTap={{ scale: 0.9 }} disabled={quantity >= 10}>
                    <Plus size={14} className="sm:size-4" />
                  </motion.button>
                </div>

                <motion.button className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3.5 glass-card-3d card-shine text-white font-medium rounded-lg sm:rounded-xl text-sm sm:text-base transition-all touch-target" whileTap={{ scale: 0.98 }}>
                  <ShoppingBag size={16} className="sm:size-[18px]" />
                  Adicionar
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="border-t border-border/50 p-4 sm:p-6 lg:p-8">
          <h3 className="text-sm sm:text-base font-semibold text-text-primary mb-4 sm:mb-6">Produtos Relacionados</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.filter((p) => p.id !== product.id).slice(0, 4).map((rel, i) => (
              <motion.a key={rel.id} href={`#${rel.id}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }} className="group">
                <div className="glass-card-3d card-shine rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-orange-500/30">
                  <div className="aspect-square flex items-center justify-center" style={{ backgroundColor: rel.color + "15" }}>
                    <span className="text-3xl sm:text-4xl">{rel.image}</span>
                  </div>
                  <div className="p-2.5 sm:p-4">
                    <h4 className="text-[11px] sm:text-sm font-medium text-text-primary line-clamp-1">{rel.name}</h4>
                    <span className="text-xs sm:text-sm font-semibold text-orange-500 mt-0.5 sm:mt-1 block">{rel.price}</span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
