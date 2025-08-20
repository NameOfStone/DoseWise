export interface CalculationData {
  medicineName: string;
  patientWeight: number;
  dosageGuidelines: string;
  syrupConcentration: string;
}

export interface AIResponse {
  hasWarning: boolean;
  warningMessage: string;
  calculatedDose: string;
  calculatedVolume: string;
}

export interface CalculationResult {
  inputs: CalculationData;
  aiResponse: AIResponse;
}
