/**
 * scripts/seed-marketplace.ts
 *
 * Seeds the marketplace with realistic data:
 * - 20 sellers (Clerk + Prisma) with curated stores
 * - 10 buyers (Clerk + Prisma)
 * - ~700 seller products (30-50 per store, category-themed)
 * - ~300 completed orders spread across buyers
 * - ~250 store reviews with sub-ratings + ~30% seller replies
 * - 8 ad subscriptions (ACTIVE) across various tiers
 * - Addresses, store analytics, order analytics
 *
 * SAFETY: Wipes prior seed data (matching emails) before re-insert.
 * All accounts use password: Test1234!
 * Login info written to scripts/seed-accounts.txt
 */

import "dotenv/config";
import { PrismaClient, Role, AccountStatus, SellerProductStatus, OrderStatus, PaymentMethod, AdSubscriptionStatus, AdPlanTier } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClerkClient } from "@clerk/backend";
import * as fs from "fs";
import * as path from "path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

const PASSWORD = "MhX!2026Seed#Pass";
const ACCOUNTS_FILE = path.join(__dirname, "seed-accounts.txt");

// ─── Helpers ──────────────────────────────────────────────────────
function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
// Weighted toward 4-5 stars
function weightedRating(): number {
  const r = Math.random();
  if (r < 0.55) return 5;
  if (r < 0.85) return 4;
  if (r < 0.95) return 3;
  if (r < 0.99) return 2;
  return 1;
}
function randomDateBetween(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function avatarUrl(name: string, color = "E53935"): string {
  const initials = name.split(" ").map((s) => s[0]).join("").toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color}&color=fff&size=200&bold=true`;
}
function bannerUrl(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/400`;
}

// ─── Realistic Data ───────────────────────────────────────────────

// 20 sellers with curated store names + themes
type StoreTheme = "tech" | "fashion-women" | "fashion-men" | "beauty" | "home" | "sports" | "kitchen" | "accessories" | "jewelry" | "pets";

interface SellerSeed {
  firstName: string;
  lastName: string;
  storeName: string;
  description: string;
  theme: StoreTheme;
  country: string;
  city: string;
}

