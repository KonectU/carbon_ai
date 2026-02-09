type EnergyInputs = {
  pageWeightKB: number;
  domNodes: number;
  jsTimeMs: number;
};

// Conservative, lower-bound heuristics:
// - Only count transferred bytes reported by the crawler (often undercounts).
// - Assume minimal CPU draw during JS execution.
// - Assume minimal layout cost per DOM node.
// These values are intentionally small to avoid overclaiming accuracy.
const NETWORK_KWH_PER_MB = 0.0002;
const CPU_KWH_PER_SECOND = 0.00002;
const LAYOUT_KWH_PER_1000_NODES = 0.000005;

export function estimateWebsiteEnergy({
  pageWeightKB,
  domNodes,
  jsTimeMs,
}: EnergyInputs): number {
  const networkKwh = (pageWeightKB / 1024) * NETWORK_KWH_PER_MB;
  const cpuKwh = (jsTimeMs / 1000) * CPU_KWH_PER_SECOND;
  const layoutKwh = (domNodes / 1000) * LAYOUT_KWH_PER_1000_NODES;

  return Number((networkKwh + cpuKwh + layoutKwh).toFixed(6));
}
