export type StoreName =
  | 'Nykaa'
  | 'Sephora'
  | 'Dot & Key'
  | 'Myntra'
  | 'Amazon'
  | 'Tira'
  | 'Official Store';

export type ProductCategory =
  | 'Skincare'
  | 'Lipsticks'
  | 'Makeup'
  | 'Haircare'
  | 'Personal Hygiene'
  | 'Serums';

export type SkinType =
  | 'All Skin Types'
  | 'Oily'
  | 'Dry'
  | 'Combination'
  | 'Sensitive'
  | 'Normal'
  | 'Acne-Prone';

export type SkinConcern =
  | 'Acne & Blemishes'
  | 'Hydration & Dryness'
  | 'Dullness & Glow'
  | 'Pigmentation & Dark Spots'
  | 'Anti-Aging & Fine Lines'
  | 'Barrier Repair'
  | 'Oil Control & Pores'
  | 'Sun Protection';

export interface ShadeOption {
  name: string;
  hex: string;
  code?: string;
}

export interface RetailerOffer {
  storeName: StoreName;
  price: number;
  mrp: number;
  discountPercent: number;
  productUrl: string;
  inStock: boolean;
  deliveryEstimate: string;
  perk?: string;
  isLowest?: boolean;
}

export interface PriceHistoryPoint {
  date: string;
  Nykaa: number;
  Sephora: number;
  'Dot & Key'?: number;
  Myntra: number;
  lowest: number;
}

export interface ProductPriceAnalytics {
  productId: string;
  data30: PriceHistoryPoint[];
  data90: PriceHistoryPoint[];
  allTimeLow: number;
  avgPrice30: number;
  avgPrice90: number;
  dealVerdict: 'Outstanding Deal' | 'Good Price' | 'Average' | 'Wait for Sale';
  verdictNote: string;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: ProductCategory;
  imageURL: string;
  secondaryImageURL?: string;
  skinType: SkinType[];
  concerns: SkinConcern[];
  rating: number;
  reviewsCount: number;
  description: string;
  volume: string;
  shadeOptions?: ShadeOption[];
  ingredients: string[];
  keyHighlights: string[];
  offers: RetailerOffer[];
  priceAnalytics: ProductPriceAnalytics;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
  targetAlertPrice: number;
  alertTriggered: boolean;
  lastAlertDate?: string;
}

export interface NotificationAlert {
  id: string;
  productId: string;
  productTitle: string;
  brand: string;
  storeName: StoreName;
  oldPrice: number;
  newPrice: number;
  targetPrice: number;
  timestamp: string;
  read: boolean;
}

export interface FilterState {
  searchQuery: string;
  category: ProductCategory | 'All';
  brand: string | 'All';
  selectedStore: StoreName | 'All';
  skinType: SkinType | 'All';
  concern: SkinConcern | 'All';
  priceRange: [number, number];
  inStockOnly: boolean;
  sortBy: 'lowestPrice' | 'discount' | 'rating' | 'popular';
}

export interface ScannedOffer extends RetailerOffer {
  couponCode?: string;
  effectivePriceWithCoupon?: number;
  couponSavings?: number;
  freebieText?: string;
  trustScore?: number;
}

export interface ScannedProductComparison {
  id: string;
  queryOrUrl: string;
  isUrl: boolean;
  detectedDomain?: string;
  product: Product;
  scannedOffers: ScannedOffer[];
  lowestOffer: ScannedOffer;
  highestOffer: ScannedOffer;
  savingsVsHighest: number;
  savingsVsMrp: number;
  savingsPercent: number;
  bestStoreName: StoreName;
  verdictTitle: string;
  verdictReason: string;
  recommendedCoupon?: string;
  scannedAt: string;
}

