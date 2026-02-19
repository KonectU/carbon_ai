// Lightweight crawler for Vercel - No headless browser needed
// Uses simple HTTP requests instead of Playwright

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
  maxPages: 10,
  maxDepth: 2,
};

export async function crawlWebsite(
  url: string,
  options: CrawlOptions = DEFAULT_OPTIONS
): Promise<CrawlMetrics> {
  const startTime = Date.now();
  const visitedUrls = new Set<string>();
  const pagesVisited: string[] = [];
  let totalBytes = 0;
  let totalDomNodes = 0;

  try {
    // Fetch the main page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CarbonAI-Scanner/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const contentLength = response.headers.get('content-length');
    
    totalBytes = contentLength ? parseInt(contentLength) : html.length;
    visitedUrls.add(url);
    pagesVisited.push(url);

    // Estimate DOM nodes from HTML
    totalDomNodes = estimateDomNodes(html);

    // Report progress
    if (options.onProgress) {
      await options.onProgress({
        pagesScanned: 1,
        pagesTotal: 1,
        currentUrl: url,
        pages: pagesVisited,
      });
    }

    const jsExecutionMs = Date.now() - startTime;

    return {
      totalBytes,
      domNodes: totalDomNodes,
      jsExecutionMs,
      visitedUrl: url,
      visitedAt: new Date().toISOString(),
      screenshot: '', // No screenshot in simple mode
      pagesScanned: pagesVisited.length,
      pagesVisited,
    };
  } catch (error) {
    throw new Error(`Failed to crawl website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function estimateDomNodes(html: string): number {
  // Estimate DOM nodes by counting HTML tags
  const tagMatches = html.match(/<[^>]+>/g);
  return tagMatches ? tagMatches.length : 100;
}
