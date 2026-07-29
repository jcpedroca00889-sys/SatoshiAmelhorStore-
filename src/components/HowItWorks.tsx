import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, CreditCard, Rocket, ChevronDown } from "lucide-react";

const steps = [
  { icon: ShoppingBag, title: "Escolha o Produto", description: "Navegue por nossa seleção curada de produtos digitais premium.", color: "#6366f1" },
  { icon: CreditCard, title: "Pagamento Seguro", description: "Pagamento 100% seguro via PIX, cartão ou cripto.", color: "#8b5cf6" },
  { icon: Rocket, title: "Receba Imediatamente", description: "Após a confirmação, acesso instantâneo ao produto.", color: "#a78bfa" },
];

export default function HowItWorks() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="como-funciona" className="relative py-6 sm:py-8 scroll-mt-20">
      <div className="max-w-md mx-auto px-4 text-center">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 px-5 py-2.5 glass-card-3d card-shine text-sm text-text-secondary hover:text-orange-500 transition-all duration-300"
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 17 }}
        >
          <span className="w-5 h-5 rounded-md bg-orange-500/20 flex items-center justify-center">
            <Rocket size={12} className="text-orange-500" />
          </span>
          <span className="font-medium">Como Funciona</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={14} className="text-text-tertiary" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden mt-4"
            >
              <div className="glass rounded-xl p-4 space-y-3">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-3"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: step.color + "15" }}
                      >
                        <Icon size={14} style={{ color: step.color }} />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-medium text-orange-500">PASSO {i + 1}</span>
                        <h4 className="text-sm font-medium text-text-primary">{step.title}</h4>
                        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{step.description}</p>
                      </div>
                    </motion.div>
                  );
                })}

                <div className="pt-2 border-t border-border/30">
                  <a
                    href="#todos-produtos"
                    className="block text-center text-xs text-orange-500 hover:text-orange-400 transition-colors py-1 hover:bg-orange-500/5 rounded-lg"
                  >
                    Ver produtos →
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
