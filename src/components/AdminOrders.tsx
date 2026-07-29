import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Search, ChevronLeft, ChevronRight, Truck, CheckCircle2,
  XCircle, CreditCard, Clock, X, Check, Send,
  Ban, Copy,
} from "lucide-react";
import { type Order, type OrderStatus, type DeliveryContent, ORDER_STATUS_LABELS, updateOrderStatus } from "../data/orders";
import { getDigitalDelivery, isDigitalProduct } from "../data/deliveries";

const formatPrice = (value: number) =>
  "R$ " + value.toFixed(2).replace(".", ",").replace(/\B(?=(?:\d{3})+(?!\d))/g, ".");

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const STATUS_STYLES: Record<OrderStatus, { bg: string; label: string; icon: any }> = {
  pending: { bg: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", label: "Aguardando Pagamento", icon: Clock },
  paid: { bg: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Pago", icon: CreditCard },
  preparing: { bg: "bg-orange-500/10 text-orange-400 border-orange-500/20", label: "Preparando", icon: Package },
  shipped: { bg: "bg-purple-500/10 text-purple-400 border-purple-500/20", label: "Enviado", icon: Truck },
  delivered: { bg: "bg-green-500/10 text-green-400 border-green-500/20", label: "Entregue", icon: CheckCircle2 },
  cancelled: { bg: "bg-red-500/10 text-red-400 border-red-500/20", label: "Cancelado", icon: XCircle },
};

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onUpdate: () => void;
}

function OrderDetailModal({ order, onClose, onUpdate }: OrderDetailModalProps) {
  const [trackingCode, setTrackingCode] = useState(order.trackingCode || "");
  const [deliveryNote, setDeliveryNote] = useState(order.deliveryNote || "");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    setActionLoading(action);
    await new Promise((r) => setTimeout(r, 500));

    if (action === "approve") {
      const now = new Date().toISOString();
      // Check if any items are digital — auto-deliver
      const digitalItems = order.items.filter((item) => isDigitalProduct(item.productId));
      let deliveryContent: any[] | undefined;

      if (digitalItems.length > 0) {
        deliveryContent = [];
        digitalItems.forEach((item) => {
          for (let i = 0; i < item.quantity; i++) {
            const content = getDigitalDelivery(item.productId, i);
            if (content) {
              const unitNum = item.quantity > 1 ? ` (Unidade ${i + 1})` : "";
              const gLabel = `${item.productName}${unitNum}`;
              const gKey = `${item.productId}-${i}`;
              content.forEach((c) => {
                deliveryContent!.push({ ...c, groupLabel: gLabel, groupKey: gKey });
              });
            }
          }
        });
      }

      updateOrderStatus(order.id, "paid", {
        paymentApprovedAt: now,
        ...(deliveryContent ? { deliveryContent } : {}),
      });
    } else if (action === "reject") {
      updateOrderStatus(order.id, "cancelled", {
        cancelledAt: new Date().toISOString(),
        rejectionReason: rejectionReason || "Pagamento recusado",
      });
    } else if (action === "prepare") {
      updateOrderStatus(order.id, "preparing");
    } else if (action === "ship") {
      updateOrderStatus(order.id, "shipped", {
        trackingCode: trackingCode || "Sem código de rastreio",
        deliveryNote: deliveryNote || "Pedido enviado com sucesso",
      });
    } else if (action === "deliver") {
      updateOrderStatus(order.id, "delivered", {
        deliveredAt: new Date().toISOString(),
      });
    }

    setActionLoading("");
    onUpdate();
  };

  const St = STATUS_STYLES[order.status];
  const StatusIcon = St.icon;
  const isDigital = order.items.some((item) => isDigitalProduct(item.productId));
  const hasDigitalContent = order.deliveryContent && order.deliveryContent.length > 0;

  const copyToClipboard = async (text: string, id: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-2xl glass rounded-2xl border border-border/30 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-xl flex items-center justify-between px-5 py-4 border-b border-border/30">
          <h2 className="text-sm font-semibold text-text-primary">Pedido #{order.id}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg glass-card-3d card-shine text-text-tertiary hover:text-text-primary">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${St.bg}`}>
            <StatusIcon size={20} />
            <div>
              <p className="text-sm font-semibold">{St.label}</p>
              <p className="text-[11px] opacity-70">Atualizado em {formatDate(order.updatedAt)}</p>
            </div>
          </div>

          {/* Customer */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-surface-2/30 border border-border/20">
            <div className="w-9 h-9 rounded-full bg-orange-500/15 flex items-center justify-center text-sm font-bold text-orange-500 shrink-0">
              {order.customerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{order.customerName}</p>
              <p className="text-[11px] text-text-tertiary">{order.customerEmail}</p>
              {order.deliveryAddress && (
                <p className="text-[11px] text-text-tertiary mt-1">
                  📍 {order.deliveryAddress.street}, {order.deliveryAddress.number} — {order.deliveryAddress.neighborhood}, {order.deliveryAddress.city}/{order.deliveryAddress.state}
                </p>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-text-primary">Itens do Pedido</p>
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-2/20 border border-border/20">
                <span className="text-xl shrink-0">{item.productImage}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{item.productName}</p>
                  <p className="text-[10px] text-text-tertiary">
                    {formatPrice(item.price)} x {item.quantity}
                    {isDigitalProduct(item.productId) && (
                      <span className="text-green-400 ml-1">(Digital)</span>
                    )}
                  </p>
                </div>
                <p className="text-xs font-semibold text-text-primary">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
            <div className="flex items-center justify-between px-3 py-2 border-t border-border/20">
              <span className="text-xs text-text-tertiary">Total</span>
              <span className="text-sm font-bold text-orange-500">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Digital Delivery Content */}
          {hasDigitalContent && (() => {
            // Agrupa por groupKey
            const groups = new Map<string, { label: string; items: DeliveryContent[] }>();
            order.deliveryContent!.forEach((dc) => {
              const key = dc.groupKey || "default";
              if (!groups.has(key)) {
                groups.set(key, { label: dc.groupLabel || "Produto Digital", items: [] });
              }
              const g = groups.get(key);
              if (g) g.items.push(dc);
            });
            return (
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <p className="text-xs font-semibold text-green-400">Conteúdo da Entrega Digital</p>
                </div>
                <div className="space-y-3">
                  {Array.from(groups.entries()).map(([key, group]) => (
                    <div key={key} className="rounded-lg bg-black/20 border border-green-500/10 p-3">
                      <p className="text-[10px] font-semibold text-green-400 mb-2 flex items-center gap-1.5">
                        <Package size={11} />
                        {group.label}
                      </p>
                      <div className="space-y-1.5">
                        {group.items.map((item, idx) => {
                          const cid = key + "-" + idx;
                          return (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-[11px] text-text-tertiary shrink-0 w-24">{item.label}:</span>
                              <span className="text-[11px] text-text-primary font-mono break-all flex-1">{item.value}</span>
                              <button onClick={() => copyToClipboard(item.value, cid)} className="shrink-0 p-0.5 text-text-tertiary hover:text-green-400">
                                {copiedId === cid ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Tracking / Delivery Note (Physical) */}
          {!isDigital && order.trackingCode && (
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck size={16} className="text-purple-400" />
                <p className="text-xs font-semibold text-purple-400">Informações de Entrega</p>
              </div>
              <p className="text-xs text-text-primary"><span className="text-text-tertiary">Código Rastreio:</span> {order.trackingCode}</p>
              <p className="text-xs text-text-primary mt-1">{order.deliveryNote}</p>
            </div>
          )}

          {/* Rejection reason */}
          {order.status === "cancelled" && order.rejectionReason && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Ban size={16} className="text-red-400" />
                <p className="text-xs font-semibold text-red-400">Motivo do Cancelamento</p>
              </div>
              <p className="text-xs text-text-primary">{order.rejectionReason}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2 border-t border-border/20">
            {order.status === "pending" && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-text-tertiary mb-1 block">Motivo da recusa (se rejeitar)</label>
                  <input
                    type="text" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Ex: Pagamento recusado pela operadora"
                    className="w-full px-3 py-2 rounded-xl border border-border/30 bg-surface-2/30 text-xs text-text-primary placeholder:text-text-tertiary/60 focus:border-orange-500/50 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => handleAction("approve")}
                    disabled={!!actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/15 text-green-400 border border-green-500/30 text-xs font-semibold hover:bg-green-500/25 transition-all"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {actionLoading === "approve" ? "Aprovando..." : <><Check size={14} /> Aprovar Pagamento</>}
                  </motion.button>
                  <motion.button
                    onClick={() => handleAction("reject")}
                    disabled={!!actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-semibold hover:bg-red-500/25 transition-all"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {actionLoading === "reject" ? "Recusando..." : <><Ban size={14} /> Recusar Pagamento</>}
                  </motion.button>
                </div>
              </div>
            )}

            {order.status === "paid" && (
              <motion.button
                onClick={() => handleAction("prepare")}
                disabled={!!actionLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30 text-xs font-semibold hover:bg-orange-500/25 transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {actionLoading === "prepare" ? "Preparando..." : <><Package size={14} /> Iniciar Preparação do Pedido</>}
              </motion.button>
            )}

            {order.status === "preparing" && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-text-tertiary mb-1 block">Código de Rastreio</label>
                  <input
                    type="text" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Ex: BR123456789BR"
                    className="w-full px-3 py-2 rounded-xl border border-border/30 bg-surface-2/30 text-xs text-text-primary placeholder:text-text-tertiary/60 focus:border-orange-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-tertiary mb-1 block">Observação de Entrega</label>
                  <textarea
                    value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="Ex: Pedido enviado via Correios PAC"
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-border/30 bg-surface-2/30 text-xs text-text-primary placeholder:text-text-tertiary/60 focus:border-orange-500/50 focus:outline-none resize-none"
                  />
                </div>
                <motion.button
                  onClick={() => handleAction("ship")}
                  disabled={!!actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 text-xs font-semibold hover:bg-purple-500/25 transition-all"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {actionLoading === "ship" ? "Enviando..." : <><Send size={14} /> Marcar como Enviado</>}
                </motion.button>
              </div>
            )}

            {order.status === "shipped" && (
              <motion.button
                onClick={() => handleAction("deliver")}
                disabled={!!actionLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/15 text-green-400 border border-green-500/30 text-xs font-semibold hover:bg-green-500/25 transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {actionLoading === "deliver" ? "Confirmando..." : <><CheckCircle2 size={14} /> Confirmar Entrega</>}
              </motion.button>
            )}

            {order.status === "delivered" && (
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/10 text-green-400 text-xs font-medium">
                <CheckCircle2 size={14} /> Pedido entregue com sucesso
              </div>
            )}

            {order.status === "cancelled" && (
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-400 text-xs font-medium">
                <Ban size={14} /> Pedido cancelado
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminOrders({ orders, onUpdate }: { orders: Order[]; onUpdate: () => void }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const PER_PAGE = 12;

  const filtered = useMemo(() => {
    let list = orders;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      list = list.filter((o) => o.status === statusFilter);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-xl glass border border-border/30">
          <Search size={16} className="text-text-tertiary shrink-0" />
          <input
            type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Buscar por ID ou cliente..."
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary/60 focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {(["all", "pending", "paid", "preparing", "shipped", "delivered", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(0); }}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                statusFilter === s
                  ? "bg-orange-500/15 text-orange-500 border border-orange-500/30"
                  : "text-text-tertiary hover:text-text-secondary border border-transparent"
              }`}
            >
              {s === "all" ? "Todos" : ORDER_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-2 text-[11px] text-text-tertiary">
        <span>Total: <strong className="text-text-primary">{orders.length}</strong></span>
        <span className="text-yellow-400">Pendentes: <strong>{orders.filter((o) => o.status === "pending").length}</strong></span>
        <span className="text-green-400">Entregues: <strong>{orders.filter((o) => o.status === "delivered").length}</strong></span>
        <span className="text-red-400">Cancelados: <strong>{orders.filter((o) => o.status === "cancelled").length}</strong></span>
      </div>

      {/* Orders Grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="mx-auto text-text-tertiary/40 mb-3" />
          <p className="text-sm text-text-tertiary">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paginated.map((order) => {
            const St = STATUS_STYLES[order.status];
            const StatusIcon = St.icon;
            const hasDigital = order.items.some((item) => isDigitalProduct(item.productId));
            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedOrder(order)}
                className="glass rounded-xl border border-border/30 p-4 hover:border-orange-500/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-xs font-semibold text-text-primary">#{order.id}</p>
                    <p className="text-[10px] text-text-tertiary">{order.customerName}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${St.bg} text-[10px] font-medium`}>
                    <StatusIcon size={10} />
                    {St.label}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {order.items.slice(0, 4).map((item) => (
                    <span key={item.productId} className="text-base">{item.productImage}</span>
                  ))}
                  {order.items.length > 4 && <span className="text-[10px] text-text-tertiary">+{order.items.length - 4}</span>}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-text-tertiary">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                    {hasDigital && <span className="text-[9px] text-green-400">⚡ Digital</span>}
                  </div>
                  <span className="text-xs font-semibold text-orange-500">{formatPrice(order.total)}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="p-2 rounded-lg glass-card-3d card-shine text-text-secondary disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-text-tertiary">{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="p-2 rounded-lg glass-card-3d card-shine text-text-secondary disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdate={onUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
