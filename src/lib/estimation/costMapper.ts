// Conservative cost assumption:
// - Blended cloud electricity cost is fixed at $0.12 per kWh.
// - This is a simple proxy for energy-related spend, not a bill estimate.
const COST_PER_KWH_USD = 0.12;

export function mapEnergyToCost(energyKwhPerMonth: number): number {
  return Number((energyKwhPerMonth * COST_PER_KWH_USD).toFixed(2));
}
