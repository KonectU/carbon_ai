type Recommendation = {
  title: string;
  estimatedReductionPercent: number;
  effort: "low" | "medium" | "high";
};

type RecommendationInputs = {
  pageWeightKB: number;
  domNodes: number;
  jsTimeMs: number;
};

export function generateWebsiteRecommendations({
  pageWeightKB,
  domNodes,
  jsTimeMs,
}: RecommendationInputs): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const weightScore = pageWeightKB / 1000;
  const domScore = domNodes / 2000;
  const jsScore = jsTimeMs / 1000;

  const weightImpact = Math.min(20, Math.max(6, Math.round(weightScore * 6)));
  const domImpact = Math.min(16, Math.max(5, Math.round(domScore * 5)));
  const jsImpact = Math.min(22, Math.max(6, Math.round(jsScore * 6)));

  if (pageWeightKB > 1800) {
    recommendations.push({
      title: "Image compression",
      estimatedReductionPercent: weightImpact,
      effort: "low",
    });
  } else if (pageWeightKB > 900) {
    recommendations.push({
      title: "Lazy loading",
      estimatedReductionPercent: Math.max(6, Math.round(weightImpact * 0.7)),
      effort: "low",
    });
  }

  if (domNodes > 3000) {
    recommendations.push({
      title: "Reduce DOM depth",
      estimatedReductionPercent: domImpact,
      effort: "medium",
    });
  } else if (domNodes > 1800) {
    recommendations.push({
      title: "Streamline layout structure",
      estimatedReductionPercent: Math.max(5, Math.round(domImpact * 0.8)),
      effort: "low",
    });
  }

  if (jsTimeMs > 1800) {
    recommendations.push({
      title: "Remove unused JS",
      estimatedReductionPercent: jsImpact,
      effort: "medium",
    });
  } else if (jsTimeMs > 900) {
    recommendations.push({
      title: "Defer non-critical JS",
      estimatedReductionPercent: Math.max(6, Math.round(jsImpact * 0.7)),
      effort: "low",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: "Maintain current performance budget",
      estimatedReductionPercent: 4,
      effort: "low",
    });
  }

  return recommendations;
}
