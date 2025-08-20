export interface CalculationData {
  medicineName: string;
  patientWeight: number;
  dosageGuidelines: string;
  syrupConcentration: string;
}

export interface OfflineCalculationOutput {
  hasWarning: boolean;
  warningMessage: string;
  calculatedDose: string;
  calculatedVolume: string;
}

export interface CalculationResult {
  inputs: CalculationData;
  aiResponse: OfflineCalculationOutput;
}
