import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, X, Minus, Plus, Trash2,
  Shield, Clock, MessageCircle, Award, CreditCard,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

export default function CartPage() {
  const {
    items, removeItem, updateQuantity, clearCart,
    totalItems, totalPrice, closeCart, isCartOpen, openCheckout,
  } = useCart();
  const { user, openAuthPage } = useAuth();

  const formatPrice = (value: number) =>
    "R$ " + value.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto"
          onClick={closeCart}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl mx-4 my-8 sm:my-16 bg-surface/95 backdrop-blur-xl rounded-3xl border border-border/30 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <ShoppingBag size={18} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-text-primary">Carrinho</h2>
                  <p className="text-[10px] sm:text-xs text-text-tertiary">
                    {totalItems === 0 ? "Vazio" : `${totalItems} item${totalItems !== 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <motion.button
                    onClick={clearCart}
                    className="px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    Limpar
                  </motion.button>
                )}
                <motion.button
                  onClick={closeCart}
                  className="p-2 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface-2/50 transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-12 sm:py-16">
                  <div className="w-20 h-20 rounded-2xl bg-surface-2/50 flex items-center justify-center">
                    <ShoppingBag size={36} className="text-text-tertiary/30" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-base sm:text-lg font-semibold text-text-primary">Seu carrinho está vazio</h3>
                    <p className="text-xs sm:text-sm text-text-tertiary mt-1 max-w-xs">
                      Navegue pelos produtos e adicione itens para começar suas compras
                    </p>
                  </div>
                  <motion.button
                    onClick={closeCart}
                    className="px-6 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium shadow-lg shadow-orange-500/20"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Explorar Produtos
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Items list */}
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 -mr-1">
                    {items.map((item, i) => (
                      <motion.div
                        key={item.product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-surface-2/20 border border-border/30 group hover:border-orange-500/20 transition-all"
                      >
                        {/* Image */}
                        <div
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0"
                          style={{ backgroundColor: item.product.color + "20" }}
                        >
                          {item.product.image}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-medium text-text-primary truncate group-hover:text-orange-500 transition-colors">
                            {item.product.name}
                          </h4>
                          <p className="text-[10px] sm:text-xs text-text-tertiary mt-0.5">{item.product.category}</p>
                          <p className="text-xs sm:text-sm font-semibold text-orange-500 mt-1">
                            {formatPrice(item.product.priceNumber)}
                          </p>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center gap-0.5 bg-surface-2/50 border border-border/20 rounded-lg sm:rounded-xl p-0.5">
                          <motion.button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 sm:p-1.5 rounded-md text-text-tertiary hover:text-orange-500 hover:bg-orange-500/10 transition-colors"
                            whileTap={{ scale: 0.9 }}
                          >
                            <Minus size={12} />
                          </motion.button>
                          <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium text-text-primary">
                            {item.quantity}
                          </span>
                          <motion.button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 sm:p-1.5 rounded-md text-text-tertiary hover:text-orange-500 hover:bg-orange-500/10 transition-colors"
                            whileTap={{ scale: 0.9 }}
                          >
                            <Plus size={12} />
                          </motion.button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right min-w-[60px] sm:min-w-[80px]">
                          <p className="text-xs sm:text-sm font-semibold text-text-primary">
                            {formatPrice(item.product.priceNumber * item.quantity)}
                          </p>
                        </div>

                        {/* Remove */}
                        <motion.button
                          onClick={() => removeItem(item.product.id)}
                          className="p-1.5 sm:p-2 rounded-lg text-text-tertiary hover:text-red-400 hover:bg-red-500/5 transition-colors opacity-0 group-hover:opacity-100"
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="border-t border-border/30 pt-4 space-y-3">
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center justify-between text-text-tertiary">
                        <span>Subtotal ({totalItems} itens)</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between text-text-tertiary">
                        <span className="flex items-center gap-1.5"><Shield size={12} /> Taxa de serviço</span>
                        <span className="text-green-400">Grátis</span>
                      </div>
                      <div className="flex items-center justify-between text-text-tertiary">
                        <span className="flex items-center gap-1.5">Entrega Digital</span>
                        <span className="text-green-400">Grátis</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/20">
                      <span className="text-sm sm:text-base font-semibold text-text-primary">Total</span>
                      <span className="text-lg sm:text-xl font-bold text-orange-500">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>

                    {totalPrice > 0 && (
                      <p className="text-[10px] sm:text-xs text-text-tertiary flex items-center gap-1">
                        <CreditCard size={12} />
                        ou em até <span className="text-text-primary font-medium">12x de {formatPrice(totalPrice / 12)}</span> sem juros
                      </p>
                    )}

                    <motion.button
                      onClick={() => { user ? (openCheckout(), closeCart()) : (closeCart(), openAuthPage()); }}
                      className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 bg-orange-500 text-white font-semibold rounded-xl sm:rounded-2xl text-sm sm:text-base shadow-lg shadow-orange-500/20 transition-all touch-target"
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ShoppingBag size={18} />
                      Finalizar Compra
                    </motion.button>

                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-text-tertiary pt-1">
                      <span className="flex items-center gap-1.5"><Shield size={12} className="text-green-400" /> Compra Segura</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} className="text-orange-400" /> Entrega Imediata</span>
                      <span className="flex items-center gap-1.5"><MessageCircle size={12} className="text-orange-500" /> Suporte via Chat</span>
                      <span className="flex items-center gap-1.5"><Award size={12} className="text-yellow-500" /> Garantia 7 dias</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
