import type { CheckInteractionWarningInput, CheckInteractionWarningOutput } from "@/ai/flows/interaction-warning";

export type Unit = "kg" | "lbs";

export interface CalculationData extends CheckInteractionWarningInput {
  patientWeightUnit: Unit;
}

export interface CalculationResult {
  inputs: CalculationData;
  aiResponse: CheckInteractionWarningOutput;
}

export interface SavedCalculation extends CalculationResult {
  id: string;
  createdAt: string;
}
