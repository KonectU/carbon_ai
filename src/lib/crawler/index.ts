// Smart crawler that switches between Playwright and Simple crawler
// based on environment (Vercel vs Local)

import type { CrawlOptions } from './websiteCrawler';

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

// Detect if running on Vercel or Render (serverless environments)
const isServerless = 
  process.env.VERCEL === '1' || 
  process.env.VERCEL_ENV !== undefined ||
  process.env.RENDER === 'true' ||
  process.env.RENDER_SERVICE_NAME !== undefined;

export async function crawlWebsite(
  url: string,
  options?: CrawlOptions
): Promise<CrawlMetrics> {
  if (isServerless) {
    // Use simple crawler on serverless platforms (no Playwright)
    console.log('🌐 Using Simple Crawler (Serverless environment)');
    const { crawlWebsite: simpleCrawl } = await import('./simpleCrawler');
    return simpleCrawl(url, options);
  } else {
    // Use Playwright locally
    console.log('🎭 Using Playwright Crawler (Local environment)');
    const { crawlWebsite: playwrightCrawl } = await import('./websiteCrawler');
    return playwrightCrawl(url, options);
  }
}

export type { CrawlOptions, CrawlMetrics };
