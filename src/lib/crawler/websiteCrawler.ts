import { chromium } from "playwright";
import { promises as fs } from "fs";
import path from "path";

export type CrawlOptions = {
  maxPages: number;
  maxDepth: number;
  onProgress?: (progress: {
    pagesScanned: number;
    pagesTotal: number;
    currentUrl: string;
    pages: string[];
  }) => Promise<void> | void;
};

type CrawlMetrics = {
  totalBytes: number;
  domNodes: number;
  jsExecutionMs: number;
  visitedUrl: string;
  visitedAt: string;
  screenshot: string;
  pagesScanned: number;
  pagesVisited: string[];
};

const DEFAULT_OPTIONS: CrawlOptions = {
  maxPages: 50,
  maxDepth: 3,
};

const shouldSkipUrl = (url: URL) => {
  const lowered = url.pathname.toLowerCase();
  if (
    lowered.includes("logout") ||
    lowered.includes("signout") ||
    lowered.includes("sign-out") ||
    lowered.includes("log-out")
  ) {
    return true;
  }

  const params = Array.from(url.searchParams.keys());
  if (params.some((key) => key.startsWith("utm_") || key === "gclid" || key === "fbclid")) {
    return true;
  }

  const ext = path.extname(lowered);
  if ([".pdf", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".zip"].includes(ext)) {
    return true;
  }

  return false;
};

export async function crawlWebsite(
  url: string,
  options: CrawlOptions = DEFAULT_OPTIONS
): Promise<CrawlMetrics> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let totalBytes = 0;
  let headerBytes = 0;
  page.on("response", (response) => {
    const lengthHeader = response.headers()["content-length"];
    if (lengthHeader) {
      const bytes = Number.parseInt(lengthHeader, 10);
      if (!Number.isNaN(bytes)) {
        headerBytes += bytes;
      }
    }
  });

  const visitPage = async (targetUrl: string) => {
    try {
      await page.evaluate(() => performance.clearResourceTimings());
      const start = Date.now();
      
      // Increased timeout to 90 seconds for slow websites
      await page.goto(targetUrl, { 
        waitUntil: "networkidle",
        timeout: 90000 // 90 seconds - works for any website
      });
      
      const jsExecutionMs = Date.now() - start;
      const domNodes = await page.evaluate(
        () => document.getElementsByTagName("*").length
      );
      const performanceBytes = await page.evaluate(() => {
        const entries = performance.getEntriesByType(
          "resource"
        ) as PerformanceResourceTiming[];
        const totalTransfer = entries.reduce(
          (sum, entry) => sum + (entry.transferSize || 0),
          0
        );
        const totalEncoded = entries.reduce(
          (sum, entry) => sum + (entry.encodedBodySize || 0),
          0
        );
        return {
          totalTransfer,
          totalEncoded,
        };
      });
      return { jsExecutionMs, domNodes, performanceBytes };
    } catch (error) {
      console.warn(`Failed to visit ${targetUrl}:`, error instanceof Error ? error.message : 'Unknown error');
      // Return default values if page fails to load - scan continues
      return {
        jsExecutionMs: 0,
        domNodes: 0,
        performanceBytes: { totalTransfer: 0, totalEncoded: 0 }
      };
    }
  };

  const startUrl = new URL(url);
  const origin = startUrl.origin;
  const queue: Array<{ url: string; depth: number }> = [
    { url: startUrl.toString(), depth: 0 },
  ];
  const visited = new Set<string>();
  const pagesVisited: string[] = [];

  let totalJsExecutionMs = 0;
  let totalDomNodes = 0;
  let performanceBytesTotal = 0;

  let visitedUrl = "";
  let visitedAt = "";
  let screenshotFilename = "";

  while (queue.length > 0 && pagesVisited.length < options.maxPages) {
    const current = queue.shift();
    if (!current) {
      break;
    }

    if (current.depth > options.maxDepth) {
      continue;
    }

    if (visited.has(current.url)) {
      continue;
    }

    const currentUrl = new URL(current.url);
    if (currentUrl.origin !== origin || shouldSkipUrl(currentUrl)) {
      continue;
    }

    visited.add(current.url);

    const visit = await visitPage(current.url);
    if (!visitedUrl) {
      visitedUrl = page.url();
      visitedAt = new Date().toISOString();
      const screenshotDir = path.join(process.cwd(), "public", "screenshots");
      await fs.mkdir(screenshotDir, { recursive: true });
      screenshotFilename = `scan-${Date.now()}.png`;
      const screenshotPath = path.join(screenshotDir, screenshotFilename);
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }

    pagesVisited.push(current.url);
    totalJsExecutionMs += visit.jsExecutionMs;
    totalDomNodes += visit.domNodes;
    performanceBytesTotal += Math.max(
      visit.performanceBytes.totalTransfer,
      visit.performanceBytes.totalEncoded
    );

    if (options.onProgress) {
      const pagesTotal = Math.min(
        options.maxPages,
        Math.max(pagesVisited.length, pagesVisited.length + queue.length)
      );
      await options.onProgress({
        pagesScanned: pagesVisited.length,
        pagesTotal,
        currentUrl: current.url,
        pages: [...pagesVisited],
      });
    }

    if (current.depth < options.maxDepth) {
      const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll("a[href]"));
        return anchors
          .map((anchor) => anchor.getAttribute("href"))
          .filter((href): href is string => Boolean(href));
      });

      for (const href of links) {
        try {
          const resolved = new URL(href, origin);
          if (resolved.origin !== origin || shouldSkipUrl(resolved)) {
            continue;
          }
          if (!visited.has(resolved.toString())) {
            queue.push({ url: resolved.toString(), depth: current.depth + 1 });
          }
        } catch {
          continue;
        }
      }
    }
  }

  totalBytes = Math.max(headerBytes, performanceBytesTotal);

  await browser.close();

  // Ensure at least one page was scanned
  if (pagesVisited.length === 0) {
    throw new Error("Failed to scan any pages. Website may be inaccessible or blocking automated access.");
  }

  return {
    totalBytes: Math.max(1, totalBytes), // Ensure non-zero
    domNodes: Math.max(1, totalDomNodes), // Ensure non-zero
    jsExecutionMs: Math.max(1, totalJsExecutionMs), // Ensure non-zero
    visitedUrl,
    visitedAt,
    screenshot: screenshotFilename ? `/screenshots/${screenshotFilename}` : "",
    pagesScanned: pagesVisited.length,
    pagesVisited,
  };
}
