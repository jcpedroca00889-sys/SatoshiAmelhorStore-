import { useState, useMemo } from "react";
import { Package, Search, ChevronLeft, ChevronRight, Truck } from "lucide-react";
import { type Order, type OrderStatus, ORDER_STATUS_LABELS, saveOrders } from "../data/orders";

const formatPrice = (value: number) =>
  "R$ " + value.toFixed(2).replace(".", ",").replace(/\B(?=(?:\d{3})+(?!\d))/g, ".");

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-orange-500/10 text-orange-500",
  paid: "bg-blue-500/10 text-blue-400",
  preparing: "bg-yellow-500/10 text-yellow-400",
  shipped: "bg-purple-500/10 text-purple-400",
  delivered: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
};

export default function AdminOrders({ orders, onUpdate }: { orders: Order[]; onUpdate: (orders: Order[]) => void }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [editingTracking, setEditingTracking] = useState<string | null>(null);
  const [trackingValue, setTrackingValue] = useState("");
  const PER_PAGE = 10;

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)
    );
  }, [orders, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            deliveredAt: newStatus === "delivered" ? new Date().toISOString() : o.deliveredAt,
            cancelledAt: newStatus === "cancelled" ? new Date().toISOString() : o.cancelledAt,
          }
        : o
    );
    saveOrders(updated);
    onUpdate(updated);
  };

  const handleTrackingSave = (orderId: string) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, trackingCode: trackingValue, updatedAt: new Date().toISOString() } : o
    );
    saveOrders(updated);
    onUpdate(updated);
    setEditingTracking(null);
    setTrackingValue("");
  };

  return (
    <div>
      {/* Search */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/30 bg-surface-2/30 focus-within:border-orange-500/50 transition-all">
          <Search size={16} className="text-text-tertiary shrink-0" />
          <input
            type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Buscar por ID ou cliente..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary/60 focus:outline-none"
          />
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Package size={40} className="text-text-tertiary/30" />
          <p className="text-sm text-text-tertiary">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 text-[10px] text-text-tertiary uppercase tracking-wider font-medium">
            <div className="col-span-2">Pedido</div>
            <div className="col-span-2">Cliente</div>
            <div className="col-span-2">Data</div>
            <div className="col-span-1">Itens</div>
            <div className="col-span-1">Total</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Ações</div>
          </div>

          {paginated.map((order) => (
            <div key={order.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center px-4 py-3 rounded-xl glass-card-3d card-shine border border-border/20 hover:border-orange-500/20 transition-all">
              <div className="col-span-2">
                <p className="text-xs font-medium text-text-primary font-mono">{order.id}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-text-primary truncate">{order.customerName}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-text-tertiary">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
              <div className="col-span-1">
                <p className="text-xs text-text-secondary">{order.items.length} item(ns)</p>
              </div>
              <div className="col-span-1">
                <p className="text-sm font-semibold text-orange-500">{formatPrice(order.total)}</p>
              </div>
              <div className="col-span-2">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[order.status]}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                  className="px-2 py-1.5 rounded-lg border border-border/30 bg-surface-2/30 text-[10px] text-text-primary focus:border-orange-500/50 focus:outline-none transition-all"
                >
                  {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
                    <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                  ))}
                </select>
                {order.status === "shipped" && (
                  editingTracking === order.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text" value={trackingValue} onChange={(e) => setTrackingValue(e.target.value)}
                        placeholder="Código"
                        className="w-20 px-1.5 py-1 rounded border border-border/30 bg-surface-2/30 text-[9px] text-text-primary focus:outline-none"
                        onKeyDown={(e) => { if (e.key === "Enter") handleTrackingSave(order.id); }}
                        autoFocus
                      />
                      <button onClick={() => handleTrackingSave(order.id)} className="text-[9px] text-green-400 hover:text-green-300">OK</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingTracking(order.id); setTrackingValue(order.trackingCode || ""); }}
                      className="p-1.5 rounded-lg glass-card-3d card-shine text-text-tertiary hover:text-orange-500"
                      title="Adicionar código de rastreio"
                    >
                      <Truck size={12} />
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="p-2 rounded-xl glass-card-3d card-shine text-text-secondary hover:text-orange-500 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-text-tertiary">{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="p-2 rounded-xl glass-card-3d card-shine text-text-secondary hover:text-orange-500 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
