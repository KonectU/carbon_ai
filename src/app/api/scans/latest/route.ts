import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const [websiteScan, aiScan] = await Promise.all([
      prisma.scan.findFirst({
        where: { userId: user.id, type: "WEBSITE" },
        orderBy: { createdAt: "desc" },
      }),
      prisma.scan.findFirst({
        where: { userId: user.id, type: "AI" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      website: websiteScan
        ? {
            result: websiteScan.resultJson,
            assumptions: websiteScan.assumptions,
            status: websiteScan.status,
            errorMessage: websiteScan.errorMessage,
            createdAt: websiteScan.createdAt,
          }
        : null,
      ai: aiScan
        ? {
            result: aiScan.resultJson,
            assumptions: aiScan.assumptions,
            status: aiScan.status,
            errorMessage: aiScan.errorMessage,
            createdAt: aiScan.createdAt,
          }
        : null,
    });
  } catch (error) {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
