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
  const urlsToVisit: { url: string; depth: number }[] = [{ url, depth: 0 }];
  let totalBytes = 0;
  let totalDomNodes = 0;

  const baseUrl = new URL(url);

  try {
    while (urlsToVisit.length > 0 && pagesVisited.length < options.maxPages) {
      const { url: currentUrl, depth } = urlsToVisit.shift()!;

      if (visitedUrls.has(currentUrl) || depth > options.maxDepth) {
        continue;
      }

      try {
        const response = await fetch(currentUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CarbonAI-Scanner/1.0)',
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout per page
        });

        if (!response.ok) {
          continue;
        }

        const html = await response.text();
        const contentLength = response.headers.get('content-length');
        
        const pageBytes = contentLength ? parseInt(contentLength) : html.length;
        totalBytes += pageBytes;
        visitedUrls.add(currentUrl);
        pagesVisited.push(currentUrl);

        // Estimate DOM nodes from HTML
        totalDomNodes += estimateDomNodes(html);

        // Extract links if we haven't reached max depth
        if (depth < options.maxDepth && pagesVisited.length < options.maxPages) {
          const links = extractLinks(html, currentUrl, baseUrl.origin);
          for (const link of links) {
            if (!visitedUrls.has(link) && urlsToVisit.length < options.maxPages * 2) {
              urlsToVisit.push({ url: link, depth: depth + 1 });
            }
          }
        }

        // Report progress
        if (options.onProgress) {
          await options.onProgress({
            pagesScanned: pagesVisited.length,
            pagesTotal: Math.min(options.maxPages, pagesVisited.length + urlsToVisit.length),
            currentUrl,
            pages: pagesVisited,
          });
        }
      } catch (error) {
        // Skip failed pages and continue
        console.error(`Failed to fetch ${currentUrl}:`, error);
        continue;
      }
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

function extractLinks(html: string, currentUrl: string, baseOrigin: string): string[] {
  const links: string[] = [];
  const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const href = match[1];
      
      // Skip anchors, mailto, tel, javascript
      if (href.startsWith('#') || href.startsWith('mailto:') || 
          href.startsWith('tel:') || href.startsWith('javascript:')) {
        continue;
      }

      // Resolve relative URLs
      const absoluteUrl = new URL(href, currentUrl);
      
      // Only include same-origin links
      if (absoluteUrl.origin === baseOrigin) {
        // Remove hash and query params for deduplication
        absoluteUrl.hash = '';
        links.push(absoluteUrl.toString());
      }
    } catch {
      // Skip invalid URLs
      continue;
    }
  }

  return [...new Set(links)]; // Remove duplicates
}

function estimateDomNodes(html: string): number {
  // Estimate DOM nodes by counting HTML tags
  const tagMatches = html.match(/<[^>]+>/g);
  return tagMatches ? tagMatches.length : 100;
}
