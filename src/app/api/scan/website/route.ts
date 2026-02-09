import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { checkScanQuota } from "@/lib/limits/scanLimits";
import { processWebsiteScan } from "@/lib/jobs/websiteScanProcessor";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const url = String(body?.url ?? "").trim();
    const region = String(body?.region ?? "").trim();

    if (!url || !region) {
      return NextResponse.json(
        { error: "Missing url or region." },
        { status: 400 }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const quota = await checkScanQuota(user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: "Monthly scan limit reached.",
          limit: quota.limit,
          remaining: quota.remaining,
        },
        { status: 429 }
      );
    }

    const scan = await prisma.scan.create({
      data: {
        userId: user.id,
        type: "WEBSITE",
        status: "QUEUED",
        inputJson: {
          url: parsedUrl.toString(),
          region,
        },
      },
      select: { id: true, status: true, createdAt: true },
    });

    if (process.env.NODE_ENV !== "production") {
      setTimeout(() => {
        processWebsiteScan(scan.id).catch(async (error) => {
          await prisma.scan.update({
            where: { id: scan.id },
            data: { status: "FAILED", errorMessage: "Processing failed." },
          });
        });
      }, 0);
    }

    return NextResponse.json({
      scanId: scan.id,
      status: scan.status,
      createdAt: scan.createdAt,
    });
  } catch (error) {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
