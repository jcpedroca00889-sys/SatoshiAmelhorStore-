import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X, ArrowLeft, Package, MapPin, User, Mail,
  Clock, CreditCard, CheckCircle2, Loader2,
  ShoppingBag, Truck, AlertCircle, Copy, Check,
} from "lucide-react";
import type { Order, OrderStatus, DeliveryContent } from "../data/orders";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Aguardando Pagamento",
  paid: "Pagamento Confirmado",
  preparing: "Preparando Pedido",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusIcons: Record<OrderStatus, React.ComponentType<any>> = {
  pending: Clock,
  paid: CreditCard,
  preparing: Loader2,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: AlertCircle,
};

const statusColors: Record<OrderStatus, string> = {
  pending: "text-yellow-400",
  paid: "text-blue-400",
  preparing: "text-orange-400",
  shipped: "text-purple-400",
  delivered: "text-green-400",
  cancelled: "text-red-400",
};

const statusBg: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/10 border-yellow-500/20",
  paid: "bg-blue-500/10 border-blue-500/20",
  preparing: "bg-orange-500/10 border-orange-500/20",
  shipped: "bg-purple-500/10 border-purple-500/20",
  delivered: "bg-green-500/10 border-green-500/20",
  cancelled: "bg-red-500/10 border-red-500/20",
};

