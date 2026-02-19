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

// Detect if running on Vercel
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;

export async function crawlWebsite(
  url: string,
  options?: CrawlOptions
): Promise<CrawlMetrics> {
  if (isVercel) {
    // Use simple crawler on Vercel (no Playwright)
    console.log('🌐 Using Simple Crawler (Vercel environment)');
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
