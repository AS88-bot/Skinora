import { Product, RetailerOffer, ScannedOffer, ScannedProductComparison, StoreName, ProductCategory, ShadeOption } from '../types';

export interface QuickScanSample {
  label: string;
  query: string;
  type: 'url' | 'name';
  brand: string;
  category: ProductCategory;
}

export const POPULAR_SCAN_SAMPLES: QuickScanSample[] = [
  {
    label: 'Laneige Lip Sleeping Mask (Berry 20g)',
    query: 'https://www.nykaa.com/laneige-lip-sleeping-mask-berry/p/399552',
    type: 'url',
    brand: 'Laneige',
    category: 'Lipsticks',
  },
  {
    label: 'Minimalist 10% Vitamin C Serum (30ml)',
    query: 'https://www.amazon.in/Minimalist-10-Vitamin-Face-Serum/dp/B08F9W1N49',
    type: 'url',
    brand: 'Minimalist',
    category: 'Serums',
  },
  {
    label: 'COSRX Advanced Snail 96 Mucin Essence (100ml)',
    query: 'https://www.tirabeauty.com/product/cosrx-advanced-snail-96-mucin-power-essence-100ml',
    type: 'url',
    brand: 'COSRX',
    category: 'Skincare',
  },
  {
    label: 'L\'Oréal Paris Infallible Fresh Wear Foundation',
    query: 'https://www.myntra.com/makeup/loreal/loreal-paris-infallible-24h-fresh-wear-foundation/1293812/buy',
    type: 'url',
    brand: 'L\'Oréal Paris',
    category: 'Makeup',
  },
  {
    label: 'Maybelline New York Superstay Vinyl Ink',
    query: 'Maybelline Superstay Vinyl Ink Liquid Lipstick Cheeky',
    type: 'name',
    brand: 'Maybelline',
    category: 'Lipsticks',
  },
];

/**
 * Parses any pasted product URL or raw query into metadata
 */
export function parseProductQueryOrUrl(input: string): {
  isUrl: boolean;
  detectedDomain?: string;
  cleanedTitle: string;
  detectedBrand?: string;
  detectedCategory: ProductCategory;
} {
  const trimmed = input.trim();
  const isUrl = /^(https?:\/\/|[a-z0-9-]+\.(com|in|co|org|net))/i.test(trimmed);

  if (isUrl) {
    try {
      const fullUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      const urlObj = new URL(fullUrl);
      const host = urlObj.hostname.toLowerCase();
      let detectedDomain = 'External Store';
      if (host.includes('nykaa')) detectedDomain = 'Nykaa';
      else if (host.includes('myntra')) detectedDomain = 'Myntra';
      else if (host.includes('amazon')) detectedDomain = 'Amazon';
      else if (host.includes('tira')) detectedDomain = 'Tira';
      else if (host.includes('sephora')) detectedDomain = 'Sephora';
      else if (host.includes('purplle')) detectedDomain = 'Purplle';
      else if (host.includes('dotandkey')) detectedDomain = 'Dot & Key';
      else if (host.includes('beminimalist')) detectedDomain = 'Minimalist';

      // Extract title from pathname
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      let slug = pathParts[pathParts.length - 1] || pathParts[0] || 'beauty-product';
      // If ends with numeric ID or /p/ /dp/, check previous segment
      if (/^(\d+|p|dp|buy)$/i.test(slug) && pathParts.length > 1) {
        slug = pathParts[pathParts.length - 2];
      }

      // Convert slug into human readable title
      let readable = slug
        .replace(/[-_]+/g, ' ')
        .replace(/\b(dp|p|buy|item|products?)\b/gi, '')
        .trim();

      // Capitalize words
      readable = readable
        .split(' ')
        .filter((w) => w.length > 0)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

      if (readable.length < 5) {
        readable = 'Premium Beauty Product';
      }

      // Detect brand & category
      const brand = detectBrandFromText(readable);
      const cat = detectCategoryFromText(readable);

      return {
        isUrl: true,
        detectedDomain,
        cleanedTitle: readable,
        detectedBrand: brand,
        detectedCategory: cat,
      };
    } catch {
      // Fallback if URL parsing failed
    }
  }

  // Not a URL or URL parse failed
  const cleaned = trimmed.replace(/\s+/g, ' ');
  const brand = detectBrandFromText(cleaned);
  const cat = detectCategoryFromText(cleaned);

  return {
    isUrl: false,
    cleanedTitle: cleaned,
    detectedBrand: brand,
    detectedCategory: cat,
  };
}

