export interface CalculationData {
  medicineName: string;
  patientWeight: number | "";
  dosageGuidelines: string;
  syrupConcentration: string;
  disease: string;
  notes: string;
}

export interface AIResponse {
  notes: string;
  calculatedDose: string; // "۱۴۰ میلی‌گرم"
  calculatedVolume: string; // "۴.۴ میلی‌لیتر"
  frequency: string; // "هر ۶ ساعت"
}

export interface CalculationResult {
  inputs: CalculationData;
  aiResponse: AIResponse;
}
