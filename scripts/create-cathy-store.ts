import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClerkClient } from "@clerk/backend";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

// ─── Config ────────────────────────────────────────────────────────
const SELLER_EMAIL = "cathystore@gmail.com";
const SELLER_PASSWORD = "D@zzL1ng!Conf9x";
const STORE_NAME = "Dazzling Confidence";
const STORE_SLUG = "dazzling-confidence";
const STORE_DESCRIPTION =
  "Your one-stop destination for premium beauty, fashion, and lifestyle products. We curate the finest collection from top global brands, delivering confidence to every customer. From skincare essentials to statement accessories, every product is handpicked for quality and style.";

// Products to stock (mix of high-value categories)
const PRODUCT_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
];

// Fake buyer names
const BUYER_NAMES = [
  ["James", "Anderson"], ["Sarah", "Mitchell"], ["David", "Thompson"], ["Emily", "Roberts"],
  ["Michael", "Johnson"], ["Jessica", "Williams"], ["Daniel", "Brown"], ["Ashley", "Davis"],
  ["Christopher", "Miller"], ["Amanda", "Wilson"], ["Matthew", "Moore"], ["Jennifer", "Taylor"],
  ["Andrew", "Thomas"], ["Stephanie", "Jackson"], ["Joshua", "White"], ["Lauren", "Harris"],
  ["Ryan", "Martin"], ["Nicole", "Garcia"], ["Brandon", "Martinez"], ["Megan", "Robinson"],
  ["Justin", "Clark"], ["Rachel", "Rodriguez"], ["Kevin", "Lewis"], ["Samantha", "Lee"],
  ["Tyler", "Walker"], ["Kayla", "Hall"], ["Nathan", "Allen"], ["Brittany", "Young"],
  ["Jacob", "King"], ["Hannah", "Wright"],
];

const CITIES = [
  ["New York", "NY", "USA"], ["Los Angeles", "CA", "USA"], ["Chicago", "IL", "USA"],
  ["Houston", "TX", "USA"], ["Phoenix", "AZ", "USA"], ["Philadelphia", "PA", "USA"],
  ["San Antonio", "TX", "USA"], ["Dallas", "TX", "USA"], ["Miami", "FL", "USA"],
  ["Atlanta", "GA", "USA"], ["Boston", "MA", "USA"], ["Denver", "CO", "USA"],
  ["Seattle", "WA", "USA"], ["Portland", "OR", "USA"], ["Austin", "TX", "USA"],
];

