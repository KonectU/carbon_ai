type WebsiteMetrics = {
  pageWeightKB: number;
  domNodes: number;
  jsExecutionMs: number;
  pagesScanned: number;
  pagesVisited: string[];
  visitedUrl: string;
};

type GeminiReportResult = {
  summary: string;
  detailedAnalysis: string;
  recommendations: Array<{
    title: string;
    description: string;
    estimatedReductionPercent: number;
    effort: "low" | "medium" | "high";
  }>;
};

export async function generateGeminiReport(
  metrics: WebsiteMetrics,
  energy_kWh: number,
  carbon_kg: number
): Promise<GeminiReportResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const pagesListText = metrics.pagesVisited.slice(0, 10).join('\n- ');

  const prompt = `You are an expert web performance analyst and carbon footprint consultant. Conduct a comprehensive analysis of this website and provide actionable insights.

## WEBSITE DETAILS
Website URL: ${metrics.visitedUrl}
Pages Scanned: ${metrics.pagesScanned}
Sample Pages Analyzed:
- ${pagesListText}

## PERFORMANCE METRICS
Total Page Weight: ${metrics.pageWeightKB} KB (${(metrics.pageWeightKB / 1024).toFixed(2)} MB)
DOM Nodes: ${metrics.domNodes}
JavaScript Execution Time: ${metrics.jsExecutionMs} ms (${(metrics.jsExecutionMs / 1000).toFixed(2)} seconds)

## ENVIRONMENTAL IMPACT
Estimated Energy Consumption: ${energy_kWh} kWh per month
Estimated Carbon Footprint: ${carbon_kg} kg CO2 per month
Equivalent to: ${(carbon_kg * 2.2).toFixed(2)} miles driven by an average car

## YOUR TASK
Analyze this website deeply and provide:

1. **SUMMARY**: Write a clear 3-4 sentence executive summary highlighting:
   - Overall website performance status (good/average/poor)
   - Main carbon footprint contributors
   - Key optimization opportunities
   - Potential impact of improvements

2. **DETAILED ANALYSIS**: Write a comprehensive 4-5 paragraph analysis covering:
   - **Performance Issues**: Identify specific problems (heavy page weight, excessive DOM nodes, slow JS execution)
   - **Carbon Impact**: Explain how these issues contribute to carbon emissions
   - **User Experience**: How performance affects users
   - **Technical Debt**: Underlying technical issues causing problems
   - **Business Impact**: Cost implications and environmental responsibility

3. **RECOMMENDATIONS**: Provide 5-8 detailed, prioritized recommendations. Each must include:
   - Clear, actionable title
   - Detailed description (3-4 sentences) explaining:
     * What the problem is
     * Why it matters
     * How to fix it
     * Expected benefits
   - Realistic reduction percentage (5-40%)
   - Effort level (low/medium/high)

Focus on these areas:
- **Images & Media**: Compression, modern formats (WebP/AVIF), lazy loading, responsive images
- **JavaScript**: Bundle size, code splitting, tree shaking, defer/async loading
- **CSS**: Unused styles, critical CSS, minification
- **DOM Complexity**: Reduce nesting, simplify structure, remove unnecessary elements
- **Caching**: Browser caching, CDN usage, service workers
- **Server Optimization**: Compression (Gzip/Brotli), HTTP/2, preloading
- **Third-party Scripts**: Analytics, ads, social media widgets
- **Fonts**: Font loading strategy, variable fonts, subsetting

## OUTPUT FORMAT
Return ONLY valid JSON in this exact format:
{
  "summary": "Executive summary here...",
  "detailedAnalysis": "Comprehensive multi-paragraph analysis here...",
  "recommendations": [
    {
      "title": "Specific recommendation title",
      "description": "Detailed 3-4 sentence description explaining the problem, solution, and benefits",
      "estimatedReductionPercent": 25,
      "effort": "low"
    }
  ]
}

IMPORTANT: 
- Be specific and technical
- Use actual numbers from the metrics
- Prioritize recommendations by impact
- Make descriptions actionable and clear
- Return ONLY JSON, no markdown formatting, no extra text`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API error:", response.status, errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No response from Gemini API");
    }

    // Extract JSON from response (sometimes Gemini wraps it in markdown)
    let jsonText = generatedText.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const result = JSON.parse(jsonText) as GeminiReportResult;
    
    // Validate the result has required fields
    if (!result.summary || !result.detailedAnalysis || !result.recommendations) {
      throw new Error("Invalid response format from Gemini");
    }

    return result;
  } catch (error) {
    console.error("Gemini API error:", error);
    // Fallback to basic recommendations if Gemini fails
    return {
      summary: `Website analyzed with ${metrics.pageWeightKB}KB total weight across ${metrics.pagesScanned} pages, consuming ${energy_kWh} kWh and producing ${carbon_kg} kg CO2. The site shows opportunities for optimization in page weight, DOM complexity, and JavaScript execution time.`,
      detailedAnalysis: `The website scan reveals several areas for improvement. With a total page weight of ${metrics.pageWeightKB}KB across ${metrics.pagesScanned} pages, the site's carbon footprint is estimated at ${carbon_kg} kg CO2 per month. The DOM structure contains ${metrics.domNodes} nodes, which may impact rendering performance. JavaScript execution time of ${metrics.jsExecutionMs}ms suggests opportunities for code optimization. These metrics indicate that implementing performance optimizations could significantly reduce both the environmental impact and improve user experience. Key areas to focus on include asset optimization, code efficiency, and reducing unnecessary complexity in the page structure.`,
      recommendations: [
        {
          title: "Optimize and compress images",
          description: "Images likely contribute significantly to the ${metrics.pageWeightKB}KB page weight. Implement modern image formats like WebP or AVIF, compress existing images, and use responsive images with srcset. Consider lazy loading for below-the-fold images to reduce initial page load.",
          estimatedReductionPercent: 25,
          effort: "low",
        },
        {
          title: "Reduce JavaScript bundle size",
          description: "With ${metrics.jsExecutionMs}ms execution time, JavaScript optimization is crucial. Implement code splitting to load only necessary code, remove unused dependencies, and defer non-critical scripts. Use tree shaking to eliminate dead code from your bundles.",
          estimatedReductionPercent: 20,
          effort: "medium",
        },
        {
          title: "Simplify DOM structure",
          description: "The ${metrics.domNodes} DOM nodes indicate a complex page structure. Reduce unnecessary nesting, remove redundant wrapper elements, and simplify component hierarchies. This will improve rendering performance and reduce memory consumption.",
          estimatedReductionPercent: 15,
          effort: "medium",
        },
        {
          title: "Implement efficient caching strategy",
          description: "Set up proper browser caching headers for static assets, implement a CDN for global content delivery, and consider service workers for offline functionality. This reduces repeat data transfer and server load.",
          estimatedReductionPercent: 18,
          effort: "low",
        },
        {
          title: "Enable compression and minification",
          description: "Ensure all text-based assets (HTML, CSS, JS) are minified and served with Gzip or Brotli compression. This can reduce transfer sizes by 60-80% without changing functionality.",
          estimatedReductionPercent: 22,
          effort: "low",
        },
      ],
    };
  }
}
