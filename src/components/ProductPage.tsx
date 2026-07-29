import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Star, Heart, Share2, Check, Shield,
  ChevronDown, ChevronUp, Minus, Plus, ArrowLeft, Package,
  RefreshCw, MessageCircle, Award, Clock,
} from "lucide-react";
import type { Product } from "../data/products";
import { productsData } from "../data/products";
import { useCart } from "../contexts/CartContext";

type TabType = "descricao" | "detalhes" | "especificacoes" | "reviews";

const reviews = [
  { id: 1, name: "Rafael M.", avatar: "👨‍💻", rating: 5, date: "2 semanas atrás", title: "Simplesmente incrível!", content: "Produto superou minhas expectativas. A qualidade é excepcional e a entrega foi instantânea. Recomendo para todos!" },
  { id: 2, name: "Ana L.", avatar: "👩‍🎨", rating: 5, date: "1 mês atrás", title: "Melhor compra do ano", content: "Estou impressionado com a qualidade. Produto veio exatamente como descrito. Atendimento rápido e eficiente." },
  { id: 3, name: "Carlos S.", avatar: "👨‍💼", rating: 4, date: "3 semanas atrás", title: "Muito bom", content: "Produto excelente no geral. Entregou tudo que prometeu. Recomendo!" },
  { id: 4, name: "Juliana M.", avatar: "👩‍🎓", rating: 5, date: "1 semana atrás", title: "Recomendo demais!", content: "Comprei para um projeto e superou todas as expectativas. Qualidade nota 10." },
  { id: 5, name: "Pedro A.", avatar: "👨‍🔧", rating: 4, date: "5 dias atrás", title: "Ótimo custo-benefício", content: "Produto de alta qualidade pelo preço. Entrega muito rápida." },
];

interface ProductPageProps {
  product: Product;
  onClose: () => void;
  onProductSelect: (id: string) => void;
}

