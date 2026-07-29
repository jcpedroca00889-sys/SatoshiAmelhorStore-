import { useState } from "react";
import { motion } from "framer-motion";
import { Star, X, Send, CheckCircle2 } from "lucide-react";
import { addReview } from "../data/reviews";

export default function ReviewFormModal({
  productId, productName, productImage = "", orderId = "", onClose, onSubmitted,
}: {
  productId: string;
  productName: string;
  productImage?: string;
  orderId?: string;
  onClose: () => void;
  onSubmitted?: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) {
      setError("Escreva sua avaliação");
      return;
    }
    addReview({
      productId, orderId, customerName: "Cliente",
      rating, title: title.trim(), content: content.trim(),
    });
    setSubmitted(true);
    onSubmitted?.();
    setTimeout(onClose, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        className="w-full max-w-md glass rounded-2xl border border-border/30 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
          <h2 className="text-sm font-semibold text-text-primary">Avaliar Produto</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg glass-card-3d card-shine text-text-tertiary hover:text-text-primary">
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 size={40} className="text-green-400 mx-auto" />
            <p className="text-sm font-semibold text-text-primary">Avaliação enviada!</p>
            <p className="text-xs text-text-tertiary">Obrigado por compartilhar sua experiência</p>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Product info */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-2/30 border border-border/20">
              <span className="text-xl">{productImage}</span>
              <span className="text-sm font-medium text-text-primary truncate">{productName}</span>
            </div>

            {/* Stars */}
            <div className="text-center space-y-1">
              <p className="text-xs text-text-secondary font-medium">Sua avaliação</p>
              <div className="flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      className={`transition-colors ${
                        star <= (hoveredStar || rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-border"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-text-tertiary">
                {rating === 5 ? "Excelente!" : rating === 4 ? "Muito bom!" : rating === 3 ? "Bom" : rating === 2 ? "Regular" : "Ruim"}
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">Título (opcional)</label>
              <input
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Resuma sua avaliação"
                className="w-full px-3 py-2.5 rounded-xl border border-border/30 bg-surface-2/30 text-sm text-text-primary placeholder:text-text-tertiary/60 focus:border-orange-500/50 focus:outline-none transition-all"
              />
            </div>

            {/* Content */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">Sua experiência</label>
              <textarea
                value={content} onChange={(e) => { setContent(e.target.value); setError(""); }}
                placeholder="Conte sua experiência com o produto..."
                rows={4}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm text-text-primary placeholder:text-text-tertiary/60 focus:outline-none transition-all resize-y ${
                  error ? "border-red-500/50" : "border-border/30 bg-surface-2/30 focus:border-orange-500/50"
                }`}
              />
              {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
            </div>

            <p className="text-[9px] text-text-tertiary text-center">
              Sua avaliação ajuda outros compradores a escolherem melhores produtos!
            </p>

            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl glass-card-3d card-shine text-white font-medium text-sm"
            >
              <Send size={15} />
              Enviar Avaliação
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