const SELLERS: SellerSeed[] = [
  { firstName: "Liam", lastName: "Hayes", storeName: "Aurora Tech Hub", description: "Premium electronics, gadgets, and smart devices for the modern lifestyle.", theme: "tech", country: "United States", city: "San Francisco" },
  { firstName: "Sophia", lastName: "Lindqvist", storeName: "Nordic Goods Co", description: "Scandinavian-inspired home essentials with timeless minimalist design.", theme: "home", country: "Sweden", city: "Stockholm" },
  { firstName: "Isabella", lastName: "Marino", storeName: "Sunset Boutique", description: "Curated women's fashion that captures effortless coastal elegance.", theme: "fashion-women", country: "United States", city: "Los Angeles" },
  { firstName: "Olivia", lastName: "Chen", storeName: "Velvet Atelier", description: "Luxury handbags, jewelry, and accessories for the discerning shopper.", theme: "jewelry", country: "United States", city: "New York" },
  { firstName: "Marcus", lastName: "Steele", storeName: "Ironclad Gear", description: "Heavy-duty tools, fitness equipment, and outdoor essentials.", theme: "sports", country: "United States", city: "Denver" },
  { firstName: "Amelia", lastName: "Brookes", storeName: "Bloom and Bark", description: "Botanical home decor, plants, and natural wellness products.", theme: "home", country: "United Kingdom", city: "London" },
  { firstName: "Ethan", lastName: "Walsh", storeName: "Harbor Supply", description: "Coastal lifestyle goods, marine accessories, and weekend essentials.", theme: "accessories", country: "United States", city: "Boston" },
  { firstName: "Noah", lastName: "Reinhardt", storeName: "Evergreen Outfitters", description: "Sustainable outdoor apparel and adventure-ready gear.", theme: "fashion-men", country: "Canada", city: "Vancouver" },
  { firstName: "Ava", lastName: "Tanaka", storeName: "Kyoto Beauty Lab", description: "Japanese skincare, cosmetics, and self-care rituals.", theme: "beauty", country: "Japan", city: "Tokyo" },
  { firstName: "Lucas", lastName: "Mueller", storeName: "Blackforest Workshop", description: "German-engineered tools, home accessories, and lifestyle goods.", theme: "tech", country: "Germany", city: "Munich" },
  { firstName: "Mia", lastName: "Romero", storeName: "Casa Solana", description: "Mediterranean-inspired home decor, ceramics, and dinnerware.", theme: "kitchen", country: "United States", city: "Miami" },
  { firstName: "James", lastName: "O'Connor", storeName: "Highland Trading Co", description: "Classic men's apparel, leather goods, and timeless accessories.", theme: "fashion-men", country: "United Kingdom", city: "Edinburgh" },
  { firstName: "Charlotte", lastName: "Dubois", storeName: "Petit Paris Closet", description: "Parisian chic dresses, blouses, and fashion-forward apparel.", theme: "fashion-women", country: "France", city: "Paris" },
  { firstName: "Benjamin", lastName: "Park", storeName: "Seoul Style Studio", description: "Korean streetwear, beauty products, and lifestyle accessories.", theme: "beauty", country: "South Korea", city: "Seoul" },
  { firstName: "Harper", lastName: "Wilson", storeName: "Wildflower Market", description: "Organic beauty, natural skincare, and wellness essentials.", theme: "beauty", country: "Australia", city: "Sydney" },
  { firstName: "Henry", lastName: "Van Dijk", storeName: "Amsterdam Trade House", description: "European designer accessories, watches, and leather goods.", theme: "accessories", country: "Netherlands", city: "Amsterdam" },
  { firstName: "Evelyn", lastName: "Carter", storeName: "Copperleaf Kitchen", description: "Premium cookware, kitchen tools, and culinary essentials.", theme: "kitchen", country: "United States", city: "Portland" },
  { firstName: "Daniel", lastName: "Akinwande", storeName: "Urban Forge Apparel", description: "Modern men's streetwear, sneakers, and statement pieces.", theme: "fashion-men", country: "United States", city: "Atlanta" },
  { firstName: "Grace", lastName: "Whitfield", storeName: "Pawsome Pantry", description: "Premium pet food, accessories, and care products for furry friends.", theme: "pets", country: "United Kingdom", city: "Manchester" },
  { firstName: "Theodore", lastName: "Klein", storeName: "Summit Sports Hub", description: "Athletic gear, performance apparel, and fitness equipment.", theme: "sports", country: "Germany", city: "Berlin" },
];

// 10 buyers
interface BuyerSeed {
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  state?: string;
  postalCode: string;
  street: string;
}
const BUYERS: BuyerSeed[] = [
  { firstName: "Emma", lastName: "Johnson", country: "United States", city: "Chicago", state: "IL", postalCode: "60601", street: "245 Lakeshore Dr" },
  { firstName: "Oliver", lastName: "Smith", country: "United Kingdom", city: "London", postalCode: "SW1A 1AA", street: "78 Baker Street" },
  { firstName: "Ava", lastName: "Williams", country: "Canada", city: "Toronto", state: "ON", postalCode: "M5V 3A8", street: "120 King St W" },
  { firstName: "Lucas", lastName: "Garcia", country: "United States", city: "Houston", state: "TX", postalCode: "77002", street: "1500 Main St Apt 12" },
  { firstName: "Mia", lastName: "Rodriguez", country: "United States", city: "Phoenix", state: "AZ", postalCode: "85001", street: "890 Camelback Rd" },
  { firstName: "Ethan", lastName: "Bennett", country: "Australia", city: "Melbourne", postalCode: "3000", street: "55 Collins Street" },
  { firstName: "Sophia", lastName: "Meier", country: "Germany", city: "Hamburg", postalCode: "20095", street: "Mönckebergstraße 7" },
  { firstName: "Noah", lastName: "Anderson", country: "United States", city: "Seattle", state: "WA", postalCode: "98101", street: "412 Pine Street" },
  { firstName: "Isabella", lastName: "Lefevre", country: "France", city: "Lyon", postalCode: "69002", street: "32 Rue de la République" },
  { firstName: "Liam", lastName: "Brown", country: "United States", city: "Austin", state: "TX", postalCode: "78701", street: "678 Congress Ave" },
];

