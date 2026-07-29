import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MessageCircle, Plus, ChevronRight,
  Clock, AlertCircle, Search, Send,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  TICKET_CATEGORIES, TICKET_STATUS_LABELS, TICKET_STATUS_COLORS,
  type Ticket, type TicketStatus, type TicketPriority,
  getTicketsByUser, getTicketById, createTicket,
} from "../data/tickets";
import TicketDetail from "./TicketDetail";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  if (days < 7) return `${days} dias atrás`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
};

function getCategoryIcon(catId: string): string {
  return TICKET_CATEGORIES.find((c) => c.id === catId)?.icon || "📝";
}

interface SupportPageProps {
  onClose: () => void;
}

export default function SupportPage({ onClose }: SupportPageProps) {
  const { user, openAuthPage } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");

  // Redirect to auth if not logged in
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-surface overflow-y-auto"
      >
        <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-xl border-b border-border/30">
          <div className="max-w-3xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
            <button onClick={onClose} className="flex items-center gap-2 text-text-secondary hover:text-orange-500 transition-colors touch-target">
              <X size={18} />
              <span className="text-sm font-medium">Fechar</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg">🎫</span>
              <span className="text-sm font-semibold text-text-primary">Suporte</span>
            </div>
            <div className="w-20" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
            <MessageCircle size={28} className="text-orange-500" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">Faça login para abrir um ticket</h3>
          <p className="text-sm text-text-tertiary text-center max-w-sm mb-6">
            Você precisa estar logado para entrar em contato com nosso suporte e acompanhar seus tickets.
          </p>
          <motion.button
            onClick={openAuthPage}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/20"
          >
            Fazer Login
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const tickets = useMemo(() => {
    let list = getTicketsByUser(user.id);
    if (statusFilter !== "all") {
      list = list.filter((t) => t.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [user.id, statusFilter, search, selectedTicket]);

  const openCount = tickets.filter((t) => t.status === "open" || t.status === "in_progress" || t.status === "waiting_user").length;

  if (selectedTicket) {
    return (
      <TicketDetail
        ticket={selectedTicket}
        onBack={() => setSelectedTicket(null)}
        onClose={onClose}
        onUpdate={() => {
          if (selectedTicket) {
            const updated = getTicketById(selectedTicket.id);
            if (updated) setSelectedTicket(updated);
          }
        }}
      />
    );
  }

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
          <button onClick={onClose} className="flex items-center gap-2 text-text-secondary hover:text-orange-500 transition-colors touch-target">
            <X size={18} />
            <span className="text-sm font-medium">Fechar</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">🎫</span>
            <span className="text-sm font-semibold text-text-primary">Suporte</span>
          </div>
          <button
            onClick={() => setShowNewTicket(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-all touch-target"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Novo Ticket</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-5 text-xs"
        >
          <span className="text-text-tertiary">Meus Tickets</span>
          <span className="text-text-secondary font-medium">{tickets.length} total</span>
          {openCount > 0 && (
            <span className="flex items-center gap-1 text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              {openCount} aberto{openCount !== 1 ? "s" : ""}
            </span>
          )}
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border/30 bg-surface-2/30 focus-within:border-orange-500/50 transition-all">
            <Search size={14} className="text-text-tertiary shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tickets..."
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary/60 focus:outline-none"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {(["all", "open", "in_progress", "waiting_user", "resolved", "closed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                  statusFilter === s
                    ? s === "all"
                      ? "bg-orange-500/15 text-orange-500 border border-orange-500/30"
                      : `${TICKET_STATUS_COLORS[s]} border`
                    : "text-text-tertiary hover:text-text-secondary border border-transparent"
                }`}
              >
                {s === "all" ? "Todos" : TICKET_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket List */}
        {tickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-16 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-surface-2/50 border border-border/30 flex items-center justify-center">
              <MessageCircle size={26} className="text-text-tertiary/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Nenhum ticket encontrado</p>
              <p className="text-xs text-text-tertiary mt-1 max-w-xs">
                {search || statusFilter !== "all"
                  ? "Tente alterar os filtros ou buscar por outro termo."
                  : "Você ainda não abriu nenhum ticket de suporte. Clique em \"Novo Ticket\" para começar."}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket, i) => {
              const lastMsg = ticket.messages[ticket.messages.length - 1];
              const catIcon = getCategoryIcon(ticket.category);
              const statusStyle = TICKET_STATUS_COLORS[ticket.status];
              const hasUnread = ticket.status === "in_progress" || ticket.status === "waiting_user";

              return (
                <motion.button
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedTicket(ticket)}
                  className="w-full text-left glass rounded-xl border border-border/30 p-4 hover:border-orange-500/30 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5 shrink-0">{catIcon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium border ${statusStyle}`}>
                              <span className={`w-1 h-1 rounded-full ${
                                ticket.status === "open" ? "bg-blue-400" :
                                ticket.status === "in_progress" ? "bg-orange-400" :
                                ticket.status === "waiting_user" ? "bg-yellow-400" :
                                ticket.status === "resolved" ? "bg-green-400" : "bg-text-tertiary"
                              }`} />
                              {TICKET_STATUS_LABELS[ticket.status]}
                            </span>
                            <span className="text-[9px] text-text-tertiary bg-surface-2/50 px-1.5 py-0.5 rounded-full">
                              {ticket.id}
                            </span>
                            {hasUnread && (
                              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-text-primary line-clamp-1 group-hover:text-orange-500 transition-colors">
                            {ticket.subject}
                          </h4>
                        </div>
                        <ChevronRight size={14} className="text-text-tertiary mt-1 shrink-0 group-hover:text-orange-500 transition-colors" />
                      </div>
                      {lastMsg && (
                        <p className="text-[11px] text-text-tertiary line-clamp-1 mt-1.5">
                          {lastMsg.text}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Clock size={10} className="text-text-tertiary/60" />
                        <span className="text-[9px] text-text-tertiary/60">
                          {formatDate(ticket.updatedAt)}
                        </span>
                        <span className="text-[9px] text-text-tertiary/40">
                          {ticket.messages.length} mensagen{ticket.messages.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* New Ticket Form */}
      <AnimatePresence>
        {showNewTicket && (
          <NewTicketForm
            userId={user.id}
            userName={user.name}
            userEmail={user.email}
            onClose={() => setShowNewTicket(false)}
            onCreated={(ticket) => {
              setShowNewTicket(false);
              setSelectedTicket(ticket);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
//  NEW TICKET FORM
// ════════════════════════════════════════════════════════════

interface NewTicketFormProps {
  userId: string;
  userName: string;
  userEmail: string;
  onClose: () => void;
  onCreated: (ticket: Ticket) => void;
}

function NewTicketForm({ userId, userName, userEmail, onClose, onCreated }: NewTicketFormProps) {
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!category) errs.category = "Selecione uma categoria";
    if (!subject.trim()) errs.subject = "Digite um assunto";
    if (subject.trim().length < 5) errs.subject = "Assunto deve ter pelo menos 5 caracteres";
    if (!description.trim()) errs.description = "Descreva seu problema";
    if (description.trim().length < 10) errs.description = "Descreva com pelo menos 10 caracteres";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    const ticket = createTicket({
      userId,
      userName,
      userEmail,
      category,
      subject: subject.trim(),
      description: description.trim(),
      priority,
    });
    setSubmitting(false);
    onCreated(ticket);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        className="w-full max-w-lg glass rounded-2xl border border-border/30 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30 bg-surface/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎫</span>
            <h2 className="text-sm font-semibold text-text-primary">Novo Ticket</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-2/50 transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Category */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Categoria *</label>
            <div className="grid grid-cols-2 gap-2">
              {TICKET_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setCategory(cat.id); setErrors((prev) => ({ ...prev, category: "" })); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    category === cat.id
                      ? "border-orange-500/50 bg-orange-500/10 text-orange-500"
                      : "border-border/30 bg-surface-2/30 text-text-secondary hover:border-orange-500/30"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="text-left leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
            {errors.category && <p className="text-[10px] text-red-400 mt-1">{errors.category}</p>}
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Assunto *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => { setSubject(e.target.value); setErrors((prev) => ({ ...prev, subject: "" })); }}
              placeholder="Resuma seu problema em poucas palavras"
              className={`w-full px-3 py-2.5 rounded-xl border text-sm bg-surface-2/30 text-text-primary placeholder:text-text-tertiary/60 focus:outline-none transition-all ${
                errors.subject ? "border-red-500/50" : "border-border/30 focus:border-orange-500/50"
              }`}
            />
            {errors.subject && <p className="text-[10px] text-red-400 mt-1">{errors.subject}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Descrição *</label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((prev) => ({ ...prev, description: "" })); }}
              placeholder="Descreva detalhadamente o que está acontecendo..."
              rows={4}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm bg-surface-2/30 text-text-primary placeholder:text-text-tertiary/60 focus:outline-none transition-all resize-y ${
                errors.description ? "border-red-500/50" : "border-border/30 focus:border-orange-500/50"
              }`}
            />
            {errors.description && <p className="text-[10px] text-red-400 mt-1">{errors.description}</p>}
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Prioridade</label>
            <div className="flex gap-2">
              {(["low", "medium", "high", "urgent"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 px-2 py-2 rounded-xl border text-[10px] font-medium transition-all ${
                    priority === p
                      ? p === "urgent"
                        ? "border-red-500/50 bg-red-500/10 text-red-400"
                        : p === "high"
                        ? "border-orange-500/50 bg-orange-500/10 text-orange-500"
                        : p === "medium"
                        ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                        : "border-border/30 bg-surface-2/50 text-text-secondary"
                      : "border-border/30 text-text-tertiary hover:border-border/60"
                  }`}
                >
                  {p === "low" ? "🐢 Baixa" : p === "medium" ? "⚡ Média" : p === "high" ? "🔥 Alta" : "🚨 Urgente"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-500/5 border border-orange-500/20">
            <AlertCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-text-tertiary leading-relaxed">
              Nosso time de suporte responde em até <strong className="text-text-secondary">24 horas úteis</strong>.
              Para problemas urgentes relacionados a pagamento, use a prioridade "Urgente".
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border/30 text-sm font-medium text-text-secondary hover:text-text-primary transition-all">
              Cancelar
            </button>
            <motion.button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-all"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Enviando...
                </span>
              ) : (
                <>
                  <Send size={15} />
                  Enviar Ticket
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
