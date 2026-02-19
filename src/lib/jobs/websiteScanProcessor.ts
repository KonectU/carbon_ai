import { prisma } from "@/lib/db/prisma";
import { crawlWebsite } from "@/lib/crawler";
import { estimateWebsiteEnergy } from "@/lib/estimation/energyEstimator";
import { mapEnergyToCarbon } from "@/lib/estimation/carbonMapper";
import { generateWebsiteRecommendations } from "@/lib/recommendations/ruleEngine";
import { generateGeminiReport } from "@/lib/ai/geminiReport";

const ASSUMPTIONS = [
  "Transferred bytes are based on response content-length headers only and may undercount.",
  "JS execution time is approximated by page load duration using network idle.",
  "We crawl a configurable portion of the site with guardrails (not exhaustive).",
  "Energy estimation uses lower-bound heuristics for network, CPU, and layout costs.",
  "Region grid factors are coarse averages and may differ from local conditions.",
];

export async function processWebsiteScan(scanId: string) {
  try {
    console.log(`[Scan ${scanId}] Starting scan process...`);
    
    const scan = await prisma.scan.findUnique({ where: { id: scanId } });
    if (!scan) {
      throw new Error("Scan not found.");
    }

    const input = scan.inputJson as { url: string; region: string };
    console.log(`[Scan ${scanId}] Scanning URL: ${input.url}`);

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

    console.log(`[Scan ${scanId}] Starting website crawl...`);
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

    console.log(`[Scan ${scanId}] Crawl complete. Pages: ${pagesScanned}, Bytes: ${totalBytes}`);

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
    
    console.log(`[Scan ${scanId}] Metrics calculated. Generating AI report...`);
    
    // Generate AI-powered report using Gemini
    let aiReport;
    try {
      aiReport = await generateGeminiReport(
        {
          pageWeightKB,
          domNodes,
          jsExecutionMs,
          pagesScanned,
          pagesVisited,
          visitedUrl,
        },
        energy_kWh,
        carbon_kg
      );
      console.log(`[Scan ${scanId}] AI report generated successfully`);
    } catch (error) {
      console.error(`[Scan ${scanId}] Failed to generate Gemini report:`, error);
      // Fallback to basic recommendations if Gemini fails
      aiReport = {
        summary: `Website analyzed with ${pageWeightKB}KB total weight across ${pagesScanned} pages.`,
        detailedAnalysis: `The website has been scanned and analyzed. Basic metrics have been collected.`,
        recommendations: generateWebsiteRecommendations({
          pageWeightKB,
          domNodes,
          jsTimeMs: jsExecutionMs,
        }),
      };
    }

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
      aiReport: {
        summary: aiReport.summary,
        detailedAnalysis: aiReport.detailedAnalysis,
      },
      recommendations: aiReport.recommendations,
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

    console.log(`[Scan ${scanId}] Scan completed successfully!`);

    return {
      ...resultJson,
      assumptions: ASSUMPTIONS,
    };
  } catch (error) {
    console.error(`[Scan ${scanId}] FATAL ERROR:`, error);
    
    // Update scan status to FAILED with error message
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
      },
    });
    
    throw error;
  }
}