// Map theme → matching catalog categories
const THEME_CATEGORIES: Record<StoreTheme, string[]> = {
  tech: ["electronics"],
  "fashion-women": ["womens-apparel", "fashion-accessories", "bags-wallets"],
  "fashion-men": ["mens-apparel", "fashion-accessories"],
  beauty: ["beauty-skincare"],
  home: ["home-living"],
  sports: ["sports-fitness"],
  kitchen: ["kitchen"],
  accessories: ["fashion-accessories", "bags-wallets", "jewelry"],
  jewelry: ["jewelry", "bags-wallets"],
  pets: ["pet-supplies"],
};

// Realistic review comments
const REVIEW_COMMENTS = [
  "Exactly as described, arrived faster than expected. Highly recommend this seller!",
  "Great quality product and excellent communication throughout. Will shop here again.",
  "Item quality is amazing for the price. Packaging was secure and professional.",
  "Beautiful product, even better in person. The seller answered all my questions promptly.",
  "Very happy with my purchase. Shipping was a bit slow but worth the wait.",
  "Stellar experience from start to finish. The product exceeded my expectations.",
  "Solid purchase. Would definitely recommend to friends and family.",
  "Fast shipping and the item is exactly what I needed. Five stars all around.",
  "Beautiful craftsmanship and attention to detail. So glad I found this store.",
  "Excellent value for money. The product feels premium and durable.",
  "Perfect fit and great quality. Communication with seller was top notch.",
  "Arrived on time and well-packaged. I'm very pleased with this order.",
  "Lovely product! Looks even better than the photos online.",
  "Shipping was super fast and the item is just as advertised. Thank you!",
  "Quality is fantastic for the price point. Definitely buying again soon.",
  "The seller went above and beyond to make sure I was happy. Great service.",
  "Product matches the description perfectly. Very satisfied customer here.",
  "Honestly impressed with how good this is. Highly recommended seller.",
  "Smooth transaction and the item is wonderful. Will be a repeat customer.",
  "Outstanding quality and exactly what I was hoping for. Thanks!",
];

const REPLY_TEMPLATES = [
  "Thank you so much for your kind words! We're thrilled you love it.",
  "We really appreciate your feedback! Hope to serve you again soon.",
  "Thank you for shopping with us! Your support means the world.",
  "So glad you're happy with your purchase! Come back anytime.",
  "Thanks for the wonderful review! We work hard to deliver quality.",
];

// ─── Step 1: Cleanup ──────────────────────────────────────────────
async function cleanup() {
  console.log("\n🧹 Cleaning up prior seed data...");

  const allEmails = [
    ...SELLERS.map((s) => `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase().replace(/[^a-z]/g, "")}@gmail.com`),
    ...BUYERS.map((b) => `${b.firstName.toLowerCase()}.${b.lastName.toLowerCase().replace(/[^a-z]/g, "")}@gmail.com`),
  ];

  // Find existing users by email
  const existingUsers = await prisma.user.findMany({
    where: { email: { in: allEmails } },
    select: { id: true, email: true, clerkId: true },
  });

  console.log(`  Found ${existingUsers.length} existing seed users to delete.`);

  // Delete from Clerk first
  for (const u of existingUsers) {
    if (u.clerkId) {
      try {
        await clerk.users.deleteUser(u.clerkId);
      } catch {
        // Ignore — user may already be gone
      }
    }
  }

  // Delete from Prisma — cascade will handle stores, products, orders, reviews, etc.
  if (existingUsers.length > 0) {
    await prisma.user.deleteMany({
      where: { id: { in: existingUsers.map((u) => u.id) } },
    });
  }

  // Also delete stores by name (in case orphaned)
  await prisma.store.deleteMany({
    where: { storeName: { in: SELLERS.map((s) => s.storeName) } },
  });

  console.log("  ✅ Cleanup complete.\n");
}

