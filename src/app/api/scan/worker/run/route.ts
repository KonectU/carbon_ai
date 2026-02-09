import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { processWebsiteScan } from "@/lib/jobs/websiteScanProcessor";

export async function POST(request: Request) {
  const secret = request.headers.get("x-scan-worker-secret");
  if (!secret || secret !== process.env.SCAN_WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const scan = await prisma.scan.findFirst({
    where: { status: "QUEUED" },
    orderBy: { createdAt: "asc" },
  });

  if (!scan) {
    return NextResponse.json({ status: "idle" });
  }

  try {
    await prisma.scan.update({
      where: { id: scan.id },
      data: { status: "VISITING" },
    });

    if (scan.type === "WEBSITE") {
      const result = await processWebsiteScan(scan.id);
      return NextResponse.json({ status: "completed", scanId: scan.id, result });
    }

    await prisma.scan.update({
      where: { id: scan.id },
      data: {
        status: "FAILED",
        errorMessage: "Unsupported scan type.",
      },
    });
    return NextResponse.json({ status: "failed", scanId: scan.id });
  } catch (error) {
    await prisma.scan.update({
      where: { id: scan.id },
      data: { status: "FAILED", errorMessage: "Processing failed." },
    });

    return NextResponse.json({ status: "failed", scanId: scan.id });
  }
}