function detectBrandFromText(text: string): string {
  const lower = text.toLowerCase();
  const brandMap: Record<string, string> = {
    laneige: 'Laneige',
    minimalist: 'Minimalist',
    cosrx: 'COSRX',
    maybelline: 'Maybelline',
    'dot & key': 'Dot & Key',
    'dot and key': 'Dot & Key',
    lakme: 'Lakmé',
    'l\'oreal': 'L\'Oréal Paris',
    loreal: 'L\'Oréal Paris',
    sephora: 'Sephora Collection',
    'the ordinary': 'The Ordinary',
    'rare beauty': 'Rare Beauty',
    'huda beauty': 'Huda Beauty',
    cetaphil: 'Cetaphil',
    plum: 'Plum',
    pilgrim: 'Pilgrim',
    sugar: 'SUGAR Cosmetics',
    clinique: 'Clinique',
    maccosmetics: 'M.A.C',
    mac: 'M.A.C',
    mamaearth: 'Mamaearth',
    bioderma: 'Bioderma',
    cerave: 'CeraVe',
  };

  for (const [key, brandName] of Object.entries(brandMap)) {
    if (lower.includes(key)) {
      return brandName;
    }
  }

  // Fallback: pick first word or "Beauty Co."
  const words = text.split(' ');
  return words[0] && words[0].length > 2 ? words[0] : 'Skinora Verified Brand';
}

function detectCategoryFromText(text: string): ProductCategory {
  const lower = text.toLowerCase();
  if (lower.includes('lip') || lower.includes('tint') || lower.includes('velvet') || lower.includes('matte ink')) {
    return 'Lipsticks';
  }
  if (lower.includes('foundation') || lower.includes('primer') || lower.includes('blush') || lower.includes('compact') || lower.includes('makeup')) {
    return 'Makeup';
  }
  if (lower.includes('serum') || lower.includes('niacinamide') || lower.includes('vitamin c') || lower.includes('salicylic') || lower.includes('hyaluronic')) {
    return 'Serums';
  }
  if (lower.includes('hair') || lower.includes('oil') || lower.includes('shampoo') || lower.includes('scalp')) {
    return 'Haircare';
  }
  if (lower.includes('roll-on') || lower.includes('deodorant') || lower.includes('body wash') || lower.includes('hygiene')) {
    return 'Personal Hygiene';
  }
  return 'Skincare';
}

/**
 * Compares prices across stores for a given product query or URL
 */
export async function compareProductPrices(
  queryOrUrl: string,
  catalog: Product[]
): Promise<ScannedProductComparison> {
  // Artificial realistic network delay (600ms) for pleasant UI scanning feedback
  await new Promise((resolve) => setTimeout(resolve, 600));

  const parsed = parseProductQueryOrUrl(queryOrUrl);
  const lowerQuery = (parsed.cleanedTitle || queryOrUrl).toLowerCase();

  // 1. Check if it matches an existing product in our verified catalog
  const matchedInCatalog = catalog.find((p) => {
    const matchTitle = p.title.toLowerCase().includes(lowerQuery) || lowerQuery.includes(p.title.toLowerCase());
    const matchBrand = p.brand.toLowerCase() === (parsed.detectedBrand || '').toLowerCase();
    return matchTitle || (matchBrand && lowerQuery.includes(p.category.toLowerCase()));
  });

  if (matchedInCatalog) {
    // Generate full multi-store comparison based on verified catalog product
    return buildComparisonFromCatalogProduct(matchedInCatalog, queryOrUrl, parsed.isUrl, parsed.detectedDomain);
  }

  // 2. Generate simulated live multi-store comparison for newly scanned product
  return buildComparisonForExternalProduct(queryOrUrl, parsed);
}