// ─── Step 2: Create sellers + stores ──────────────────────────────
interface CreatedSeller {
  userId: string;
  clerkId: string;
  storeId: string;
  email: string;
  firstName: string;
  lastName: string;
  storeName: string;
  theme: StoreTheme;
  registeredAt: Date;
}

async function createSellers(): Promise<CreatedSeller[]> {
  console.log("👤 Creating 20 sellers + stores...");
  const created: CreatedSeller[] = [];

  // Date range: Jan 2019 → Oct 2025
  const startDate = new Date("2019-01-01");
  const endDate = new Date("2025-10-31");

  for (let i = 0; i < SELLERS.length; i++) {
    const s = SELLERS[i];
    const email = `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase().replace(/[^a-z]/g, "")}@gmail.com`;
    const registeredAt = randomDateBetween(startDate, endDate);

    process.stdout.write(`  [${i + 1}/20] ${s.storeName}... `);

    try {
      // Create Clerk user
      const clerkUser = await clerk.users.createUser({
        emailAddress: [email],
        password: PASSWORD,
        firstName: s.firstName,
        lastName: s.lastName,
        publicMetadata: { role: "SELLER", status: "ACTIVE" },
        skipPasswordChecks: false,
      });

      // Create Prisma user + store
      const fullName = `${s.firstName} ${s.lastName}`;
      const user = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email,
          firstName: s.firstName,
          lastName: s.lastName,
          phone: `+1${randInt(2000000000, 9999999999)}`,
          role: Role.SELLER,
          status: AccountStatus.ACTIVE,
          password: PASSWORD,
          avatarUrl: avatarUrl(fullName),
          createdAt: registeredAt,
          updatedAt: registeredAt,
          store: {
            create: {
              storeName: s.storeName,
              storeSlug: slugify(s.storeName),
              description: s.description,
              logoUrl: avatarUrl(s.storeName, "1A1A1A"),
              bannerUrl: bannerUrl(s.storeName),
              businessType: "Individual",
              country: s.country,
              city: s.city,
              isVerified: true,
              approvedAt: new Date(registeredAt.getTime() + 3 * 24 * 60 * 60 * 1000),
              createdAt: registeredAt,
              updatedAt: registeredAt,
            },
          },
        },
        include: { store: true },
      });

      created.push({
        userId: user.id,
        clerkId: clerkUser.id,
        storeId: user.store!.id,
        email,
        firstName: s.firstName,
        lastName: s.lastName,
        storeName: s.storeName,
        theme: s.theme,
        registeredAt,
      });

      console.log(`✅`);
    } catch (e: any) {
      console.log(`❌ ${e.message}`);
      throw e;
    }
  }

  return created;
}

// ─── Step 3: Create buyers ────────────────────────────────────────
interface CreatedBuyer {
  userId: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  addressId: string;
  registeredAt: Date;
}

async function createBuyers(): Promise<CreatedBuyer[]> {
  console.log("\n🛒 Creating 10 buyers...");
  const created: CreatedBuyer[] = [];

  const startDate = new Date("2019-01-01");
  const endDate = new Date("2025-12-31");

  for (let i = 0; i < BUYERS.length; i++) {
    const b = BUYERS[i];
    const email = `${b.firstName.toLowerCase()}.${b.lastName.toLowerCase().replace(/[^a-z]/g, "")}@gmail.com`;
    const registeredAt = randomDateBetween(startDate, endDate);

    process.stdout.write(`  [${i + 1}/10] ${b.firstName} ${b.lastName}... `);

    const clerkUser = await clerk.users.createUser({
      emailAddress: [email],
      password: PASSWORD,
      firstName: b.firstName,
      lastName: b.lastName,
      publicMetadata: { role: "BUYER", status: "ACTIVE" },
    });

    const fullName = `${b.firstName} ${b.lastName}`;
    const user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        firstName: b.firstName,
        lastName: b.lastName,
        phone: `+1${randInt(2000000000, 9999999999)}`,
        role: Role.BUYER,
        status: AccountStatus.ACTIVE,
        password: PASSWORD,
        avatarUrl: avatarUrl(fullName, "2196F3"),
        createdAt: registeredAt,
        updatedAt: registeredAt,
        addresses: {
          create: {
            label: "Home",
            street: b.street,
            city: b.city,
            state: b.state || null,
            country: b.country,
            postalCode: b.postalCode,
            isDefault: true,
            createdAt: registeredAt,
          },
        },
      },
      include: { addresses: true },
    });

    created.push({
      userId: user.id,
      clerkId: clerkUser.id,
      email,
      firstName: b.firstName,
      lastName: b.lastName,
      addressId: user.addresses[0].id,
      registeredAt,
    });
    console.log("✅");
  }

  return created;
}

