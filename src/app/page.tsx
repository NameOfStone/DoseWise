"use client";

import { useState } from "react";
import { DosageCalculator } from "@/components/dose-wise/dosage-calculator";
import { DosageDisplay } from "@/components/dose-wise/dosage-display";
import { SavedCalculations } from "@/components/dose-wise/saved-calculations";
import type { CalculationData, CalculationResult, SavedCalculation } from "@/lib/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope } from "lucide-react";

export default function Home() {
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null);
  const [loadedData, setLoadedData] = useState<CalculationData | null>(null);
  const [savedCalculations, setSavedCalculations] = useLocalStorage<SavedCalculation[]>("dosewise-calculations", []);
  const { toast } = useToast();

  const handleCalculate = (result: CalculationResult) => {
    setCurrentResult(result);
    setLoadedData(result.inputs);
  };

  const handleSaveCalculation = (resultToSave: CalculationResult) => {
    const newSavedCalculation: SavedCalculation = {
      ...resultToSave,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setSavedCalculations([newSavedCalculation, ...savedCalculations]);
    toast({
      title: "محاسبه ذخیره شد",
      description: `محاسبه برای ${resultToSave.inputs.medicineName} ذخیره شد.`,
      className: "bg-accent border-accent-foreground text-accent-foreground",
    });
  };

  const handleLoadCalculation = (result: CalculationResult) => {
    setCurrentResult(result);
    setLoadedData(result.inputs);
    toast({
      title: "محاسبه بارگیری شد",
      description: `محاسبه برای ${result.inputs.medicineName} بارگیری شد.`,
    });
  };

  const handleDeleteCalculation = (id: string) => {
    setSavedCalculations(savedCalculations.filter((calc) => calc.id !== id));
    toast({
      title: "محاسبه حذف شد",
      variant: "destructive",
    });
  };

  const isCalculationSaved = (result: CalculationResult): boolean => {
    return savedCalculations.some(
      (saved) =>
        saved.inputs.medicineName === result.inputs.medicineName &&
        saved.inputs.patientWeight === result.inputs.patientWeight &&
        saved.inputs.dosageGuidelines === result.inputs.dosageGuidelines &&
        saved.inputs.syrupConcentration === result.inputs.syrupConcentration
    );
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-2">
            <Stethoscope className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold font-headline">محاسبه‌گر دوز داروی سافیرا</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          یک حسابگر هوشمند دوز دارو با هشدارهای دارویی.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="lg:sticky lg:top-8">
          <DosageCalculator onCalculate={handleCalculate} loadData={loadedData} />
        </div>
        <div className="space-y-8">
          <DosageDisplay result={currentResult} onSave={handleSaveCalculation} isSaved={isCalculationSaved} />
          <SavedCalculations 
            savedCalculations={savedCalculations} 
            onLoad={handleLoadCalculation}
            onDelete={handleDeleteCalculation}
          />
        </div>
      </div>
    </main>
  );
}
