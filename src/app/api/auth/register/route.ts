import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? "").toLowerCase().trim();
    const password = String(body?.password ?? "");
    const name = String(body?.name ?? "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "User already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
      },
      select: { id: true, email: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