// ─── Step 4: Create seller products ───────────────────────────────
async function createProducts(sellers: CreatedSeller[]) {
  console.log("\n📦 Creating seller products (30-50 per store)...");

  // Cache catalog products by category
  const catalogByCategory: Record<string, any[]> = {};
  for (const cat of new Set(Object.values(THEME_CATEGORIES).flat())) {
    catalogByCategory[cat] = await prisma.product.findMany({
      where: { category: cat },
      take: 200,
    });
  }

  // Fallback: all products if theme has no matches
  const allProducts = await prisma.product.findMany({ take: 500 });

  let totalCreated = 0;

  for (let i = 0; i < sellers.length; i++) {
    const seller = sellers[i];
    const themeCats = THEME_CATEGORIES[seller.theme];
    let pool: any[] = [];
    for (const cat of themeCats) {
      pool.push(...(catalogByCategory[cat] || []));
    }
    if (pool.length < 30) pool = [...pool, ...allProducts];

    // Shuffle and pick 30-50
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const productCount = randInt(30, 50);
    const selected = shuffled.slice(0, productCount);

    process.stdout.write(`  [${i + 1}/20] ${seller.storeName}: ${productCount} products... `);

    const data = selected.map((p, idx) => {
      const margin = randInt(12, 22);
      const sellingPrice = +(p.price * (1 + margin / 100)).toFixed(2);
      const publishedAt = new Date(seller.registeredAt.getTime() + randInt(1, 60) * 24 * 60 * 60 * 1000);
      return {
        storeId: seller.storeId,
        dummyProductId: p.id,
        title: p.title,
        description: p.shortDescription || p.description?.substring(0, 200) || null,
        images: (p.images && p.images.length ? p.images : [p.thumbnail].filter(Boolean)) as any,
        category: p.category,
        brand: p.brand,
        basePrice: p.price,
        marginPercent: margin,
        sellingPrice,
        discountPct: p.discountPercentage || 0,
        stock: p.stock || randInt(20, 200),
        status: SellerProductStatus.PUBLISHED,
        sortOrder: idx,
        rating: p.rating,
        ratingCount: randInt(5, 80),
        publishedAt,
        createdAt: publishedAt,
        updatedAt: publishedAt,
      };
    });

    await prisma.sellerProduct.createMany({ data, skipDuplicates: true });
    totalCreated += data.length;
    console.log(`✅`);
  }

  console.log(`  Total products created: ${totalCreated}`);
  return totalCreated;
}

// ─── Step 5: Create completed orders + items + analytics ──────────
interface CreatedOrder {
  orderId: string;
  buyerId: string;
  storeId: string;
  completedAt: Date;
}

