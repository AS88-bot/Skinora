import { WishlistItem, NotificationAlert } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';

const WISHLIST_STORAGE_KEY = 'skinora_wishlist_v3';
const NOTIFICATIONS_STORAGE_KEY = 'skinora_notifications_v3';

export function getWishlist(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) {
      // Seed initial sample wishlist with 2 items so the user immediately sees the alerts & tracking in action!
      const initialSeed: WishlistItem[] = [
        {
          productId: 'prod-dot-key-cica-serum',
          addedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          targetAlertPrice: 510,
          alertTriggered: true,
          lastAlertDate: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        },
        {
          productId: 'prod-maybelline-superstay',
          addedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
          targetAlertPrice: 470,
          alertTriggered: true,
          lastAlertDate: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        },
      ];
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(initialSeed));
      return initialSeed;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveWishlist(items: WishlistItem[]): void {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota
  }
}

export function toggleWishlist(productId: string, defaultTargetPrice?: number): WishlistItem[] {
  const current = getWishlist();
  const exists = current.some((item) => item.productId === productId);
  let updated: WishlistItem[];

  if (exists) {
    updated = current.filter((item) => item.productId !== productId);
  } else {
    const product = INITIAL_PRODUCTS.find((p) => p.id === productId);
    const lowestOffer = product?.offers
      .filter((o) => o.inStock)
      .sort((a, b) => a.price - b.price)[0];
    const initialTarget = defaultTargetPrice ?? (lowestOffer ? Math.round(lowestOffer.price * 0.9) : 500);

    updated = [
      ...current,
      {
        productId,
        addedAt: new Date().toISOString(),
        targetAlertPrice: initialTarget,
        alertTriggered: false,
      },
    ];
  }

  saveWishlist(updated);
  return updated;
}

export function updateTargetPrice(productId: string, newTarget: number): WishlistItem[] {
  const current = getWishlist();
  const product = INITIAL_PRODUCTS.find((p) => p.id === productId);
  const lowestPrice = product?.offers
    .filter((o) => o.inStock)
    .reduce((min, o) => (o.price < min ? o.price : min), Infinity) ?? Infinity;

  const updated = current.map((item) => {
    if (item.productId === productId) {
      const isTriggered = lowestPrice <= newTarget;
      return {
        ...item,
        targetAlertPrice: newTarget,
        alertTriggered: isTriggered,
        lastAlertDate: isTriggered
          ? new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
          : item.lastAlertDate,
      };
    }
    return item;
  });

  saveWishlist(updated);
  return updated;
}

export function getNotifications(): NotificationAlert[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      // Provide an initial live notification to show the alert banner feature
      const initial: NotificationAlert[] = [
        {
          id: 'alert-seed-1',
          productId: 'prod-dot-key-cica-serum',
          productTitle: 'Dot & Key 10% Niacinamide + Cica Spot Clarifying Face Serum (30 ml)',
          brand: 'Dot & Key',
          storeName: 'Nykaa',
          oldPrice: 549,
          newPrice: 499,
          targetPrice: 510,
          timestamp: '2 hours ago',
          read: false,
        },
      ];
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNotifications(notifications: NotificationAlert[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // Ignore
  }
}

export function dismissNotification(id: string): NotificationAlert[] {
  const current = getNotifications();
  const updated = current.filter((n) => n.id !== id);
  saveNotifications(updated);
  return updated;
}

export function simulatePriceDropAlert(productId?: string): NotificationAlert {
  const product = productId
    ? INITIAL_PRODUCTS.find((p) => p.id === productId) || INITIAL_PRODUCTS[0]
    : INITIAL_PRODUCTS[Math.floor(Math.random() * INITIAL_PRODUCTS.length)];

  const inStockOffers = product.offers.filter((o) => o.inStock);
  const offer = inStockOffers[0] || product.offers[0];
  const oldPrice = offer.price;
  const dropAmount = Math.max(30, Math.round(oldPrice * 0.12));
  const newPrice = Math.max(99, oldPrice - dropAmount);

  const newAlert: NotificationAlert = {
    id: `alert-${Date.now()}`,
    productId: product.id,
    productTitle: product.title,
    brand: product.brand,
    storeName: offer.storeName,
    oldPrice: oldPrice,
    newPrice: newPrice,
    targetPrice: oldPrice - 20,
    timestamp: 'Just now',
    read: false,
  };

  const current = getNotifications();
  const updated = [newAlert, ...current.slice(0, 8)];
  saveNotifications(updated);
  return newAlert;
}
