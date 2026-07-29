import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Shield } from "lucide-react";
import { useEffect } from "react";
import { termosDeUso, politicaPrivacidade } from "../data/legal";

interface LegalModalProps {
  type: "terms" | "privacy" | null;
  onClose: () => void;
}

export default function LegalModal({ type, onClose }: LegalModalProps) {
  const data = type === "terms" ? termosDeUso : politicaPrivacidade;

  // Escape key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (type) {
      window.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [type, onClose]);

  return (
    <AnimatePresence>
      {type && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative w-full max-w-[600px] max-h-[85vh] flex flex-col rounded-2xl glass-card-3d border border-border/30 shadow-2xl overflow-hidden"
          >
            {/* ── Top bar ── */}
            <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-border/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                  {type === "terms" ? (
                    <FileText size={16} className="text-orange-500" />
                  ) : (
                    <Shield size={16} className="text-orange-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">
                    {data.titulo}
                  </h2>
                  <p className="text-[10px] text-text-tertiary">
                    Versão {data.versao} — {data.data}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-3/50 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Content (scrollable) ── */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {data.secoes.map((secao) => (
                <div key={secao.id}>
                  <h3 className="text-xs font-bold text-orange-500 mb-1.5 uppercase tracking-wider">
                    {secao.titulo}
                  </h3>
                  <div className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-line">
                    {/* Parse bold markers **text** */}
                    {secao.conteudo.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return (
                          <span key={i} className="text-text-primary font-semibold">
                            {part.slice(2, -2)}
                          </span>
                        );
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Bottom close button ── */}
            <div className="shrink-0 px-5 py-3 border-t border-border/20 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-orange-500/15 text-orange-500 hover:bg-orange-500/25 text-xs font-medium transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
