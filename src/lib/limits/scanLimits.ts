import { prisma } from "@/lib/db/prisma";

const PLAN_LIMITS: Record<string, number> = {
  FREE: 30,
  PRO: 50,
};

const getMonthRange = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
};

export async function checkScanQuota(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  const planKey = user?.plan ?? "FREE";
  const limit = PLAN_LIMITS[planKey] ?? PLAN_LIMITS.FREE;
  const { start, end } = getMonthRange();

  const count = await prisma.scan.count({
    where: {
      userId,
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });

  return {
    allowed: count < limit,
    remaining: Math.max(0, limit - count),
    limit,
    plan: planKey,
  };
}