async function createOrders(sellers: CreatedSeller[], buyers: CreatedBuyer[]): Promise<CreatedOrder[]> {
  console.log("\n📋 Creating ~300 completed orders...");
  const orders: CreatedOrder[] = [];

  const orderStart = new Date("2024-01-01");
  const orderEnd = new Date("2026-03-31");

  // Build a 300-order plan: each store gets 10-25 orders
  const targetTotal = 300;
  let counter = 0;

  // For each seller, get their products
  for (let si = 0; si < sellers.length; si++) {
    const seller = sellers[si];
    const products = await prisma.sellerProduct.findMany({
      where: { storeId: seller.storeId, status: SellerProductStatus.PUBLISHED },
    });
    if (products.length === 0) continue;

    const orderCount = randInt(12, 18);

    for (let o = 0; o < orderCount; o++) {
      const buyer = rand(buyers);
      const itemCount = randInt(1, 4);
      const orderProducts = products.sort(() => Math.random() - 0.5).slice(0, itemCount);

      // Build items
      let subtotal = 0;
      let baseCost = 0;
      const itemsData = orderProducts.map((p) => {
        const qty = randInt(1, 3);
        const discountedPrice = +(p.sellingPrice * (1 - (p.discountPct || 0) / 100)).toFixed(2);
        const discountedBase = +(p.basePrice * (1 - (p.discountPct || 0) / 100)).toFixed(2);
        const total = +(discountedPrice * qty).toFixed(2);
        subtotal += total;
        baseCost += discountedBase * qty;
        const imgs = p.images as string[];
        return {
          productId: p.id,
          dummyProductId: p.dummyProductId,
          title: p.title,
          thumbnail: imgs?.[0] || "",
          price: discountedPrice,
          basePrice: discountedBase,
          discountPct: p.discountPct || 0,
          quantity: qty,
          total,
        };
      });

      const profit = +(subtotal - baseCost).toFixed(2);
      const completedAt = randomDateBetween(orderStart, orderEnd);
      const createdAt = new Date(completedAt.getTime() - randInt(2, 14) * 24 * 60 * 60 * 1000);
      const contactedAt = new Date(createdAt.getTime() + randInt(1, 12) * 60 * 60 * 1000);
      const shippingAt = new Date(contactedAt.getTime() + randInt(3, 24) * 60 * 60 * 1000);

      counter++;
      const orderNumber = `MH-${completedAt.getFullYear()}${String(completedAt.getMonth() + 1).padStart(2, "0")}${String(completedAt.getDate()).padStart(2, "0")}-${String(counter).padStart(4, "0")}`;

      const order = await prisma.order.create({
        data: {
          orderNumber,
          buyerId: buyer.userId,
          storeId: seller.storeId,
          addressId: buyer.addressId,
          paymentMethod: Math.random() > 0.5 ? PaymentMethod.BANK_TRANSFER : PaymentMethod.BITCOIN,
          status: OrderStatus.COMPLETED,
          subtotal,
          totalAmount: subtotal,
          baseCost: +baseCost.toFixed(2),
          profit,
          sellerRevenue: subtotal,
          contactedAt,
          shippingAt,
          completedAt,
          createdAt,
          updatedAt: completedAt,
          items: { create: itemsData },
        },
      });

      orders.push({
        orderId: order.id,
        buyerId: buyer.userId,
        storeId: seller.storeId,
        completedAt,
      });

      // Order analytics — one row per order (aggregated)
      const primaryItem = itemsData[0];
      const primaryProduct = orderProducts.find((p) => p.id === primaryItem.productId);
      await prisma.orderAnalytics.create({
        data: {
          storeId: seller.storeId,
          orderId: order.id,
          basePrice: +baseCost.toFixed(2),
          sellingPrice: subtotal,
          profit,
          category: primaryProduct?.category || "general",
          productTitle: itemsData.length > 1 ? `${primaryItem.title} (+${itemsData.length - 1} more)` : primaryItem.title,
          completedAt,
        },
      });

      if (orders.length >= targetTotal) break;
    }
    process.stdout.write(`  [${si + 1}/20] ${seller.storeName}: ${orderCount} orders ✅\n`);
    if (orders.length >= targetTotal) break;
  }

  console.log(`  Total orders created: ${orders.length}`);
  return orders;
}

