import { useMemo } from "react";
import { DollarSign, ShoppingBag, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { type Order, getOrdersStats } from "../data/orders";

const formatPrice = (value: number) =>
  "R$ " + value.toFixed(2).replace(".", ",").replace(/\B(?=(?:\d{3})+(?!\d))/g, ".");

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-500/60",
  paid: "bg-blue-500/60",
  preparing: "bg-yellow-500/60",
  shipped: "bg-purple-500/60",
  delivered: "bg-green-500/60",
  cancelled: "bg-red-500/60",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  paid: "Confirmado",
  preparing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export default function AdminSales({ orders }: { orders: Order[] }) {
  const stats = useMemo(() => getOrdersStats(orders), [orders]);

  const maxCount = Math.max(...Object.values(stats.statusCounts), 1);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [orders]
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card-3d rounded-2xl border border-border/20 p-5">
          <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center mb-3">
            <DollarSign size={18} className="text-green-400" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{formatPrice(stats.totalRevenue)}</p>
          <p className="text-xs text-text-tertiary mt-0.5">Receita Total</p>
        </div>
        <div className="glass-card-3d rounded-2xl border border-border/20 p-5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center mb-3">
            <ShoppingBag size={18} className="text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{stats.totalOrders}</p>
          <p className="text-xs text-text-tertiary mt-0.5">Total de Pedidos</p>
        </div>
        <div className="glass-card-3d rounded-2xl border border-border/20 p-5">
          <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center mb-3">
            <CheckCircle2 size={18} className="text-green-400" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{stats.deliveredOrders}</p>
          <p className="text-xs text-text-tertiary mt-0.5">Entregues</p>
        </div>
        <div className="glass-card-3d rounded-2xl border border-border/20 p-5">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center mb-3">
            <XCircle size={18} className="text-red-400" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{stats.cancelledOrders}</p>
          <p className="text-xs text-text-tertiary mt-0.5">Cancelados</p>
        </div>
      </div>

      {/* Orders by Status */}
      <div className="glass-card-3d rounded-2xl border border-border/20 p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-orange-500" />
          Pedidos por Status
        </h3>
        {Object.keys(stats.statusCounts).length === 0 ? (
          <p className="text-xs text-text-tertiary text-center py-6">Nenhum pedido cadastrado</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary w-24 shrink-0">{STATUS_LABELS[status] || status}</span>
                <div className="flex-1 h-5 rounded-lg bg-surface-3/80 overflow-hidden relative">
                  <div
                    className="h-full rounded-lg transition-all duration-500"
                    style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: STATUS_COLORS[status] || "#f97316" }}
                  />
                </div>
                <span className="text-xs text-text-tertiary w-8 text-right shrink-0">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="glass-card-3d rounded-2xl border border-border/20 p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Pedidos Recentes</h3>
        {recentOrders.length === 0 ? (
          <p className="text-xs text-text-tertiary text-center py-6">Nenhum pedido recente</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
                <div>
                  <p className="text-xs font-medium text-text-primary font-mono">{order.id}</p>
                  <p className="text-[10px] text-text-tertiary">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-orange-500">{formatPrice(order.total)}</p>
                  <p className="text-[10px] text-text-tertiary">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
