import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  X, User, Package, Clock, ChevronRight,
  ShoppingBag, CheckCircle2, Loader2, AlertCircle, Bell,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getOrdersByEmail, type Order, type OrderStatus } from "../data/orders";
import { isDigitalProduct } from "../data/deliveries";
import { getNotificationsByUser, getRecentlyAvailableNotifications, unsubscribeFromStock } from "../data/stockNotifications";
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
  const [notifTab, setNotifTab] = useState<"pedidos" | "alertas">("pedidos");

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
            {/* ─── Tab Switcher ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-4"
            >
              <button
                onClick={() => setNotifTab("pedidos")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  notifTab === "pedidos"
                    ? "bg-orange-500/10 text-orange-500 border border-orange-500/30"
                    : "text-text-tertiary hover:text-text-secondary border border-transparent"
                }`}
              >
                <Package size={14} />
                Pedidos
              </button>
              <button
                onClick={() => setNotifTab("alertas")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  notifTab === "alertas"
                    ? "bg-orange-500/10 text-orange-500 border border-orange-500/30"
                    : "text-text-tertiary hover:text-text-secondary border border-transparent"
                }`}
              >
                <Bell size={14} />
                Meus Alertas
                {user && getNotificationsByUser(user.id).length > 0 && (
                  <span className="text-[10px] bg-yellow-500/15 text-yellow-400 px-1.5 py-0.5 rounded-full">
                    {getNotificationsByUser(user.id).length}
                  </span>
                )}
              </button>
            </motion.div>

            {notifTab === "alertas" && user && (
              <NotificationsView user={user} />
            )}

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

            {notifTab === "pedidos" && (
            <>
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
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-text-tertiary">
                              {order.items.length} item{order.items.length !== 1 ? "s" : ""} &bull; {formatPrice(order.total)}
                            </span>
                            {order.items.some((i) => isDigitalProduct(i.productId)) && (
                              <span className="text-[9px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/20 font-medium">
                                Digital
                              </span>
                            )}
                            {order.status === "delivered" && order.deliveryContent && order.deliveryContent.length > 0 && (
                              <span className="text-[9px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-full border border-orange-500/20 font-medium">
                                Conteúdo Liberado
                              </span>
                            )}
                          </div>
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
        </>
      )}
      </div>
    </motion.div>
  );
}

// ==================== Notifications View ====================
function NotificationsView({ user }: { user: NonNullable<ReturnType<typeof useAuth>["user"]> }) {
  const [updateTick, setUpdateTick] = useState(0);
  const notifications = useMemo(() => getNotificationsByUser(user.id), [user.id, updateTick]);
  const recentlyAvailable = useMemo(() => getRecentlyAvailableNotifications(user.id), [user.id]);

  const pending = notifications.filter((n) => n.notifiedAt === null);
  const available = notifications.filter((n) => n.notifiedAt !== null);

  const handleUnsubscribe = (id: string) => {
    unsubscribeFromStock(id);
    setUpdateTick((t) => t + 1);
  };

  // Removed redundant effect - useMemo depends on updateTick now

  if (notifications.length === 0) {
    return (
      <div className="glass rounded-2xl border border-border/30 p-10 text-center mb-6">
        <Bell size={32} className="mx-auto text-text-tertiary mb-3" />
        <p className="text-sm text-text-tertiary">Você ainda não tem alertas de disponibilidade</p>
        <p className="text-xs text-text-tertiary/60 mt-1">Clique em "Avise-me" em um produto indisponível para ser notificado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-6">
      {recentlyAvailable.length > 0 && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-green-400" />
            <p className="text-xs font-semibold text-green-400">Produtos disponíveis novamente!</p>
          </div>
          {recentlyAvailable.map((n) => (
            <div key={n.id} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-green-500/5 mt-1">
              <span className="text-xs text-text-primary">{n.productName}</span>
              <span className="text-[10px] text-green-400">Disponível</span>
            </div>
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <Bell size={14} className="text-yellow-400" />
            <p className="text-xs font-semibold text-text-primary">Aguardando disponibilidade ({pending.length})</p>
          </div>
          {pending.map((n) => (
            <div key={n.id} className="glass rounded-xl border border-border/30 p-3 hover:border-yellow-500/20 transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{n.productName}</p>
                  <p className="text-[10px] text-text-tertiary">
                    Criado em {new Date(n.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    Pendente
                  </span>
                  <button
                    onClick={() => handleUnsubscribe(n.id)}
                    className="p-1 rounded-lg text-text-tertiary hover:text-red-400 transition-colors"
                    title="Cancelar alerta"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {available.length > 0 && (
        <details className="mt-4">
          <summary className="text-[10px] text-text-tertiary cursor-pointer hover:text-text-secondary transition-colors">
            Histórico ({available.length} notificações)
          </summary>
          <div className="mt-2 space-y-1">
            {available.map((n) => (
              <div key={n.id} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-2/20">
                <span className="text-[10px] text-text-tertiary">{n.productName}</span>
                <span className="text-[9px] text-green-400/60">Notificado</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
