import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "admin@markethub.com" },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        email: "admin@markethub.com",
        firstName: "Super",
        lastName: "Admin",
        role: "ADMIN",
        status: "ACTIVE",
        phone: "+1000000000",
        password: "no",
      },
    });
    console.log("✅ Default admin created: admin@markethub.com");
    console.log("⚠️  Set password in Clerk dashboard for this email");
  } else {
    console.log("ℹ️  Admin already exists, skipping seed");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
