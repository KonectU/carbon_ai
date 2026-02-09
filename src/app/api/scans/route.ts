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

    const scans = await prisma.scan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        resultJson: true,
      },
    });

    const items = scans.map((scan) => {
      const result = scan.resultJson as
        | { carbon_kg?: number; energy_kWh?: number }
        | undefined;
      return {
        id: scan.id,
        type: scan.type,
        status: scan.status,
        createdAt: scan.createdAt,
        carbon_kg: result?.carbon_kg ?? null,
        energy_kWh: result?.energy_kWh ?? null,
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
