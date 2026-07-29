import { productsData } from "./products";

// ==================== Types ====================
export interface StockNotification {
  id: string;
  userId: string;
  userEmail: string;
  productId: string;
  productName: string;
  createdAt: string;
  notifiedAt: string | null; // when admin marked as available
}

// ==================== Storage ====================
const STORAGE_KEY = "satoshi_stock_notifications";

function loadAll(): StockNotification[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAll(list: StockNotification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ==================== Public API ====================
export function getNotificationsByUser(userId: string): StockNotification[] {
  return loadAll().filter((n) => n.userId === userId);
}

export function getNotificationsByProduct(productId: string): StockNotification[] {
  return loadAll().filter((n) => n.productId === productId);
}

export function getNotificationStats() {
  const all = loadAll();
  return {
    total: all.length,
    pending: all.filter((n) => n.notifiedAt === null).length,
    notified: all.filter((n) => n.notifiedAt !== null).length,
  };
}

export function getPendingNotifications(): StockNotification[] {
  return loadAll().filter((n) => n.notifiedAt === null);
}

export function getPendingByProduct(): { productId: string; productName: string; count: number }[] {
  const pending = getPendingNotifications();
  const map = new Map<string, { productId: string; productName: string; count: number }>();
  pending.forEach((n) => {
    const existing = map.get(n.productId);
    if (existing) {
      existing.count++;
    } else {
      map.set(n.productId, { productId: n.productId, productName: n.productName, count: 1 });
    }
  });
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export function isUserSubscribed(userId: string, productId: string): boolean {
  return loadAll().some((n) => n.userId === userId && n.productId === productId && n.notifiedAt === null);
}

export function generateStockNotifId(): string {
  return "sn-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 7);
}

export function subscribeToStock(userId: string, userEmail: string, productId: string): StockNotification | null {
  const product = productsData.find((p) => p.id === productId);
  if (!product) return null;

  const all = loadAll();

  // Prevent duplicate active subscription
  if (all.some((n) => n.userId === userId && n.productId === productId && n.notifiedAt === null)) {
    return null;
  }

  const notification: StockNotification = {
    id: generateStockNotifId(),
    userId,
    userEmail,
    productId,
    productName: product.name,
    createdAt: new Date().toISOString(),
    notifiedAt: null,
  };

  all.push(notification);
  saveAll(all);
  return notification;
}

export function markAsAvailable(notificationId: string): StockNotification | null {
  const all = loadAll();
  const idx = all.findIndex((n) => n.id === notificationId);
  if (idx === -1) return null;

  all[idx].notifiedAt = new Date().toISOString();
  saveAll(all);
  return all[idx];
}

export function markAllAsAvailableForProduct(productId: string): number {
  const all = loadAll();
  let count = 0;
  all.forEach((n) => {
    if (n.productId === productId && n.notifiedAt === null) {
      n.notifiedAt = new Date().toISOString();
      count++;
    }
  });
  saveAll(all);
  return count;
}

export function unsubscribeFromStock(notificationId: string): boolean {
  const all = loadAll();
  const filtered = all.filter((n) => n.id !== notificationId);
  if (filtered.length === all.length) return false;
  saveAll(filtered);
  return true;
}

export function getRecentlyAvailableNotifications(userId: string): StockNotification[] {
  const all = loadAll();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return all.filter(
    (n) =>
      n.userId === userId &&
      n.notifiedAt !== null &&
      new Date(n.notifiedAt).getTime() > sevenDaysAgo
  );
}
