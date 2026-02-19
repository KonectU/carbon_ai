import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { estimateAiInferenceEnergy } from "@/lib/analysis/aiModelAnalysis";

type Precision = "fp32" | "fp16" | "int8";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const modelParameters = Number(body?.modelParameters);
    const precision = String(body?.precision ?? "").trim() as Precision;
    const requestsPerSecond = Number(body?.requestsPerSecond);
    const hardwareEfficiencyFlopsPerWatt = Number(
      body?.hardwareEfficiencyFlopsPerWatt
    );
    const region =
      typeof body?.region === "string" && body.region.trim()
        ? body.region.trim()
        : undefined;

    if (
      !Number.isFinite(modelParameters) ||
      modelParameters <= 0 ||
      !Number.isFinite(requestsPerSecond) ||
      requestsPerSecond <= 0 ||
      !Number.isFinite(hardwareEfficiencyFlopsPerWatt) ||
      hardwareEfficiencyFlopsPerWatt <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid numeric inputs." },
        { status: 400 }
      );
    }

    if (!["fp32", "fp16", "int8"].includes(precision)) {
      return NextResponse.json(
        { error: "Unsupported precision." },
        { status: 400 }
      );
    }

    const estimate = estimateAiInferenceEnergy({
      modelParameters,
      precision,
      requestsPerSecond,
      hardwareFlopsPerWatt: hardwareEfficiencyFlopsPerWatt,
      region,
    });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // No limit check - unlimited scans for everyone!

    const resultJson = {
      energy_kWh: estimate.energy_kWh_per_month,
      carbon_kg: estimate.carbon_kg_per_month,
    };

    await prisma.scan.create({
      data: {
        userId: user.id,
        type: "AI",
        status: "COMPLETED",
        inputJson: {
          modelParameters,
          precision,
          requestsPerSecond,
          hardwareEfficiencyFlopsPerWatt,
          region: region ?? null,
        },
        resultJson,
        assumptions: estimate.assumptions,
      },
    });

    return NextResponse.json({
      energy_kWh: resultJson.energy_kWh,
      carbon_kg: resultJson.carbon_kg,
      assumptions: estimate.assumptions,
    });
  } catch (error) {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
