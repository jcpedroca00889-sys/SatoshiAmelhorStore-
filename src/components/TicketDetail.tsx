import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X, ArrowLeft, Send, CheckCircle2,
  Clock, User, Mail, Tag,
  Loader2,
} from "lucide-react";
import type { Ticket, TicketStatus, TicketMessage } from "../data/tickets";
import {
  TICKET_STATUS_LABELS, TICKET_STATUS_COLORS, TICKET_CATEGORIES,
  addMessageToTicket, updateTicketStatus,
} from "../data/tickets";
import { useAuth } from "../contexts/AuthContext";

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Agora mesmo";
  if (mins < 60) return `${mins} min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getCategoryInfo(categoryId: string) {
  return TICKET_CATEGORIES.find((c) => c.id === categoryId) || { id: "outro", label: "Outro", icon: "📝" };
}

function MessageBubble({ message, isOwn }: {
  message: TicketMessage;
  isOwn: boolean;
}) {
  const isAdmin = message.isAdmin;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex items-start gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
        isAdmin
          ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white"
          : "bg-surface-2 border border-border/30 text-text-secondary"
      }`}>
        {message.authorName.charAt(0).toUpperCase()}
      </div>
      <div className={`max-w-[80%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isAdmin
            ? "bg-orange-500/10 border border-orange-500/20 text-text-primary"
            : "bg-surface-2/70 border border-border/30 text-text-primary"
        }`}>
          {message.text}
        </div>
        <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? "flex-row-reverse" : ""}`}>
          <span className="text-[9px] text-text-tertiary/60">{formatDate(message.createdAt)}</span>
          {isAdmin && (
            <span className="text-[9px] text-orange-500/60 font-medium">Admin</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface TicketDetailProps {
  ticket: Ticket;
  onBack: () => void;
  onClose: () => void;
  isAdminView?: boolean;
  onUpdate?: () => void;
}

export default function TicketDetail({
  ticket, onBack, onClose, isAdminView, onUpdate,
}: TicketDetailProps) {
  const { user: currentUser } = useAuth();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const catInfo = getCategoryInfo(ticket.category);
  const isResolvedOrClosed = ticket.status === "resolved" || ticket.status === "closed";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket.messages.length]);

  const handleSend = async () => {
    const text = message.trim();
    if (!text || !currentUser) return;
    setSending(true);
    addMessageToTicket(ticket.id, {
      authorId: currentUser.id,
      authorName: currentUser.name,
      isAdmin: !!isAdminView,
      text,
    });
    setMessage("");
    setSending(false);
    onUpdate?.();
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    setStatusChanging(true);
    // Auto-add system message
    const statusLabel = TICKET_STATUS_LABELS[newStatus];
    addMessageToTicket(ticket.id, {
      authorId: isAdminView ? (currentUser?.id || "admin") : ticket.userId,
      authorName: isAdminView ? (currentUser?.name || "Admin") : ticket.userName,
      isAdmin: !!isAdminView,
      text: `Status alterado para: ${statusLabel}`,
    });
    updateTicketStatus(ticket.id, newStatus);
    setStatusChanging(false);
    onUpdate?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[70] bg-surface overflow-y-auto"
    >
      {/* ─── Top Bar ─── */}
      <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-3xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-text-secondary hover:text-orange-500 transition-colors touch-target"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">{isAdminView ? "Voltar" : "Voltar"}</span>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">{catInfo.icon}</span>
            <span className="text-sm font-semibold text-text-primary truncate">{ticket.id}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-text-secondary hover:text-orange-500 transition-colors touch-target">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        {/* ─── Ticket Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-border/30 p-5 sm:p-6 mb-5"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-text-primary">{ticket.subject}</h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border ${TICKET_STATUS_COLORS[ticket.status]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    ticket.status === "open" ? "bg-blue-400" :
                    ticket.status === "in_progress" ? "bg-orange-400" :
                    ticket.status === "waiting_user" ? "bg-yellow-400" :
                    ticket.status === "resolved" ? "bg-green-400" : "bg-text-tertiary"
                  }`} />
                  {TICKET_STATUS_LABELS[ticket.status]}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-surface-2/50 text-text-secondary border border-border/30">
                  {catInfo.icon} {catInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* User info for admin */}
          {isAdminView && (
            <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-border/20">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <User size={12} />
                {ticket.userName}
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Mail size={12} />
                {ticket.userEmail}
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Clock size={12} />
                Aberto {formatDate(ticket.createdAt)}
              </div>
              {ticket.orderId && (
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Tag size={12} />
                  Pedido: {ticket.orderId}
                </div>
              )}
            </div>
          )}

          {/* Status actions */}
          {isAdminView && !isResolvedOrClosed && (
            <div className="relative mt-3 pt-3 border-t border-border/20">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-tertiary font-medium">Ações:</span>
                <button
                  onClick={() => handleStatusChange("in_progress")}
                  disabled={statusChanging || ticket.status === "in_progress"}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    ticket.status === "in_progress"
                      ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                      : "text-text-tertiary hover:text-orange-400 hover:bg-orange-500/10 border border-border/30"
                  }`}
                >
                  Assumir
                </button>
                <button
                  onClick={() => handleStatusChange("waiting_user")}
                  disabled={statusChanging}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-text-tertiary hover:text-yellow-400 hover:bg-yellow-500/10 border border-border/30 transition-all"
                >
                  Aguardar Resposta
                </button>
                <button
                  onClick={() => handleStatusChange("resolved")}
                  disabled={statusChanging}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-text-tertiary hover:text-green-400 hover:bg-green-500/10 border border-border/30 transition-all"
                >
                  Resolver
                </button>
              </div>
            </div>
          )}

          {/* User can close own ticket if resolved */}
          {!isAdminView && ticket.status === "resolved" && (
            <div className="mt-3 pt-3 border-t border-border/20">
              <button
                onClick={() => handleStatusChange("closed")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium text-text-tertiary hover:text-green-400 hover:bg-green-500/10 border border-border/30 transition-all"
              >
                <CheckCircle2 size={12} />
                Confirmar e Fechar
              </button>
            </div>
          )}
        </motion.div>

        {/* ─── Messages ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="space-y-3 mb-5"
        >
          {ticket.messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={!isAdminView && !msg.isAdmin}
            />
          ))}
          {statusChanging && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 size={14} className="animate-spin text-orange-500" />
              <span className="text-xs text-text-tertiary">Atualizando...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </motion.div>

        {/* ─── Reply Box ─── */}
        {!isResolvedOrClosed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl border border-border/30 p-3"
          >
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isAdminView ? "Escreva sua resposta como admin..." : "Digite sua mensagem..."}
                  rows={2}
                  className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary/60 focus:outline-none resize-none"
                />
              </div>
              <motion.button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className="p-3 rounded-xl bg-orange-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-orange-600 transition-all shrink-0"
                whileTap={{ scale: 0.95 }}
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </motion.button>
            </div>
            <p className="text-[9px] text-text-tertiary/50 mt-1.5 px-1">Enter para enviar · Shift+Enter para nova linha</p>
          </motion.div>
        )}

        {isResolvedOrClosed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 py-5 rounded-2xl bg-surface-2/30 border border-border/30"
          >
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="text-sm text-text-tertiary">
              Este ticket está {ticket.status === "resolved" ? "resolvido" : "fechado"}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
