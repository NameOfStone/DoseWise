import type { CheckInteractionWarningInput, CheckInteractionWarningOutput } from "@/ai/flows/interaction-warning";

export interface CalculationData extends Omit<CheckInteractionWarningInput, 'patientWeight'> {
  patientWeight: number;
}

export interface CalculationResult {
  inputs: CalculationData;
  aiResponse: CheckInteractionWarningOutput;
}
