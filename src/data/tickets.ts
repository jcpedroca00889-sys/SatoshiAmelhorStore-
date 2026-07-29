export type TicketStatus = "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export const TICKET_CATEGORIES = [
  { id: "pedido", label: "Problema com Pedido", icon: "📦" },
  { id: "entrega", label: "Problema com Entrega Digital", icon: "🔑" },
  { id: "pagamento", label: "Problema com Pagamento", icon: "💳" },
  { id: "produto", label: "Problema com Produto", icon: "📱" },
  { id: "conta", label: "Problema com Conta/Login", icon: "👤" },
  { id: "sugestao", label: "Sugestão", icon: "💡" },
  { id: "duvida", label: "Dúvida", icon: "❓" },
  { id: "outro", label: "Outro", icon: "📝" },
] as const;

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Aberto",
  in_progress: "Em Andamento",
  waiting_user: "Aguardando Resposta",
  resolved: "Resolvido",
  closed: "Fechado",
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  open: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  in_progress: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  waiting_user: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  resolved: "text-green-400 bg-green-500/10 border-green-500/20",
  closed: "text-text-tertiary bg-surface-2/50 border-border/30",
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

export const TICKET_PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: "text-text-tertiary bg-surface-2/50",
  medium: "text-blue-400 bg-blue-500/10",
  high: "text-orange-400 bg-orange-500/10",
  urgent: "text-red-400 bg-red-500/10",
};

export interface TicketMessage {
  id: string;
  authorId: string;
  authorName: string;
  isAdmin: boolean;
  text: string;
  createdAt: string;
  attachments?: string[];
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  messages: TicketMessage[];
  orderId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  assignedTo?: string;
}

const TICKETS_KEY = "satoshi_store_tickets";

export function loadTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    if (raw) return JSON.parse(raw) as Ticket[];
  } catch { /* ignore */ }
  return [];
}

export function saveTickets(tickets: Ticket[]) {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

export function getTicketById(id: string): Ticket | undefined {
  return loadTickets().find((t) => t.id === id);
}

export function getTicketsByUser(userId: string): Ticket[] {
  return loadTickets()
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getTicketsByStatus(status: TicketStatus | "all"): Ticket[] {
  const tickets = loadTickets();
  if (status === "all") return tickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return tickets
    .filter((t) => t.status === status)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function generateTicketId(): string {
  return (
    "TK-" +
    Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).substring(2, 5).toUpperCase()
  );
}

export function generateMessageId(): string {
  return "MSG-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
}

export function createTicket(params: {
  userId: string;
  userName: string;
  userEmail: string;
  category: string;
  subject: string;
  description: string;
  orderId?: string;
  priority?: TicketPriority;
}): Ticket {
  const ticket: Ticket = {
    id: generateTicketId(),
    userId: params.userId,
    userName: params.userName,
    userEmail: params.userEmail,
    category: params.category,
    subject: params.subject,
    description: params.description,
    status: "open",
    priority: params.priority || "medium",
    messages: [
      {
        id: generateMessageId(),
        authorId: params.userId,
        authorName: params.userName,
        isAdmin: false,
        text: params.description,
        createdAt: new Date().toISOString(),
      },
    ],
    orderId: params.orderId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const tickets = loadTickets();
  tickets.unshift(ticket);
  saveTickets(tickets);
  return ticket;
}

export function addMessageToTicket(
  ticketId: string,
  params: {
    authorId: string;
    authorName: string;
    isAdmin: boolean;
    text: string;
  }
): TicketMessage | null {
  const tickets = loadTickets();
  const idx = tickets.findIndex((t) => t.id === ticketId);
  if (idx === -1) return null;

  const message: TicketMessage = {
    id: generateMessageId(),
    authorId: params.authorId,
    authorName: params.authorName,
    isAdmin: params.isAdmin,
    text: params.text,
    createdAt: new Date().toISOString(),
  };

  tickets[idx].messages.push(message);
  tickets[idx].updatedAt = new Date().toISOString();
  saveTickets(tickets);
  return message;
}

export function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
  extra?: { assignedTo?: string }
): Ticket | undefined {
  const tickets = loadTickets();
  const idx = tickets.findIndex((t) => t.id === ticketId);
  if (idx === -1) return undefined;

  tickets[idx] = {
    ...tickets[idx],
    status,
    updatedAt: new Date().toISOString(),
    ...(status === "resolved" ? { resolvedAt: new Date().toISOString() } : {}),
    ...(status === "closed" ? { closedAt: new Date().toISOString() } : {}),
    ...extra,
  };
  saveTickets(tickets);
  return tickets[idx];
}

export function getTicketStats(tickets: Ticket[]) {
  return {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    waitingUser: tickets.filter((t) => t.status === "waiting_user").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
    urgent: tickets.filter((t) => t.priority === "urgent" && t.status !== "resolved" && t.status !== "closed").length,
  };
}