// ─── Step 6: Update store analytics ───────────────────────────────
async function updateStoreAnalytics(sellers: CreatedSeller[]) {
  console.log("\n📊 Computing store analytics...");

  for (const seller of sellers) {
    const orders = await prisma.order.findMany({
      where: { storeId: seller.storeId, status: OrderStatus.COMPLETED },
      select: { totalAmount: true, profit: true },
    });
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalProfit = orders.reduce((sum, o) => sum + o.profit, 0);
    const totalViews = randInt(500, 5000);

    await prisma.storeAnalytics.upsert({
      where: { storeId: seller.storeId },
      create: {
        storeId: seller.storeId,
        totalOrders,
        totalRevenue: +totalRevenue.toFixed(2),
        totalProfit: +totalProfit.toFixed(2),
        totalViews,
      },
      update: {
        totalOrders,
        totalRevenue: +totalRevenue.toFixed(2),
        totalProfit: +totalProfit.toFixed(2),
        totalViews,
      },
    });
  }
  console.log("  ✅ Store analytics updated.");
}

// ─── Step 7: Create store reviews ─────────────────────────────────
async function createReviews(orders: CreatedOrder[]) {
  console.log("\n⭐ Creating store reviews (~250)...");

  // ~85% of orders get a review
  const targetCount = Math.floor(orders.length * 0.85);
  const shuffled = [...orders].sort(() => Math.random() - 0.5);
  const reviewedOrders = shuffled.slice(0, targetCount);

  let count = 0;
  for (const o of reviewedOrders) {
    const itemR = weightedRating();
    const commsR = weightedRating();
    const shipR = weightedRating();
    const overall = +((itemR + commsR + shipR) / 3).toFixed(2);
    const hasReply = Math.random() < 0.3;
    const reviewDate = new Date(o.completedAt.getTime() + randInt(1, 7) * 24 * 60 * 60 * 1000);
    const replyDate = hasReply ? new Date(reviewDate.getTime() + randInt(2, 48) * 60 * 60 * 1000) : null;

    try {
      await prisma.storeReview.create({
        data: {
          storeId: o.storeId,
          buyerId: o.buyerId,
          orderId: o.orderId,
          itemRating: itemR,
          communicationRating: commsR,
          shippingRating: shipR,
          overallRating: overall,
          comment: rand(REVIEW_COMMENTS),
          sellerReply: hasReply ? rand(REPLY_TEMPLATES) : null,
          sellerRepliedAt: replyDate,
          createdAt: reviewDate,
          updatedAt: replyDate || reviewDate,
        },
      });
      count++;
    } catch {
      // Skip duplicates
    }
  }
  console.log(`  ✅ ${count} reviews created.`);
}

// ─── Step 8: Update store rating aggregates + premium ─────────────
async function updateStoreRatings(sellers: CreatedSeller[]) {
  console.log("\n📈 Computing store rating aggregates...");

  // Compute averages from real reviews
  const storeStats: { storeId: string; avg: number; count: number }[] = [];

  for (const seller of sellers) {
    const reviews = await prisma.storeReview.findMany({
      where: { storeId: seller.storeId },
      select: { itemRating: true, communicationRating: true, shippingRating: true, overallRating: true },
    });

    if (reviews.length === 0) {
      storeStats.push({ storeId: seller.storeId, avg: 0, count: 0 });
      continue;
    }

    const avg = +(reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length).toFixed(2);
    const itemAvg = +(reviews.reduce((s, r) => s + r.itemRating, 0) / reviews.length).toFixed(2);
    const commsAvg = +(reviews.reduce((s, r) => s + r.communicationRating, 0) / reviews.length).toFixed(2);
    const shipAvg = +(reviews.reduce((s, r) => s + r.shippingRating, 0) / reviews.length).toFixed(2);

    await prisma.store.update({
      where: { id: seller.storeId },
      data: {
        averageRating: avg,
        totalReviews: reviews.length,
        itemRatingAvg: itemAvg,
        commsRatingAvg: commsAvg,
        shippingRatingAvg: shipAvg,
      },
    });

    storeStats.push({ storeId: seller.storeId, avg, count: reviews.length });
  }

  // Top 5 highest-rated stores → premium
  storeStats.sort((a, b) => b.avg - a.avg);
  const topPremium = storeStats.slice(0, 5);

  for (let i = 0; i < topPremium.length; i++) {
    await prisma.store.update({
      where: { id: topPremium[i].storeId },
      data: { isPremium: true, premiumOrder: i },
    });
  }

  console.log(`  ✅ Ratings computed. Top 5 stores marked as premium.`);
}

