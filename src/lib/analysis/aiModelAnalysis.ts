type Precision = "fp32" | "fp16" | "int8";

type AiModelInputs = {
  modelParameters: number;
  precision: Precision;
  requestsPerSecond: number;
  hardwareFlopsPerWatt: number;
  region?: string;
};

type AiEnergyEstimate = {
  energy_kWh_per_month: number;
  carbon_kg_per_month: number;
  assumptions: string[];
};

// Conservative, lower-bound assumptions:
// - FLOPs per inference approximated as 2 * parameters (single forward pass).
// - Precision scaling reduces effective FLOPs, but kept modest.
// - Inference-only; training energy is excluded.
// - Use region-based grid factors when provided, otherwise a conservative global average.
const FLOPS_PER_PARAM = 2;
const PRECISION_SCALE: Record<Precision, number> = {
  fp32: 1,
  fp16: 0.7,
  int8: 0.5,
};
const REGION_CARBON_KG_PER_KWH: Record<string, number> = {
  "us-east-1": 0.475,
  "eu-north-1": 0.02,
  "ap-south-1": 0.7,
};
const GLOBAL_CARBON_KG_PER_KWH = 0.4;

export function estimateAiInferenceEnergy({
  modelParameters,
  precision,
  requestsPerSecond,
  hardwareFlopsPerWatt,
  region,
}: AiModelInputs): AiEnergyEstimate {
  const effectiveFlopsPerInference =
    modelParameters * FLOPS_PER_PARAM * PRECISION_SCALE[precision];
  const watts =
    (effectiveFlopsPerInference * requestsPerSecond) / hardwareFlopsPerWatt;
  const energy_kWh_per_month = (watts * 24 * 30) / 1000;
  const carbonFactor =
    (region && REGION_CARBON_KG_PER_KWH[region]) || GLOBAL_CARBON_KG_PER_KWH;
  const carbon_kg_per_month = energy_kWh_per_month * carbonFactor;

  return {
    energy_kWh_per_month: Number(energy_kWh_per_month.toFixed(4)),
    carbon_kg_per_month: Number(carbon_kg_per_month.toFixed(4)),
    assumptions: [
      "Inference-only estimate; training energy is excluded.",
      "FLOPs per inference approximated as 2x parameter count (single forward pass).",
      "Precision scaling uses conservative reductions for fp16 and int8.",
      "Hardware efficiency is provided by the user and treated as constant.",
      region && REGION_CARBON_KG_PER_KWH[region]
        ? "Region grid factor applied using coarse averages."
        : "Global average grid factor applied when region is missing or unsupported.",
    ],
  };
}