function buildComparisonFromCatalogProduct(
  product: Product,
  originalInput: string,
  isUrl: boolean,
  detectedDomain?: string
): ScannedProductComparison {
  const baseOffers = [...product.offers];
  const lowestBase = baseOffers.sort((a, b) => a.price - b.price)[0] || baseOffers[0];
  const mrp = lowestBase?.mrp || 899;

  // Enhance store offers with coupon savings, live perks and extra retailers (Amazon, Tira)
  const storesToInclude: { name: StoreName; priceRatio: number; couponCode: string; couponVal: number; delivery: string; perk: string }[] = [
    { name: 'Nykaa', priceRatio: 0.78, couponCode: 'NYKAA10', couponVal: 40, delivery: '1 - 2 Days', perk: 'Free surprise pouch on ₹499+' },
    { name: 'Myntra', priceRatio: 0.74, couponCode: 'BEAUTY15', couponVal: 60, delivery: 'Tomorrow by 2 PM', perk: 'Extra 10% Myntra Insider discount' },
    { name: 'Amazon', priceRatio: 0.76, couponCode: 'AMZPRIME', couponVal: 30, delivery: 'Same Day with Prime', perk: 'Free Prime One-Day delivery' },
    { name: 'Tira', priceRatio: 0.82, couponCode: 'TIRANEW', couponVal: 75, delivery: '2 - 3 Days', perk: 'Free luxury travel sample kit' },
    { name: 'Sephora', priceRatio: 0.95, couponCode: 'BEAUTYPASS', couponVal: 0, delivery: '2 Days', perk: 'Earn 2x Beauty Pass tier points' },
    { name: 'Official Store', priceRatio: 0.88, couponCode: 'DIRECT10', couponVal: 50, delivery: '2 - 4 Days', perk: '100% Direct brand authenticity warranty' },
  ];

  const scannedOffers: ScannedOffer[] = storesToInclude.map((store) => {
    const rawPrice = Math.round(mrp * store.priceRatio);
    const existingOffer = product.offers.find((o) => o.storeName === store.name);
    const price = existingOffer ? existingOffer.price : rawPrice;
    const effectivePriceWithCoupon = Math.max(100, price - store.couponVal);
    const couponSavings = price - effectivePriceWithCoupon;

    return {
      storeName: store.name,
      price,
      mrp,
      discountPercent: Math.round(((mrp - price) / mrp) * 100),
      productUrl: existingOffer?.productUrl || `https://www.${store.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/search?q=${encodeURIComponent(product.title)}`,
      inStock: true,
      deliveryEstimate: existingOffer?.deliveryEstimate || store.delivery,
      perk: existingOffer?.perk || store.perk,
      couponCode: store.couponCode,
      effectivePriceWithCoupon,
      couponSavings,
      trustScore: store.name === 'Official Store' || store.name === 'Sephora' ? 99 : 96,
      isLowest: false,
    };
  });

  // Sort by effective price with coupon
  scannedOffers.sort((a, b) => (a.effectivePriceWithCoupon ?? a.price) - (b.effectivePriceWithCoupon ?? b.price));
  scannedOffers[0].isLowest = true;

  const lowest = scannedOffers[0];
  const highest = scannedOffers[scannedOffers.length - 1];
  const savingsVsHighest = (highest.effectivePriceWithCoupon ?? highest.price) - (lowest.effectivePriceWithCoupon ?? lowest.price);
  const savingsVsMrp = mrp - (lowest.effectivePriceWithCoupon ?? lowest.price);
  const savingsPercent = Math.round((savingsVsHighest / (highest.effectivePriceWithCoupon ?? highest.price)) * 100);

  return {
    id: `scan-${product.id}-${Date.now()}`,
    queryOrUrl: originalInput,
    isUrl,
    detectedDomain,
    product,
    scannedOffers,
    lowestOffer: lowest,
    highestOffer: highest,
    savingsVsHighest,
    savingsVsMrp,
    savingsPercent,
    bestStoreName: lowest.storeName,
    verdictTitle: `Buy on ${lowest.storeName} to get the lowest price of ₹${lowest.effectivePriceWithCoupon ?? lowest.price}!`,
    verdictReason: `Save ₹${savingsVsHighest} (${savingsPercent}%) compared to ${highest.storeName}. Apply coupon code "${lowest.couponCode}" at checkout to get an extra ₹${lowest.couponSavings} off with ${lowest.deliveryEstimate} delivery.`,
    recommendedCoupon: lowest.couponCode,
    scannedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };
}

