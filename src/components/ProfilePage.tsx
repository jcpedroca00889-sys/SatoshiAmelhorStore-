import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  X, User, Package, Clock, ChevronRight,
  ShoppingBag, CheckCircle2, Loader2, AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getOrdersByEmail, type Order, type OrderStatus } from "../data/orders";
import OrderDetailPage from "./OrderDetailPage";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Aguardando Pagamento",
  paid: "Pago",
  preparing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusColors: Record<OrderStatus, string> = {
  pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  paid: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  preparing: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  shipped: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  delivered: "text-green-400 bg-green-500/10 border-green-500/20",
  cancelled: "text-red-400 bg-red-500/10 border-red-500/20",
};

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function ProfilePage({ onClose }: { onClose: (view?: string) => void }) {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");

  const allOrders = useMemo(() => {
    if (!user) return [];
    return getOrdersByEmail(user.email || "");
  }, [user]);

  const filteredOrders = useMemo(() => {
    if (filterStatus === "all") return allOrders;
    return allOrders.filter((o) => o.status === filterStatus);
  }, [allOrders, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: allOrders.length,
      delivered: allOrders.filter((o) => o.status === "delivered").length,
      inProgress: allOrders.filter((o) => ["paid", "preparing", "shipped"].includes(o.status)).length,
      cancelled: allOrders.filter((o) => o.status === "cancelled").length,
    };
  }, [allOrders]);

  // If viewing an order detail, render OrderDetailPage instead
  if (selectedOrder) {
    return (
      <OrderDetailPage
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
        onClose={() => onClose()}
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
          <button
            onClick={() => onClose()}
            className="flex items-center gap-2 text-text-secondary hover:text-orange-500 glass-card-3d card-shine transition-colors touch-target"
          >
            <X size={18} />
            <span className="text-sm font-medium">Fechar</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
              <User size={16} className="text-orange-500" />
            </div>
            <span className="text-sm font-semibold text-text-primary">Meu Perfil</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        {!user ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
              <AlertCircle size={28} className="text-orange-500" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">Faça login para ver seu perfil</h2>
            <p className="text-sm text-text-tertiary mb-6">Entre com sua conta para visualizar seus pedidos</p>
            <button
              onClick={() => { onClose(); window.dispatchEvent(new CustomEvent("open-auth")); }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-card-3d card-shine text-white font-semibold text-sm"
            >
              Fazer Login
            </button>
          </div>
        ) : (
          <>
            {/* ─── User Info Card ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl border border-border/30 p-5 sm:p-6 mb-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-500/20">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-text-primary truncate">{user.name}</h2>
                  <p className="text-sm text-text-tertiary truncate">{user.email}</p>
                </div>
              </div>
            </motion.div>

            {/* ─── Stats Cards ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
            >
              {[
                { label: "Total", value: stats.total, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: ShoppingBag },
                { label: "Entregues", value: stats.delivered, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: CheckCircle2 },
                { label: "Em Andamento", value: stats.inProgress, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Loader2 },
                { label: "Cancelados", value: stats.cancelled, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: AlertCircle },
              ].map((s) => (
                <div key={s.label} className={`glass rounded-xl border ${s.border} p-3 sm:p-4`}>
                  <div className={`w-8 h-8 rounded-lg ${s.bg} ${s.border} border flex items-center justify-center mb-2`}>
                    <s.icon size={14} className={s.color} />
                  </div>
                  <p className="text-2xl font-bold text-text-primary">{s.value}</p>
                  <p className="text-[10px] text-text-tertiary">{s.label}</p>
                </div>
              ))}
            </motion.div>

            {/* ─── Order History ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Package size={16} className="text-orange-500" />
                  Meus Pedidos
                </h3>
                <div className="flex gap-1.5 overflow-x-auto">
                  {(["all", "pending", "paid", "preparing", "shipped", "delivered", "cancelled"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                        filterStatus === s
                          ? "bg-orange-500/15 text-orange-500 border border-orange-500/30"
                          : "text-text-tertiary hover:text-text-secondary border border-transparent"
                      }`}
                    >
                      {s === "all" ? "Todos" : statusLabels[s]}
                    </button>
                  ))}
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="glass rounded-2xl border border-border/30 p-10 text-center">
                  <Package size={32} className="mx-auto text-text-tertiary mb-3" />
                  <p className="text-sm text-text-tertiary">
                    {filterStatus === "all" ? "Nenhum pedido encontrado" : `Nenhum pedido com status "${statusLabels[filterStatus]}"`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order, idx) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => setSelectedOrder(order)}
                      className="glass rounded-2xl border border-border/30 p-4 sm:p-5 hover:border-orange-500/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-semibold text-text-primary">Pedido #{order.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium border ${statusColors[order.status]}`}>
                              {statusLabels[order.status]}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-tertiary flex items-center gap-1">
                            <Clock size={10} />
                            {formatDate(order.createdAt)}
                          </p>
                          <p className="text-[11px] text-text-tertiary mt-0.5">
                            {order.items.length} item{order.items.length !== 1 ? "s" : ""} &bull; {formatPrice(order.total)}
                          </p>
                          {order.items.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2">
                              {order.items.slice(0, 3).map((item) => (
                                <div
                                  key={item.productId}
                                  className="w-8 h-8 rounded-lg bg-surface-2/50 border border-border/20 overflow-hidden"
                                >
                                  {item.productImage && (
                                    <img
                                      src={item.productImage}
                                      alt={item.productName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                    />
                                  )}
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <span className="text-[9px] text-text-tertiary">+{order.items.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <ChevronRight size={16} className="text-text-tertiary group-hover:text-orange-500 transition-colors shrink-0 mt-1" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
