import { prisma } from "@/lib/db/prisma";
import { crawlWebsite } from "@/lib/crawler/websiteCrawler";
import { estimateWebsiteEnergy } from "@/lib/estimation/energyEstimator";
import { mapEnergyToCarbon } from "@/lib/estimation/carbonMapper";
import { generateWebsiteRecommendations } from "@/lib/recommendations/ruleEngine";

const ASSUMPTIONS = [
  "Transferred bytes are based on response content-length headers only and may undercount.",
  "JS execution time is approximated by page load duration using network idle.",
  "We crawl a configurable portion of the site with guardrails (not exhaustive).",
  "Energy estimation uses lower-bound heuristics for network, CPU, and layout costs.",
  "Region grid factors are coarse averages and may differ from local conditions.",
];

export async function processWebsiteScan(scanId: string) {
  const scan = await prisma.scan.findUnique({ where: { id: scanId } });
  if (!scan) {
    throw new Error("Scan not found.");
  }

  const input = scan.inputJson as { url: string; region: string };

  await prisma.scan.update({
    where: { id: scanId },
    data: {
      status: "VISITING",
      progress: {
        pagesScanned: 0,
        pagesTotal: 0,
        currentUrl: input.url,
        pages: [],
      },
    },
  });

  const {
    totalBytes,
    domNodes,
    jsExecutionMs,
    visitedUrl,
    visitedAt,
    screenshot,
    pagesScanned,
    pagesVisited,
  } = await crawlWebsite(input.url, {
    maxPages: 50,
    maxDepth: 3,
    onProgress: async (progress) => {
      await prisma.scan.update({
        where: { id: scanId },
        data: {
          status: "VISITING",
          progress,
        },
      });
    },
  });

  await prisma.scan.update({
    where: { id: scanId },
    data: { status: "ANALYZING" },
  });

  const pageWeightKB = Math.max(1, Math.ceil(totalBytes / 1024));
  const energy_kWh = estimateWebsiteEnergy({
    pageWeightKB,
    domNodes,
    jsTimeMs: jsExecutionMs,
  });
  const carbon_kg = mapEnergyToCarbon(energy_kWh, input.region);
  const recommendations = generateWebsiteRecommendations({
    pageWeightKB,
    domNodes,
    jsTimeMs: jsExecutionMs,
  });

  const resultJson = {
    metrics: {
      pageWeightKB,
      domNodes,
      jsExecutionMs,
      pagesScanned,
      pagesVisited,
      visitedUrl,
      visitedAt,
      screenshot,
    },
    energy_kWh,
    carbon_kg,
    recommendations,
  };

  await prisma.scan.update({
    where: { id: scanId },
    data: {
      status: "COMPLETED",
      resultJson,
      assumptions: ASSUMPTIONS,
      visitedUrl,
      visitedAt: visitedAt ? new Date(visitedAt) : null,
      screenshot,
      pagesScanned,
    },
  });

  return {
    ...resultJson,
    assumptions: ASSUMPTIONS,
  };
}
