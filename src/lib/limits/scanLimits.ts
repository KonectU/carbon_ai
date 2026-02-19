import { prisma } from "@/lib/db/prisma";

// Unlimited scans for everyone - no restrictions
const UNLIMITED_SCANS = 999999;

const getMonthRange = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
};

export async function checkScanQuota(userId: string) {
  // Always allow scans - unlimited for everyone
  return {
    allowed: true,
    remaining: UNLIMITED_SCANS,
    limit: UNLIMITED_SCANS,
    plan: "FREE",
  };
}