export default function ProductPage({ product, onClose, onProductSelect }: ProductPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("descricao");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addItem } = useCart();

  const relatedProducts = useMemo(
    () => productsData.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4),
    [product.category, product.id]
  );

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: "descricao", label: "Descrição" },
    { key: "detalhes", label: "Detalhes" },
    { key: "especificacoes", label: "Especificações" },
    { key: "reviews", label: "Reviews", count: reviews.length },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[70] bg-surface overflow-y-auto"
    >
      {/* Top Bar */}
      <div className="sticky top-0 z-30 glass-premium border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-text-secondary hover:text-orange-500 glass-card-3d card-shine transition-colors touch-target"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium hidden sm:inline">Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-xl glass-card-3d card-shine transition-all touch-target ${isFavorite ? "text-red-500" : "text-text-secondary hover:text-red-400"}`}
              whileTap={{ scale: 0.9 }}
            >
              <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
            </motion.button>
            <motion.button className="p-2 rounded-xl glass-card-3d card-shine text-text-secondary hover:text-orange-500 transition-colors touch-target" whileTap={{ scale: 0.9 }}>
              <Share2 size={18} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-text-tertiary mb-4 sm:mb-6">
          <button onClick={onClose} className="hover:text-orange-500 transition-colors">Home</button>
          <span>/</span>
          <span className="hover:text-orange-500 transition-colors">{product.category}</span>
          <span>/</span>
          <span className="text-text-primary">{product.name}</span>
        </div>

        {/* Hero Section - Gallery + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-10 sm:mb-14">
          {/* Gallery */}
          <div className="space-y-3 sm:space-y-4">
            <div className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-surface-3 group"
              style={{ backgroundColor: product.color + "10" }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="text-[7rem] sm:text-[9rem] lg:text-[12rem] select-none">{product.gallery[selectedImage]}</span>
                </motion.div>
              </AnimatePresence>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-surface/30 via-transparent to-transparent pointer-events-none" />

              {/* Nav arrows */}
              {product.gallery.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === 0 ? product.gallery.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-card-3d card-shine flex items-center justify-center text-text-secondary hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronDown size={20} className="rotate-90" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === product.gallery.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-card-3d card-shine flex items-center justify-center text-text-secondary hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronDown size={20} className="-rotate-90" />
                  </button>
                </>
              )}

              {/* Indicador de imagem */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {product.gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === selectedImage ? "bg-orange-500 w-6" : "bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-none pb-1">
              {product.gallery.map((img, i) => (
                <motion.button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    i === selectedImage
                      ? "ring-2 ring-orange-500 bg-surface-4 scale-105"
                      : "bg-surface-3 hover:bg-surface-4 hover:scale-105"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-xl sm:text-2xl lg:text-3xl">{img}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Info Panel */}
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Badge + Categoria */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium glass-glow text-orange-500">
                  {product.category}
                </span>
                {product.rating >= 4.5 && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    ★ Destaque
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-text-primary tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < product.rating ? "text-yellow-400 fill-yellow-400" : "text-border"}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-text-tertiary">{product.rating}.0</span>
                <span className="text-xs text-text-tertiary">({product.reviewCount} avaliações)</span>
              </div>
            </div>

            {/* Preço */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-orange-500">{product.price}</span>
              <span className="text-sm sm:text-base text-text-tertiary line-through">
                R$ {(product.priceNumber * 1.25).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
              </span>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">-25%</span>
            </div>

            {/* Parcelamento */}
            <p className="text-xs sm:text-sm text-text-tertiary">
              ou <span className="text-text-primary font-medium">12x de R$ {(product.priceNumber / 12).toFixed(2).replace(".", ",")}</span> sem juros
            </p>

            {/* Highlights */}
            <div className="flex flex-wrap gap-2">
              {product.highlights.map((h, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-3/50 text-text-secondary border border-border/50 hover:border-orange-500/30 hover:text-orange-500 transition-all"
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-border/50" />

            {/* Benefícios */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-3/30 border border-border/30">
                <Package size={16} className="text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-text-primary">Entrega Digital</p>
                  <p className="text-[10px] text-text-tertiary">Instantânea</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-3/30 border border-border/30">
                <Shield size={16} className="text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-text-primary">Compra Segura</p>
                  <p className="text-[10px] text-text-tertiary">Dados protegidos</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-3/30 border border-border/30">
                <RefreshCw size={16} className="text-orange-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-text-primary">Suporte</p>
                  <p className="text-[10px] text-text-tertiary">24/7 via chat</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/50" />

            {/* Descrição curta */}
            <div>
              <p className={`text-sm text-text-secondary leading-relaxed ${!isExpanded ? "line-clamp-3" : ""}`}>
                {product.description}
              </p>
              {product.description.length > 120 && (
                <button onClick={() => setIsExpanded(!isExpanded)} className="mt-1 text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1">
                  {isExpanded ? <>Mostrar menos <ChevronUp size={12} /></> : <>Ler mais <ChevronDown size={12} /></>}
                </button>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-3 sm:gap-4 pt-2">
              <div className="flex items-center gap-0.5 glass rounded-xl p-0.5">
                <motion.button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 sm:p-2.5 rounded-lg text-text-secondary hover:text-orange-500 hover:bg-orange-500/10 transition-all touch-target"
                  whileTap={{ scale: 0.9 }}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </motion.button>
                <span className="w-8 sm:w-10 text-center text-sm sm:text-base font-medium text-text-primary">{quantity}</span>
                <motion.button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="p-2 sm:p-2.5 rounded-lg text-text-secondary hover:text-orange-500 hover:bg-orange-500/10 transition-all touch-target"
                  whileTap={{ scale: 0.9 }}
                  disabled={quantity >= 10}
                >
                  <Plus size={16} />
                </motion.button>
              </div>

              <motion.button
                onClick={() => addItem(product, quantity)}
                className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 glass-card-3d card-shine text-white font-semibold rounded-xl sm:rounded-2xl text-sm sm:text-base transition-all touch-target"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingBag size={18} />
                Adicionar ao carrinho
              </motion.button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-text-tertiary">
              <span className="flex items-center gap-1.5"><Shield size={12} className="text-green-400" /> Compra 100% Segura</span>
              <span className="flex items-center gap-1.5"><Clock size={12} className="text-orange-400" /> Entrega Imediata</span>
              <span className="flex items-center gap-1.5"><MessageCircle size={12} className="text-orange-500" /> Suporte via Chat</span>
              <span className="flex items-center gap-1.5"><Award size={12} className="text-yellow-500" /> 7 dias de garantia</span>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mb-10 sm:mb-14">
          {/* Tab Navigation */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-border/50 mb-6 sm:mb-8">
            {tabs.map((tab) => (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium whitespace-nowrap glass-card-3d card-shine transition-colors touch-target ${
                  activeTab === tab.key ? "text-orange-500" : "text-text-tertiary hover:text-text-secondary"
                }`}
                whileTap={{ scale: 0.97 }}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1.5 text-[10px] sm:text-xs bg-surface-3 px-1.5 py-0.5 rounded-full">{tab.count}</span>
                )}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 rounded-full bg-orange-500"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[250px] sm:min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Descrição */}
                {activeTab === "descricao" && (
                  <div className="max-w-3xl">
                    <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-6">
                      {product.description}
                    </p>
                    <h4 className="text-sm sm:text-base font-semibold text-text-primary mb-3 sm:mb-4">📦 O que está incluso:</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {product.whatIncluded.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary p-3 rounded-xl bg-surface-3/20 border border-border/30">
                          <Check size={16} className="text-green-400 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Detalhes */}
                {activeTab === "detalhes" && (
                  <div className="max-w-3xl">
                    <div className="grid grid-cols-1 gap-3">
                      {product.details.map((detail, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-surface-3/20 border border-border/30">
                          <span className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-orange-500">{i + 1}</span>
                          </span>
                          <p className="text-sm text-text-secondary leading-relaxed">{detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Especificações */}
                {activeTab === "especificacoes" && (
                  <div className="max-w-2xl overflow-hidden rounded-xl sm:rounded-2xl border border-border/50">
                    <table className="w-full text-sm">
                      <tbody>
                        {product.specifications.map((spec, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-surface-4/10" : ""}>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-text-tertiary font-medium w-2/5 border-b border-border/20">
                              {spec.label}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-text-primary border-b border-border/20">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Reviews */}
                {activeTab === "reviews" && (
                  <div className="max-w-3xl">
                    {/* Summary */}
                    <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-surface-3/20 border border-border/30 mb-4 sm:mb-6">
                      <div className="text-center">
                        <span className="text-3xl sm:text-4xl font-bold text-orange-500">{product.rating}.0</span>
                        <div className="flex items-center gap-0.5 mt-1 justify-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} className={i < product.rating ? "text-yellow-400 fill-yellow-400" : "text-border"} />
                          ))}
                        </div>
                        <span className="text-xs text-text-tertiary mt-1 block">{product.reviewCount} avaliações</span>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = reviews.filter((r) => r.rating === star).length;
                          const pct = (count / reviews.length) * 100;
                          return (
                            <div key={star} className="flex items-center gap-2 text-xs">
                              <span className="text-text-tertiary w-3">{star}</span>
                              <Star size={10} className="text-yellow-400 fill-yellow-400" />
                              <div className="flex-1 h-1.5 rounded-full bg-surface-4/50 overflow-hidden">
                                <div className="h-full rounded-full bg-orange-500" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-text-tertiary w-6 text-right">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reviews list */}
                    <div className="space-y-3 sm:space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-surface-3/20 border border-border/30 hover:border-orange-500/20 transition-colors">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-xl sm:text-2xl flex-shrink-0">{review.avatar}</span>
                              <div>
                                <h5 className="text-sm font-medium text-text-primary">{review.name}</h5>
                                <span className="text-[10px] sm:text-xs text-text-tertiary">{review.date}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              {Array.from({ length: 5 }).map((_, j) => (
                                <Star key={j} size={10} className={j < review.rating ? "text-yellow-400 fill-yellow-400" : "text-border"} />
                              ))}
                            </div>
                          </div>
                          <h6 className="text-xs sm:text-sm font-medium text-text-primary mb-1">{review.title}</h6>
                          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{review.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-border/50 pt-8 sm:pt-10">
            <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-4 sm:mb-6">
              Produtos Relacionados
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((rel, i) => (
                <motion.button
                  key={rel.id}
                  onClick={() => {
                    onProductSelect(rel.id);
                    setSelectedImage(0);
                    setActiveTab("descricao");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group text-left"
                >
                  <div className="glass-card-3d card-shine rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-orange-500/30 group-hover:shadow-lg group-hover:shadow-orange-500/5">
                    <div className="aspect-square flex items-center justify-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundColor: rel.color + "15" }}>
                      <span className="text-3xl sm:text-4xl">{rel.image}</span>
                    </div>
                    <div className="p-2.5 sm:p-3">
                      <h4 className="text-xs sm:text-sm font-medium text-text-primary line-clamp-1 group-hover:text-orange-500 transition-colors">{rel.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs sm:text-sm font-semibold text-orange-500">{rel.price}</span>
                        <div className="flex items-center gap-0.5">
                          <Star size={8} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-[10px] text-text-tertiary">{rel.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
