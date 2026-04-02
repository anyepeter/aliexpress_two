import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Secure with a secret so only cron jobs can call this
const CRON_SECRET = process.env.CRON_SECRET ?? "cron-secret-key";

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sends this header, or we check query param)
  const authHeader = req.headers.get("authorization");
  const querySecret = new URL(req.url).searchParams.get("secret");

  if (authHeader !== `Bearer ${CRON_SECRET}` && querySecret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let reminders = 0;
  let suspended = 0;

  try {
    // Find all APPROVED loans
    const activeLoans = await prisma.loanRequest.findMany({
      where: { status: "APPROVED" },
      include: {
        seller: { select: { id: true, firstName: true, status: true } },
        store: { select: { id: true, storeName: true, userId: true } },
      },
    });

    // Find the admin user (for sending system messages)
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const admin = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
        status: "ACTIVE",
        ...(superAdminEmail ? { email: { not: superAdminEmail } } : {}),
      },
      select: { id: true },
    });

    if (!admin) {
      return NextResponse.json({ error: "No admin found" }, { status: 500 });
    }

    for (const loan of activeLoans) {
      if (!loan.dueDate || !loan.approvedAmount) continue;

      const daysRemaining = Math.ceil(
        (loan.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysElapsed = Math.max(
        0,
        Math.floor((now.getTime() - (loan.approvedAt?.getTime() ?? now.getTime())) / (1000 * 60 * 60 * 24))
      );
      const interest = parseFloat(
        (loan.approvedAmount * loan.dailyInterestRate * daysElapsed).toFixed(2)
      );
      const totalOwed = loan.balanceRemaining + interest;
      const isOverdue = daysRemaining <= 0;

      // ── Auto-suspend overdue stores ──
      if (isOverdue && loan.seller.status !== "SUSPENDED") {
        await prisma.user.update({
          where: { id: loan.sellerId },
          data: { status: "SUSPENDED" },
        });

        // Send suspension message
        const conversation = await findOrCreateConversation(
          loan.sellerId,
          admin.id
        );
        if (conversation) {
          await sendSystemMessage(
            conversation.id,
            admin.id,
            `🚫 Your store "${loan.store.storeName}" has been suspended due to an overdue loan. ` +
            `You owe $${totalOwed.toFixed(2)} (principal: $${loan.balanceRemaining.toFixed(2)} + interest: $${interest.toFixed(2)}). ` +
            `Please repay your loan immediately to reactivate your store.`
          );
        }

        suspended++;
        continue; // Don't send reminder if already suspended
      }

      // ── Send daily reminder messages ──
      // Only remind if loan is active and not yet suspended
      if (!isOverdue && loan.seller.status !== "SUSPENDED") {
        let message = "";

        if (daysRemaining === 1) {
          message =
            `⚠️ URGENT: Your loan is due TOMORROW! ` +
            `Balance: $${loan.balanceRemaining.toFixed(2)} + Interest: $${interest.toFixed(2)} = $${totalOwed.toFixed(2)} total. ` +
            `Repay now to avoid store suspension.`;
        } else if (daysRemaining === 2) {
          message =
            `⏰ Reminder: Your loan is due in 2 days. ` +
            `Current total owed: $${totalOwed.toFixed(2)} (interest accumulating at ${(loan.dailyInterestRate * 100).toFixed(1)}%/day). ` +
            `Repay early to save on interest.`;
        } else if (daysRemaining <= loan.repaymentDays) {
          // Send reminder every day
          message =
            `📋 Loan Reminder: ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining to repay your loan. ` +
            `Balance: $${loan.balanceRemaining.toFixed(2)} | Interest: $${interest.toFixed(2)} | Total: $${totalOwed.toFixed(2)}`;
        }

        if (message) {
          const conversation = await findOrCreateConversation(
            loan.sellerId,
            admin.id
          );
          if (conversation) {
            await sendSystemMessage(conversation.id, admin.id, message);
            reminders++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: activeLoans.length,
      reminders,
      suspended,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Loan reminders cron error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ── Helpers ──

async function findOrCreateConversation(sellerId: string, adminId: string) {
  try {
    let conversation = await prisma.conversation.findFirst({
      where: { sellerId, adminId },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          type: "SELLER_ADMIN",
          sellerId,
          adminId,
          subject: "Loan Notifications",
        },
      });
    }

    return conversation;
  } catch {
    return null;
  }
}

async function sendSystemMessage(
  conversationId: string,
  senderId: string,
  content: string
) {
  try {
    await prisma.message.create({
      data: {
        conversationId,
        senderId,
        type: "SYSTEM",
        content,
      },
    });
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content.slice(0, 100),
        lastMessageAt: new Date(),
      },
    });
  } catch (e) {
    console.error("Failed to send loan reminder message:", e);
  }
}