// Timeline steps for tracking
const timelineSteps: { status: OrderStatus; label: string; description: string }[] = [
  { status: "pending", label: "Pedido Realizado", description: "Aguardando confirmação do pagamento" },
  { status: "paid", label: "Pagamento Confirmado", description: "Seu pagamento foi aprovado" },
  { status: "preparing", label: "Preparando", description: "Seu pedido está sendo preparado" },
  { status: "shipped", label: "Enviado", description: "Pedido saiu para entrega" },
  { status: "delivered", label: "Entregue", description: "Pedido entregue com sucesso" },
];

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DigitalDeliveryContent({ deliveryContent }: { deliveryContent: DeliveryContent[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Agrupa por groupKey
  const groups = new Map<string, { label: string; items: DeliveryContent[] }>();
  deliveryContent.forEach((dc) => {
    const key = dc.groupKey || "default";
    if (!groups.has(key)) {
      groups.set(key, { label: dc.groupLabel || "Produto Digital", items: [] });
    }
    groups.get(key)!.items.push(dc);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="glass rounded-2xl border border-green-500/20 bg-green-500/5 p-5 sm:p-6"
    >
      <h3 className="text-sm font-bold text-green-400 mb-4 flex items-center gap-2">
        <CheckCircle2 size={14} />
        Conteúdo da Entrega Digital
      </h3>
      <div className="space-y-3">
        {Array.from(groups.entries()).map(([key, group]) => (
          <div key={key} className="rounded-xl bg-black/20 border border-green-500/10 overflow-hidden">
            <div className="px-3 py-2 bg-green-500/10 border-b border-green-500/10">
              <p className="text-[11px] font-semibold text-green-400 flex items-center gap-1.5">
                <Package size={12} />
                {group.label}
              </p>
            </div>
            <div className="p-2 space-y-1.5">
              {group.items.map((item, idx) => {
                const cid = key + "-" + idx;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-black/20 transition-colors group/item"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-text-tertiary mb-0.5">{item.label}</p>
                      <p className="text-[12px] text-text-primary font-mono break-all">{item.value}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(item.value, cid)}
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-green-400 hover:bg-green-500/10 transition-all opacity-0 group-hover/item:opacity-100"
                    >
                      {copiedId === cid ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-text-tertiary/60 mt-4 text-center">
        Copie os dados de cada produto para acessar. Guarde em local seguro.
      </p>
    </motion.div>
  );
}

export default function OrderDetailPage({
  order,
  onBack,
  onClose,
}: {
  order: Order;
  onBack: () => void;
  onClose: () => void;
}) {
  const isCancelled = order.status === "cancelled";
  const currentStepIndex = timelineSteps.findIndex((s) => s.status === order.status);

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
            className="flex items-center gap-2 text-text-secondary hover:text-orange-500 glass-card-3d card-shine transition-colors touch-target"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
              <Package size={16} className="text-orange-500" />
            </div>
            <span className="text-sm font-semibold text-text-primary">Pedido #{order.id}</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-text-secondary hover:text-orange-500 glass-card-3d card-shine transition-colors touch-target"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-6">
        {/* ─── Status Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass rounded-2xl border p-5 sm:p-6 ${statusBg[order.status]}`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${statusBg[order.status]}`}>
              {React.createElement(statusIcons[order.status], {
                size: 28,
                className: statusColors[order.status],
              })}
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">{statusLabels[order.status]}</h2>
              <p className="text-sm text-text-tertiary">Atualizado em {formatDate(order.updatedAt)}</p>
            </div>
          </div>
        </motion.div>

        {/* ─── Timeline ─── */}
        {!isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass rounded-2xl border border-border/30 p-5 sm:p-6"
          >
            <h3 className="text-sm font-bold text-text-primary mb-5 flex items-center gap-2">
              <Truck size={14} className="text-orange-500" />
              Acompanhe seu pedido
            </h3>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[17px] top-0 bottom-0 w-[2px] bg-surface-3 rounded-full" />
              {/* Active line fill */}
              <div
                className="absolute left-[17px] top-0 w-[2px] bg-orange-500 rounded-full transition-all"
                style={{
                  height: `${Math.max(0, currentStepIndex) * (100 / (timelineSteps.length - 1))}%`,
                }}
              />

              <div className="space-y-6">
                {timelineSteps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const Icon = statusIcons[step.status];
                  return (
                    <div key={step.status} className="flex items-start gap-4 relative">
                      <div
                        className={`w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                          isCompleted
                            ? "bg-orange-500/15 border-2 border-orange-500"
                            : "bg-surface-2 border-2 border-surface-3"
                        } ${isCurrent ? "shadow-lg shadow-orange-500/20" : ""}`}
                      >
                        <Icon
                          size={14}
                          className={isCompleted ? "text-orange-500" : "text-text-tertiary"}
                        />
                      </div>
                      <div className="pt-1.5">
                        <p className={`text-sm font-semibold transition-colors ${
                          isCompleted ? "text-text-primary" : "text-text-tertiary"
                        }`}>
                          {step.label}
                        </p>
                        <p className={`text-[11px] transition-colors ${
                          isCompleted ? "text-text-tertiary" : "text-text-tertiary/50"
                        }`}>
                          {isCompleted || isCurrent ? step.description : "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Cancelled message ─── */}
        {isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass rounded-2xl border border-red-500/20 bg-red-500/5 p-5 sm:p-6 text-center"
          >
            <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-text-primary mb-1">Pedido Cancelado</h3>
            <p className="text-sm text-text-tertiary">Este pedido foi cancelado e não será processado.</p>
            {order.rejectionReason && (
              <p className="text-xs text-red-400 mt-3 bg-red-500/10 rounded-lg px-3 py-2 inline-block">
                Motivo: {order.rejectionReason}
              </p>
            )}
          </motion.div>
        )}

        {/* ─── Digital Delivery Content ─── */}
        {!isCancelled && order.deliveryContent && order.deliveryContent.length > 0 && (
          <DigitalDeliveryContent deliveryContent={order.deliveryContent} />
        )}

        {/* ─── Physical Delivery Info (Tracking) ─── */}
        {!isCancelled && !order.deliveryContent && order.trackingCode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="glass rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 sm:p-6"
          >
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <Truck size={14} className="text-purple-400" />
              Informações de Entrega
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2/30 border border-border/20">
                <Truck size={16} className="text-purple-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-text-tertiary">Código de Rastreio</p>
                  <p className="text-xs font-medium text-text-primary">{order.trackingCode}</p>
                </div>
              </div>
              {order.deliveryNote && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2/30 border border-border/20">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                    <Package size={14} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-text-tertiary">Observação</p>
                    <p className="text-xs font-medium text-text-primary">{order.deliveryNote}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── Items ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl border border-border/30 p-5 sm:p-6"
        >
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <ShoppingBag size={14} className="text-orange-500" />
            Itens do Pedido
          </h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-2/30 border border-border/20"
              >
                <div className="w-12 h-12 rounded-lg bg-surface-2 border border-border/20 overflow-hidden shrink-0">
                  {item.productImage && (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">{item.productName}</p>
                  {item.productColor && (
                    <p className="text-[10px] text-text-tertiary">Cor: {item.productColor}</p>
                  )}
                  <p className="text-[10px] text-text-tertiary">
                    {formatPrice(item.price)} x {item.quantity}
                  </p>
                </div>
                <p className="text-xs font-semibold text-text-primary">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* ─── Total ─── */}
          <div className="mt-4 pt-4 border-t border-border/20 flex items-center justify-between">
            <span className="text-xs text-text-tertiary">Total</span>
            <span className="text-base font-bold text-orange-500">{formatPrice(order.total)}</span>
          </div>
        </motion.div>

        {/* ─── Delivery Address ─── */}
        {order.deliveryAddress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-2xl border border-border/30 p-5 sm:p-6"
          >
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <MapPin size={14} className="text-orange-500" />
              Endereço de Entrega
            </h3>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-text-tertiary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {order.deliveryAddress.street}, {order.deliveryAddress.number}
                </p>
                {order.deliveryAddress.complement && (
                  <p className="text-xs text-text-tertiary">{order.deliveryAddress.complement}</p>
                )}
                <p className="text-xs text-text-tertiary">
                  {order.deliveryAddress.neighborhood}, {order.deliveryAddress.city}/{order.deliveryAddress.state}
                </p>
                <p className="text-xs text-text-tertiary">CEP: {order.deliveryAddress.zipCode}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Customer Info ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl border border-border/30 p-5 sm:p-6"
        >
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <User size={14} className="text-orange-500" />
            Dados do Cliente
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2.5">
              <User size={13} className="text-text-tertiary mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-text-tertiary">Nome</p>
                <p className="text-xs font-medium text-text-primary">{order.customerName}</p>
              </div>
            </div>
            {order.customerEmail && (
              <div className="flex items-start gap-2.5">
                <Mail size={13} className="text-text-tertiary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-text-tertiary">Email</p>
                  <p className="text-xs font-medium text-text-primary">{order.customerEmail}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ─── Dates ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl border border-border/30 p-5 sm:p-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2.5">
              <Clock size={13} className="text-text-tertiary mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-text-tertiary">Criado em</p>
                <p className="text-xs font-medium text-text-primary">{formatDate(order.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock size={13} className="text-text-tertiary mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-text-tertiary">Última atualização</p>
                <p className="text-xs font-medium text-text-primary">{formatDate(order.updatedAt)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Actions ─── */}
        <div className="flex gap-3 pb-8">
          <button
            onClick={onBack}
            className="flex-1 py-3 rounded-xl glass-card-3d card-shine text-text-secondary hover:text-text-primary text-sm font-medium transition-all"
          >
            Voltar aos Pedidos
          </button>
          <button
            onClick={onClose}
            className="flex-[2] py-3 rounded-xl glass-card-3d card-shine text-white font-semibold text-sm transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