const REVIEW_COMMENTS = [
  "Absolutely love this product! Quality is amazing and it arrived so fast. Will definitely be ordering again!",
  "Great store with excellent customer service. The items were exactly as described and shipping was quick.",
  "I'm impressed with the quality. Packaging was beautiful too. Highly recommend this store!",
  "Everything arrived in perfect condition. The seller was very responsive to my questions. 5 stars!",
  "Best online shopping experience I've had in a while. Products are top-notch quality.",
  "Fast shipping, great communication, and the product exceeded my expectations. Thank you!",
  "This store never disappoints. I've ordered multiple times and always satisfied. Premium quality!",
  "Wow, the attention to detail is incredible. The product looks even better than in the photos.",
  "Ordered as a gift and it was a huge hit! Beautiful packaging and fast delivery. Highly recommend.",
  "Outstanding quality for the price. I compared with other stores and this is by far the best value.",
  "Customer service was exceptional. They helped me choose the right product and it arrived perfectly.",
  "I'm a repeat customer and the quality has been consistently excellent. My go-to store!",
  "The product quality is superb. You can tell these are carefully curated items. Very happy!",
  "Shipping was faster than expected and the product is exactly what I needed. Great experience!",
  "I was skeptical at first but this store delivered beyond my expectations. Will order again!",
  null, null, null, null, null, // some reviews without comments
];

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateOrderNumber(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MH-${y}${m}${d}-${suffix}`;
}

async function main() {
  console.log("🚀 Creating Cathy Store (Dazzling Confidence)...\n");

  // ── Step 1: Create Clerk user ──────────────────────────────────
  console.log("1️⃣  Creating Clerk user...");
  let clerkUser;
  try {
    clerkUser = await clerk.users.createUser({
      emailAddress: [SELLER_EMAIL],
      password: SELLER_PASSWORD,
      firstName: "Cathy",
      lastName: "Store",
      publicMetadata: { role: "SELLER", status: "ACTIVE" },
    });
    console.log(`   ✅ Clerk user created: ${clerkUser.id}`);
  } catch (err: any) {
    if (err?.errors?.[0]?.code === "form_identifier_exists") {
      console.log("   ⚠️  Clerk user already exists, finding...");
      const users = await clerk.users.getUserList({ emailAddress: [SELLER_EMAIL] });
      clerkUser = users.data[0];
      if (!clerkUser) throw new Error("Could not find existing Clerk user");
      console.log(`   ✅ Found existing Clerk user: ${clerkUser.id}`);
    } else {
      throw err;
    }
  }

  // ── Step 2: Create Prisma User (seller) ────────────────────────
  console.log("\n2️⃣  Creating seller user in database...");
  const seller = await prisma.user.upsert({
    where: { email: SELLER_EMAIL },
    update: {
      clerkId: clerkUser.id,
      role: "SELLER",
      status: "ACTIVE",
      password: SELLER_PASSWORD,
    },
    create: {
      clerkId: clerkUser.id,
      email: SELLER_EMAIL,
      firstName: "Cathy",
      lastName: "Store",
      phone: "+1 (302) 555-8899",
      role: "SELLER",
      status: "ACTIVE",
      password: SELLER_PASSWORD,
      createdAt: new Date("2024-01-15"),
    },
  });
  console.log(`   ✅ Seller user: ${seller.id}`);

  // ── Step 3: Create Store ───────────────────────────────────────
  console.log("\n3️⃣  Creating store...");
  let store = await prisma.store.findUnique({ where: { userId: seller.id } });
  if (!store) {
    store = await prisma.store.create({
      data: {
        userId: seller.id,
        storeName: STORE_NAME,
        storeSlug: STORE_SLUG,
        description: STORE_DESCRIPTION,
        country: "USA",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        businessType: "Registered Business",
        isVerified: true,
        isPremium: true,
        premiumOrder: 0,
        approvedAt: new Date("2024-01-18"),
        averageRating: 4.8,
        totalReviews: 0, // will update later
        itemRatingAvg: 4.9,
        commsRatingAvg: 4.7,
        shippingRatingAvg: 4.8,
        createdAt: new Date("2024-01-15"),
      },
    });
    console.log(`   ✅ Store created: ${store.id} — "${STORE_NAME}"`);
  } else {
    console.log(`   ⚠️  Store already exists: ${store.id}`);
  }

  // ── Step 4: Add Products ───────────────────────────────────────
  console.log("\n4️⃣  Adding products to store...");
  const products = await prisma.product.findMany({
    where: { id: { in: PRODUCT_IDS } },
    select: { id: true, title: true, price: true, category: true, brand: true, thumbnail: true, images: true, discountPercentage: true, stock: true, description: true },
  });

  let addedProducts = 0;
  const sellerProducts: { id: string; dummyProductId: number; sellingPrice: number; basePrice: number; title: string; category: string; thumbnail: string; discountPct: number }[] = [];

  for (const p of products) {
    const marginPercent = randomInt(15, 22);
    const sellingPrice = Math.round(p.price * (1 + marginPercent / 100) * 100) / 100;
    const discountPct = p.discountPercentage ?? 0;

    try {
      const sp = await prisma.sellerProduct.upsert({
        where: { storeId_dummyProductId: { storeId: store.id, dummyProductId: p.id } },
        update: { sellingPrice, status: "PUBLISHED" },
        create: {
          storeId: store.id,
          dummyProductId: p.id,
          title: p.title,
          description: p.description,
          images: (p.images as string[]) ?? [],
          category: p.category,
          brand: p.brand ?? "Premium",
          basePrice: p.price,
          marginPercent,
          sellingPrice,
          discountPct,
          stock: p.stock ?? 500,
          status: "PUBLISHED",
          publishedAt: randomDate(new Date("2024-02-01"), new Date("2024-06-01")),
          tags: [],
          rating: 4.5 + Math.random() * 0.5,
          ratingCount: randomInt(50, 500),
        },
      });
      sellerProducts.push({
        id: sp.id,
        dummyProductId: p.id,
        sellingPrice,
        basePrice: p.price,
        title: p.title,
        category: p.category,
        thumbnail: p.thumbnail ?? "",
        discountPct,
      });
      addedProducts++;
    } catch {
      // skip duplicates
    }
  }
  console.log(`   ✅ ${addedProducts} products added to store`);

  // ── Step 5: Create fake buyers + addresses ─────────────────────
  console.log("\n5️⃣  Creating fake buyers...");
  const buyers: { id: string; addressId: string }[] = [];

  for (let i = 0; i < BUYER_NAMES.length; i++) {
    const [firstName, lastName] = BUYER_NAMES[i];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(10, 99)}@demo.test`;
    const [city, state, country] = CITIES[i % CITIES.length];

    const buyer = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        firstName,
        lastName,
        role: "BUYER",
        status: "ACTIVE",
        password: "demo",
        createdAt: randomDate(new Date("2024-01-01"), new Date("2025-06-01")),
      },
    });

    const address = await prisma.address.create({
      data: {
        userId: buyer.id,
        label: "Home",
        street: `${randomInt(100, 9999)} ${["Oak", "Elm", "Maple", "Pine", "Cedar"][randomInt(0, 4)]} Street`,
        city,
        state,
        country,
        postalCode: String(randomInt(10000, 99999)),
        isDefault: true,
      },
    });

    buyers.push({ id: buyer.id, addressId: address.id });
  }
  console.log(`   ✅ ${buyers.length} fake buyers created`);

  // ── Step 6: Create 120 completed orders ────────────────────────
  console.log("\n6️⃣  Creating 120 completed orders...");

  let totalRevenue = 0;
  let totalProfit = 0;
  const orderIds: string[] = [];
  const targetRevenue = 2_100_000; // $2.1M target
  const targetProfit = 420_000; // $420K target
  const baseOrderCount = 120;

  // Calculate multiplier needed so orders sum to ~$2.1M revenue
  // Average order with current products is maybe $300-500, so 120 orders = ~$50K
  // We need a multiplier of ~40x on quantities
  const avgProductPrice = sellerProducts.reduce((s, p) => s + p.sellingPrice, 0) / sellerProducts.length;
  const avgItemsPerOrder = 3;
  const rawOrderValue = avgProductPrice * avgItemsPerOrder;
  const quantityMultiplier = Math.ceil(targetRevenue / (baseOrderCount * rawOrderValue));

  for (let i = 0; i < baseOrderCount; i++) {
    const buyer = buyers[i % buyers.length];
    const orderDate = randomDate(new Date("2024-03-01"), new Date("2026-04-10"));
    const completedDate = new Date(orderDate.getTime() + randomInt(3, 14) * 86400000);
    const orderNumber = generateOrderNumber(orderDate);

    // Pick 2-5 random products per order
    const itemCount = randomInt(2, 5);
    const shuffled = [...sellerProducts].sort(() => Math.random() - 0.5);
    const orderProducts = shuffled.slice(0, itemCount);

    let subtotal = 0;
    let baseCost = 0;
    const items: {
      productId: string;
      dummyProductId: number;
      title: string;
      thumbnail: string;
      price: number;
      basePrice: number;
      discountPct: number;
      quantity: number;
      total: number;
    }[] = [];

    for (const sp of orderProducts) {
      const qty = randomInt(5, 15) * quantityMultiplier;
      const discountedPrice = sp.discountPct > 0
        ? Math.round(sp.sellingPrice * (1 - sp.discountPct / 100) * 100) / 100
        : sp.sellingPrice;
      const discountedBase = sp.discountPct > 0
        ? Math.round(sp.basePrice * (1 - sp.discountPct / 100) * 100) / 100
        : sp.basePrice;
      const lineTotal = Math.round(discountedPrice * qty * 100) / 100;
      const lineBase = Math.round(discountedBase * qty * 100) / 100;

      items.push({
        productId: sp.id,
        dummyProductId: sp.dummyProductId,
        title: sp.title,
        thumbnail: sp.thumbnail,
        price: discountedPrice,
        basePrice: discountedBase,
        discountPct: sp.discountPct,
        quantity: qty,
        total: lineTotal,
      });

      subtotal += lineTotal;
      baseCost += lineBase;
    }

    const profit = Math.round((subtotal - baseCost) * 100) / 100;

    try {
      const order = await prisma.order.create({
        data: {
          orderNumber,
          buyerId: buyer.id,
          storeId: store.id,
          addressId: buyer.addressId,
          paymentMethod: Math.random() > 0.3 ? "BANK_TRANSFER" : "BITCOIN",
          status: "COMPLETED",
          subtotal,
          totalAmount: subtotal,
          baseCost,
          profit,
          sellerRevenue: subtotal,
          completedAt: completedDate,
          shippingAt: new Date(orderDate.getTime() + randomInt(1, 3) * 86400000),
          contactedAt: new Date(orderDate.getTime() + randomInt(0, 1) * 86400000),
          createdAt: orderDate,
          items: {
            create: items,
          },
        },
      });

      totalRevenue += subtotal;
      totalProfit += profit;
      orderIds.push(order.id);

      // Create OrderAnalytics for the first item
      await prisma.orderAnalytics.create({
        data: {
          storeId: store.id,
          orderId: order.id,
          basePrice: baseCost,
          sellingPrice: subtotal,
          profit,
          category: orderProducts[0].category,
          productTitle: orderProducts[0].title,
          completedAt: completedDate,
        },
      });

      if ((i + 1) % 20 === 0) {
        console.log(`   📦 ${i + 1}/${baseOrderCount} orders created... ($${Math.round(totalRevenue).toLocaleString()} revenue so far)`);
      }
    } catch (err: any) {
      console.log(`   ⚠️  Order ${i + 1} skipped: ${err.message?.substring(0, 60)}`);
    }
  }

  console.log(`   ✅ ${orderIds.length} orders created`);
  console.log(`   💰 Total Revenue: $${Math.round(totalRevenue).toLocaleString()}`);
  console.log(`   📈 Total Profit: $${Math.round(totalProfit).toLocaleString()}`);

  // ── Step 7: Create StoreAnalytics ──────────────────────────────
  console.log("\n7️⃣  Setting up store analytics...");
  await prisma.storeAnalytics.upsert({
    where: { storeId: store.id },
    update: {
      totalViews: randomInt(85000, 120000),
      totalOrders: orderIds.length,
      totalRevenue,
      totalProfit,
    },
    create: {
      storeId: store.id,
      totalViews: randomInt(85000, 120000),
      totalOrders: orderIds.length,
      totalRevenue,
      totalProfit,
    },
  });
  console.log(`   ✅ Store analytics set`);

  // ── Step 8: Create Store Reviews ───────────────────────────────
  console.log("\n8️⃣  Creating store reviews...");
  let reviewCount = 0;
  // Create reviews for ~80 orders
  const reviewableOrders = orderIds.slice(0, Math.min(80, orderIds.length));

  for (let i = 0; i < reviewableOrders.length; i++) {
    const buyer = buyers[i % buyers.length];
    const itemRating = randomInt(4, 5);
    const communicationRating = randomInt(4, 5);
    const shippingRating = randomInt(3, 5);
    const overallRating = Math.round(((itemRating + communicationRating + shippingRating) / 3) * 10) / 10;
    const comment = REVIEW_COMMENTS[i % REVIEW_COMMENTS.length];

    try {
      await prisma.storeReview.create({
        data: {
          storeId: store.id,
          buyerId: buyer.id,
          orderId: reviewableOrders[i],
          itemRating,
          communicationRating,
          shippingRating,
          overallRating,
          comment,
          createdAt: randomDate(new Date("2024-04-01"), new Date("2026-04-10")),
        },
      });
      reviewCount++;
    } catch {
      // skip if review already exists for this order
    }
  }

  // Update store review stats
  await prisma.store.update({
    where: { id: store.id },
    data: {
      totalReviews: reviewCount,
      averageRating: 4.8,
      itemRatingAvg: 4.9,
      commsRatingAvg: 4.7,
      shippingRatingAvg: 4.6,
    },
  });

  console.log(`   ✅ ${reviewCount} reviews created`);

  // ── Summary ────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(60));
  console.log("🎉 CATHY STORE SETUP COMPLETE!");
  console.log("═".repeat(60));
  console.log(`\n📋 Store Details:`);
  console.log(`   Store Name:    ${STORE_NAME}`);
  console.log(`   Store URL:     /store/${STORE_SLUG}`);
  console.log(`   Seller Email:  ${SELLER_EMAIL}`);
  console.log(`   Password:      ${SELLER_PASSWORD}`);
  console.log(`\n📊 Stats:`);
  console.log(`   Products:      ${addedProducts}`);
  console.log(`   Orders:        ${orderIds.length}`);
  console.log(`   Revenue:       $${Math.round(totalRevenue).toLocaleString()}`);
  console.log(`   Profit:        $${Math.round(totalProfit).toLocaleString()}`);
  console.log(`   Reviews:       ${reviewCount}`);
  console.log(`   Rating:        4.8 / 5.0`);
  console.log(`   Store Views:   85,000+`);
  console.log(`   Verified:      ✅  Premium: ✅`);
  console.log("═".repeat(60));
}

main()
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
