import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag, X, Minus, Plus, Trash2, ArrowLeft,
  Shield, Clock, MessageCircle, Award, CreditCard,
  MapPin, Truck, Star, ArrowRight,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { productsData } from "../data/products";

export default function CartPageFull() {
  const {
    items, removeItem, updateQuantity, clearCart,
    totalItems, totalPrice, closeCartFullPage, openCheckout,
  } = useCart();
  const { user, openAuthPage } = useAuth();
  const suggestions = useMemo(
    () => productsData.filter((p) => !items.find((i) => i.product.id === p.id)).slice(0, 4),
    [items]
  );

  const formatPrice = (value: number) =>
    "R$ " + value.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const freteGratis = totalPrice >= 200;

  const handleNavigateHome = () => {
    closeCartFullPage();
  };

  const handleSelectProduct = (id: string) => {
    closeCartFullPage();
    window.dispatchEvent(new CustomEvent("open-product", { detail: id }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[70] bg-surface overflow-y-auto"
    >
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <button onClick={closeCartFullPage}
            className="flex items-center gap-2 text-text-secondary hover:text-orange-500 transition-colors touch-target"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Continuar Comprando</span>
          </button>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button onClick={clearCart}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
              >
                Limpar Carrinho
              </button>
            )}
            <button onClick={closeCartFullPage}
              className="p-2 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface-3/50 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <ShoppingBag size={20} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Seu Carrinho</h1>
            <p className="text-xs sm:text-sm text-text-tertiary">
              {totalItems === 0 ? "Nenhum item adicionado" : `${totalItems} item${totalItems !== 1 ? "s" : ""} no carrinho`}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          /* ========== EMPTY STATE ========== */
          <div className="flex flex-col items-center gap-6 py-16 sm:py-24">
            <div className="w-24 h-24 rounded-3xl bg-surface-3/40 flex items-center justify-center">
              <ShoppingBag size={48} className="text-text-tertiary/30" />
            </div>
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-text-primary">Seu carrinho está vazio</h2>
              <p className="text-sm text-text-tertiary mt-1 max-w-sm">
                Adicione produtos incríveis da Satoshi Store para começar suas compras
              </p>
            </div>
            <motion.button onClick={handleNavigateHome}
              className="px-6 py-3 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              Explorar Produtos <ArrowRight size={16} />
            </motion.button>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="w-full max-w-2xl mt-8">
                <h3 className="text-sm font-semibold text-text-primary mb-4 text-center">Produtos que você pode gostar</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {suggestions.map((p) => (
                    <button key={p.id} onClick={() => handleSelectProduct(p.id)}
                      className="glass rounded-xl overflow-hidden text-left hover:border-orange-500/30 transition-all group"
                    >
                      <div className="aspect-square flex items-center justify-center text-2xl" style={{ backgroundColor: p.color + "15" }}>
                        {p.image}
                      </div>
                      <div className="p-2">
                        <p className="text-[10px] font-medium text-text-primary line-clamp-1 group-hover:text-orange-500 transition-colors">{p.name}</p>
                        <p className="text-[10px] font-semibold text-orange-500 mt-0.5">{p.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========== ITEMS LIST ========== */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Items - 2/3 width */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item, i) => (
                <motion.div key={item.product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 sm:gap-5 p-3 sm:p-5 rounded-2xl bg-surface-3/15 border border-border/30 group hover:border-orange-500/20 transition-all"
                >
                  {/* Image */}
                  <div onClick={() => handleSelectProduct(item.product.id)} className="cursor-pointer shrink-0"
                    style={{ backgroundColor: item.product.color + "20" }}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl">
                      {item.product.image}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 onClick={() => handleSelectProduct(item.product.id)}
                      className="text-xs sm:text-sm font-medium text-text-primary truncate group-hover:text-orange-500 transition-colors cursor-pointer"
                    >
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-text-tertiary mt-0.5">{item.product.category}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} size={8} className={s < item.product.rating ? "text-yellow-500 fill-yellow-500" : "text-surface-4"} />
                      ))}
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div className="text-right hidden sm:block min-w-[80px]">
                    <p className="text-xs text-text-tertiary">Unit.</p>
                    <p className="text-xs font-semibold text-orange-500">{formatPrice(item.product.priceNumber)}</p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-0.5 glass rounded-lg sm:rounded-xl p-0.5">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 sm:p-1.5 rounded-md text-text-tertiary hover:text-orange-500 hover:bg-orange-500/10 transition-colors"
                    ><Minus size={12} /></button>
                    <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium text-text-primary">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 sm:p-1.5 rounded-md text-text-tertiary hover:text-orange-500 hover:bg-orange-500/10 transition-colors"
                    ><Plus size={12} /></button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[60px] sm:min-w-[90px]">
                    <p className="text-xs text-text-tertiary hidden sm:block">Subtotal</p>
                    <p className="text-xs sm:text-sm font-semibold text-text-primary">{formatPrice(item.product.priceNumber * item.quantity)}</p>
                  </div>

                  {/* Remove */}
                  <button onClick={() => removeItem(item.product.id)}
                    className="p-1.5 sm:p-2 rounded-lg text-text-tertiary hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  ><Trash2 size={14} /></button>
                </motion.div>
              ))}
            </div>

            {/* Summary - 1/3 width */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 glass rounded-2xl border border-border/30 p-5 sm:p-6 space-y-4">
                <h3 className="text-sm sm:text-base font-semibold text-text-primary border-b border-border/20 pb-3">
                  Resumo do Pedido
                </h3>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-text-tertiary">
                    <span>Subtotal ({totalItems} itens)</span>
                    <span className="text-text-primary font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-tertiary">
                    <span className="flex items-center gap-1.5"><Shield size={12} /> Taxa de serviço</span>
                    <span className="text-green-400 font-medium">Grátis</span>
                  </div>
                  <div className="flex items-center justify-between text-text-tertiary">
                    <span className="flex items-center gap-1.5">
                      {freteGratis ? <Truck size={12} className="text-green-400" /> : <MapPin size={12} />}
                      Entrega Digital
                    </span>
                    <span className={freteGratis ? "text-green-400 font-medium" : ""}>
                      {freteGratis ? "Grátis" : formatPrice(0)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/20 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-semibold text-text-primary">Total</span>
                    <span className="text-lg sm:text-xl font-bold text-orange-500">{formatPrice(totalPrice)}</span>
                  </div>
                  {totalPrice > 0 && (
                    <p className="text-[10px] sm:text-xs text-text-tertiary flex items-center gap-1 mt-1">
                      <CreditCard size={12} />
                      ou <span className="text-text-primary font-medium">12x de {formatPrice(totalPrice / 12)}</span> sem juros
                    </p>
                  )}
                </div>

                <motion.button
                  onClick={user ? openCheckout : openAuthPage}
                  className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl sm:rounded-2xl text-sm sm:text-base transition-all shadow-lg shadow-orange-500/20"
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingBag size={18} />
                  Finalizar Compra
                </motion.button>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-text-tertiary border-t border-border/20 pt-3">
                  <span className="flex items-center gap-1"><Shield size={11} className="text-green-400" /> Compra Segura</span>
                  <span className="flex items-center gap-1"><Clock size={11} className="text-orange-400" /> Entrega Imediata</span>
                  <span className="flex items-center gap-1"><MessageCircle size={11} className="text-orange-500" /> Suporte via Chat</span>
                  <span className="flex items-center gap-1"><Award size={11} className="text-yellow-500" /> Garantia 7 dias</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