// ─── Step 9: Ad subscriptions ─────────────────────────────────────
async function createAdSubscriptions(sellers: CreatedSeller[]) {
  console.log("\n📢 Creating 8 active ad subscriptions...");

  const plans = await prisma.adPlan.findMany();
  if (plans.length === 0) {
    console.log("  ⚠️  No AdPlans found in DB. Skipping.");
    return;
  }

  // Pick 8 random sellers
  const shuffled = [...sellers].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 8);

  for (const seller of selected) {
    const plan = rand(plans);
    const startDate = new Date(Date.now() - randInt(1, 20) * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    await prisma.adSubscription.create({
      data: {
        storeId: seller.storeId,
        planId: plan.id,
        status: AdSubscriptionStatus.ACTIVE,
        startDate,
        endDate,
        approvedAt: startDate,
      },
    });
  }
  console.log(`  ✅ 8 ad subscriptions created.`);
}

// ─── Step 10: Write account file ──────────────────────────────────
function writeAccountsFile(sellers: CreatedSeller[], buyers: CreatedBuyer[]) {
  const lines: string[] = [];
  lines.push("════════════════════════════════════════════════════════════════");
  lines.push("  MARKETHUB EXPRESS — SEEDED ACCOUNTS");
  lines.push(`  Generated: ${new Date().toISOString()}`);
  lines.push(`  Default password for ALL accounts: ${PASSWORD}`);
  lines.push("════════════════════════════════════════════════════════════════\n");

  lines.push("─── 20 SELLERS ──────────────────────────────────────────────────");
  sellers.forEach((s, i) => {
    lines.push(`${String(i + 1).padStart(2, " ")}. ${s.email}`);
    lines.push(`    Name:        ${s.firstName} ${s.lastName}`);
    lines.push(`    Store:       ${s.storeName}`);
    lines.push(`    Registered:  ${s.registeredAt.toISOString().split("T")[0]}`);
    lines.push(`    Clerk ID:    ${s.clerkId}`);
    lines.push("");
  });

  lines.push("\n─── 10 BUYERS ───────────────────────────────────────────────────");
  buyers.forEach((b, i) => {
    lines.push(`${String(i + 1).padStart(2, " ")}. ${b.email}`);
    lines.push(`    Name:        ${b.firstName} ${b.lastName}`);
    lines.push(`    Registered:  ${b.registeredAt.toISOString().split("T")[0]}`);
    lines.push(`    Clerk ID:    ${b.clerkId}`);
    lines.push("");
  });

  lines.push("════════════════════════════════════════════════════════════════");
  lines.push(`  Total: ${sellers.length} sellers + ${buyers.length} buyers = ${sellers.length + buyers.length} accounts`);
  lines.push(`  Login at: /auth/login   |   Password: ${PASSWORD}`);
  lines.push("════════════════════════════════════════════════════════════════");

  fs.writeFileSync(ACCOUNTS_FILE, lines.join("\n"));
  console.log(`\n📝 Account credentials saved to: ${ACCOUNTS_FILE}`);
}

// ─── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log("════════════════════════════════════════════════════════");
  console.log("  MARKETHUB MARKETPLACE SEEDING");
  console.log("════════════════════════════════════════════════════════");

  const t0 = Date.now();

  await cleanup();
  const sellers = await createSellers();
  const buyers = await createBuyers();
  await createProducts(sellers);
  const orders = await createOrders(sellers, buyers);
  await updateStoreAnalytics(sellers);
  await createReviews(orders);
  await updateStoreRatings(sellers);
  await createAdSubscriptions(sellers);
  writeAccountsFile(sellers, buyers);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n🎉 Seeding complete in ${elapsed}s`);
}

main()
  .catch((e) => {
    console.error("\n❌ FATAL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
