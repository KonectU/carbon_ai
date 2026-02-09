const REGION_CARBON_KG_PER_KWH: Record<string, number> = {
  "us-east-1": 0.475,
  "eu-north-1": 0.02,
  "ap-south-1": 0.7,
};

export function mapEnergyToCarbon(energyKwh: number, region: string): number {
  const factor = REGION_CARBON_KG_PER_KWH[region] ?? REGION_CARBON_KG_PER_KWH["us-east-1"];
  return Number((energyKwh * factor).toFixed(6));
}
