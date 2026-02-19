import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { processWebsiteScan } from "@/lib/jobs/websiteScanProcessor";

export const maxDuration = 60; // 60 seconds for Pro plan, 10 for Hobby

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

    // No limit check - unlimited scans for everyone!

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

    // Process scan immediately (Vercel serverless)
    processWebsiteScan(scan.id).catch(async (error) => {
      console.error(`[Scan ${scan.id}] Processing error:`, error);
      await prisma.scan.update({
        where: { id: scan.id },
        data: { 
          status: "FAILED", 
          errorMessage: error instanceof Error ? error.message : "Processing failed." 
        },
      });
    });

    return NextResponse.json({
      scanId: scan.id,
      status: scan.status,
      createdAt: scan.createdAt,
    });
  } catch (error) {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