function buildComparisonForExternalProduct(
  originalInput: string,
  parsed: ReturnType<typeof parseProductQueryOrUrl>
): ScannedProductComparison {
  const brand = parsed.detectedBrand || 'Top Beauty';
  const title = parsed.cleanedTitle;
  const category = parsed.detectedCategory;

  // Realistic MRP based on category
  let mrp = 999;
  if (category === 'Lipsticks') mrp = 799;
  if (category === 'Makeup') mrp = 1299;
  if (category === 'Serums') mrp = 899;
  if (category === 'Haircare') mrp = 699;
  if (category === 'Personal Hygiene') mrp = 449;

  // Shade options if lipstick or makeup
  let shadeOptions: ShadeOption[] | undefined;
  if (category === 'Lipsticks') {
    shadeOptions = [
      { name: 'Berry Glaze', hex: '#A82D46', code: '01' },
      { name: 'Warm Terracotta', hex: '#BA5044', code: '02' },
      { name: 'Velvet Rose', hex: '#B84562', code: '03' },
      { name: 'Spiced Nude', hex: '#9E5B4B', code: '04' },
    ];
  } else if (category === 'Makeup') {
    shadeOptions = [
      { name: '115 Warm Ivory', hex: '#F0D4B8', code: '115' },
      { name: '128 Warm Nude', hex: '#E7BD9A', code: '128' },
      { name: '220 Natural Beige', hex: '#D6A67E', code: '220' },
      { name: '310 Sun Beige', hex: '#C28B62', code: '310' },
    ];
  }

  // Create store offers with dynamic price variances
  const storesConfig: { name: StoreName; discount: number; coupon: string; couponVal: number; delivery: string; perk: string }[] = [
    { name: 'Myntra', discount: 32, coupon: 'BEAUTYGLOW', couponVal: 50, delivery: 'Tomorrow by 11 AM', perk: 'Extra 10% on Myntra Card' },
    { name: 'Nykaa', discount: 28, coupon: 'NYKAASAVE', couponVal: 40, delivery: '1 - 2 Days', perk: 'Free beauty pouch with order' },
    { name: 'Amazon', discount: 26, coupon: 'PRIME15', couponVal: 35, delivery: 'Same-day Prime delivery', perk: 'Guaranteed genuine Amazon Fulfilled' },
    { name: 'Tira', discount: 24, coupon: 'TIRAFIRST', couponVal: 65, delivery: '2 - 3 Days', perk: 'Free deluxe miniature on ₹799+' },
    { name: 'Official Store', discount: 15, coupon: 'DIRECTBUY', couponVal: 40, delivery: '2 - 4 Days', perk: '100% Brand warranty & direct batch' },
    { name: 'Sephora', discount: 5, coupon: 'SEPHORALUXE', couponVal: 0, delivery: '2 Days', perk: 'Luxury beauty points & samples' },
  ];

  const scannedOffers: ScannedOffer[] = storesConfig.map((store) => {
    const price = Math.round(mrp * (1 - store.discount / 100));
    const effectivePriceWithCoupon = Math.max(100, price - store.couponVal);
    const couponSavings = price - effectivePriceWithCoupon;

    return {
      storeName: store.name,
      price,
      mrp,
      discountPercent: store.discount,
      productUrl: `https://www.${store.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/search?q=${encodeURIComponent(title)}`,
      inStock: true,
      deliveryEstimate: store.delivery,
      perk: store.perk,
      couponCode: store.coupon,
      effectivePriceWithCoupon,
      couponSavings,
      trustScore: 98,
      isLowest: false,
    };
  });

  // Sort by lowest effective price
  scannedOffers.sort((a, b) => (a.effectivePriceWithCoupon ?? a.price) - (b.effectivePriceWithCoupon ?? b.price));
  scannedOffers[0].isLowest = true;

  const lowest = scannedOffers[0];
  const highest = scannedOffers[scannedOffers.length - 1];
  const savingsVsHighest = (highest.effectivePriceWithCoupon ?? highest.price) - (lowest.effectivePriceWithCoupon ?? lowest.price);
  const savingsVsMrp = mrp - (lowest.effectivePriceWithCoupon ?? lowest.price);
  const savingsPercent = Math.round((savingsVsHighest / (highest.effectivePriceWithCoupon ?? highest.price)) * 100);

  // Fallback high quality beauty images
  const defaultImages: Record<ProductCategory, string> = {
    Lipsticks: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
    Makeup: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    Serums: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    Skincare: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    Haircare: 'https://images.unsplash.com/photo-1608248597359-5489f074d2cb?auto=format&fit=crop&w=600&q=80',
    'Personal Hygiene': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
  };

  const product: Product = {
    id: `scanned-${Date.now()}`,
    title,
    brand,
    category,
    imageURL: defaultImages[category] || defaultImages.Skincare,
    skinType: ['All Skin Types'],
    concerns: ['Hydration & Dryness', 'Dullness & Glow'],
    rating: 4.7,
    reviewsCount: 3840,
    volume: category === 'Lipsticks' ? '4.5 ml' : category === 'Serums' ? '30 ml' : '50 ml',
    shadeOptions,
    description: `Tracked directly via Skinora Live Price Engine for "${originalInput}". Real-time cross-store verification reveals ${lowest.storeName} provides the most affordable rate with verified coupons.`,
    ingredients: ['Water', 'Glycerin', 'Niacinamide', 'Squalane', 'Centella Asiatica', 'Tocopherol (Vitamin E)'],
    keyHighlights: [
      `Cheapest price verified at ₹${lowest.effectivePriceWithCoupon ?? lowest.price} on ${lowest.storeName}`,
      `Instant coupon code "${lowest.couponCode}" saves an additional ₹${lowest.couponSavings}`,
      `100% Genuine authorized seller fulfillment with ${lowest.deliveryEstimate} delivery`,
    ],
    offers: scannedOffers,
    priceAnalytics: {
      productId: `scanned-${Date.now()}`,
      allTimeLow: lowest.price - 20,
      avgPrice30: Math.round(mrp * 0.8),
      avgPrice90: Math.round(mrp * 0.85),
      dealVerdict: 'Outstanding Deal',
      verdictNote: `Currently at lowest price of ₹${lowest.effectivePriceWithCoupon ?? lowest.price} on ${lowest.storeName}, saving ₹${savingsVsHighest} vs ${highest.storeName}.`,
      data30: [
        { date: 'Oct 10', Nykaa: mrp * 0.85, Sephora: mrp, Myntra: mrp * 0.82, lowest: mrp * 0.82 },
        { date: 'Oct 20', Nykaa: mrp * 0.8, Sephora: mrp, Myntra: mrp * 0.76, lowest: mrp * 0.76 },
        { date: 'Nov 01', Nykaa: lowest.price + 30, Sephora: mrp, Myntra: lowest.price, lowest: lowest.price },
      ],
      data90: [
        { date: 'Aug 15', Nykaa: mrp * 0.9, Sephora: mrp, Myntra: mrp * 0.88, lowest: mrp * 0.88 },
        { date: 'Sep 15', Nykaa: mrp * 0.85, Sephora: mrp, Myntra: mrp * 0.8, lowest: mrp * 0.8 },
        { date: 'Oct 15', Nykaa: mrp * 0.8, Sephora: mrp, Myntra: lowest.price + 20, lowest: lowest.price + 20 },
        { date: 'Nov 07', Nykaa: lowest.price + 30, Sephora: mrp, Myntra: lowest.price, lowest: lowest.price },
      ],
    },
  };

  return {
    id: `scan-${Date.now()}`,
    queryOrUrl: originalInput,
    isUrl: parsed.isUrl,
    detectedDomain: parsed.detectedDomain,
    product,
    scannedOffers,
    lowestOffer: lowest,
    highestOffer: highest,
    savingsVsHighest,
    savingsVsMrp,
    savingsPercent,
    bestStoreName: lowest.storeName,
    verdictTitle: `Buy on ${lowest.storeName} to get the lowest price of ₹${lowest.effectivePriceWithCoupon ?? lowest.price}!`,
    verdictReason: `Save ₹${savingsVsHighest} (${savingsPercent}%) compared to buying on ${highest.storeName}. Use code "${lowest.couponCode}" for extra ₹${lowest.couponSavings} off with ${lowest.deliveryEstimate} shipping.`,
    recommendedCoupon: lowest.couponCode,
    scannedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };
}
