import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔄 Updating Ad Plans...\n");

  // 1 Month Plan — $699
  const oneMonthFeatures = [
    "500–1,000 daily visitors",
    "Featured in Sponsored section",
    "Basic store analytics",
    "Standard product placement",
  ];
  await prisma.adPlan.upsert({
    where: { tier: "BASIC" },
    update: {
      name: "1 Month",
      price: 699,
      durationDays: 30,
      minVisitorsDay: 500,
      maxVisitorsDay: 1000,
      description: "1 month of visitor exposure and traffic boost",
      features: oneMonthFeatures,
      sortOrder: 1,
      isActive: true,
    },
    create: {
      tier: "BASIC",
      name: "1 Month",
      price: 699,
      durationDays: 30,
      minVisitorsDay: 500,
      maxVisitorsDay: 1000,
      description: "1 month of visitor exposure and traffic boost",
      features: oneMonthFeatures,
      sortOrder: 1,
      isActive: true,
    },
  });
  console.log("✅ 1 Month Plan — $699");

  // 3 Months Plan — $1,799
  const threeMonthFeatures = [
    "1,500–3,000 daily visitors",
    "Priority product placement",
    "Enhanced store analytics",
    "Larger product cards",
    "Email support",
  ];
  await prisma.adPlan.upsert({
    where: { tier: "STANDARD" },
    update: {
      name: "3 Months",
      price: 1799,
      durationDays: 90,
      minVisitorsDay: 1500,
      maxVisitorsDay: 3000,
      description: "3 months of visitor exposure and traffic boost",
      features: threeMonthFeatures,
      sortOrder: 2,
      isActive: true,
    },
    create: {
      tier: "STANDARD",
      name: "3 Months",
      price: 1799,
      durationDays: 90,
      minVisitorsDay: 1500,
      maxVisitorsDay: 3000,
      description: "3 months of visitor exposure and traffic boost",
      features: threeMonthFeatures,
      sortOrder: 2,
      isActive: true,
    },
  });
  console.log("✅ 3 Months Plan — $1,799");

  // 12 Months Plan — $5,199
  const twelveMonthFeatures = [
    "5,000–10,000 daily visitors",
    "Top placement on homepage",
    "Featured store badge",
    "Full analytics suite",
    "Priority customer support",
    "Dedicated account manager",
  ];
  await prisma.adPlan.upsert({
    where: { tier: "PREMIUM" },
    update: {
      name: "12 Months",
      price: 5199,
      durationDays: 365,
      minVisitorsDay: 5000,
      maxVisitorsDay: 10000,
      description: "12 months of visitor exposure and traffic boost",
      features: twelveMonthFeatures,
      sortOrder: 3,
      isActive: true,
    },
    create: {
      tier: "PREMIUM",
      name: "12 Months",
      price: 5199,
      durationDays: 365,
      minVisitorsDay: 5000,
      maxVisitorsDay: 10000,
      description: "12 months of visitor exposure and traffic boost",
      features: twelveMonthFeatures,
      sortOrder: 3,
      isActive: true,
    },
  });
  console.log("✅ 12 Months Plan — $5,199");

  console.log("\n🎉 All ad plans updated!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
