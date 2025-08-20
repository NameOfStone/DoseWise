export interface CalculationData {
  medicineName: string;
  patientWeight: number;
  dosageGuidelines: string;
  syrupConcentration: string;
  disease: string;
  notes: string;
}

export interface AIResponse {
  notes: string;
  calculatedDose: string;
  calculatedVolume: string;
  frequency: string;
}

export interface CalculationResult {
  inputs: CalculationData;
  aiResponse: AIResponse;
}
