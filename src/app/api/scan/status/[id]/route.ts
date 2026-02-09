import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const scan = await prisma.scan.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!scan || scan.user.email !== session.user.email) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: scan.id,
      type: scan.type,
      status: scan.status,
      progress: scan.progress,
      result: scan.resultJson,
      assumptions: scan.assumptions,
      errorMessage: scan.errorMessage,
      createdAt: scan.createdAt,
      updatedAt: scan.updatedAt,
    });
  } catch (error) {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
