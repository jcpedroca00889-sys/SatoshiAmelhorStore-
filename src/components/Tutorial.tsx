import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, MousePointer2, ArrowDown, Search, ShoppingBag } from "lucide-react";

const tips = [
  { icon: MousePointer2, text: "Clique em qualquer produto para ver detalhes", color: "text-satoshi-400" },
  { icon: Search, text: "Use a busca para encontrar produtos", color: "text-purple-400" },
  { icon: ShoppingBag, text: "Adicione ao carrinho e finalize sua compra", color: "text-sky-400" },
  { icon: ArrowDown, text: "Role para explorar todas as seções", color: "text-green-400" },
];

export default function Tutorial() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button - only on desktop */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:flex fixed bottom-24 right-8 z-40 items-center gap-2 px-4 py-2.5 glass-card-3d card-shine rounded-2xl text-text-secondary hover:text-orange-500 shadow-lg transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Ajuda"
      >
        <HelpCircle size={16} className="text-orange-500" />
        <span className="text-xs font-medium">Ajuda</span>
      </motion.button>

      {/* Tutorial popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 hidden md:block"
              onClick={() => setIsOpen(false)}
            />

            {/* Popover */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:block fixed bottom-40 right-8 z-40 w-72 glass rounded-2xl p-5 shadow-[0_10px_50px_rgba(0,0,0,0.3)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <HelpCircle size={14} className="text-orange-500" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">Como usar</span>
                </div>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg glass text-text-tertiary hover:text-text-primary transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={14} />
                </motion.button>
              </div>

              {/* Tips */}
              <div className="space-y-3">
                {tips.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-lg bg-surface-4/50 flex items-center justify-center shrink-0 mt-0.5">
                      <tip.icon size={12} className={tip.color} />
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{tip.text}</p>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-border/40">
                <p className="text-[10px] text-text-tertiary text-center">
                  Dicas rápidas para começar
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
