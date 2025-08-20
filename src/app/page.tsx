"use client";

import { useState } from "react";
import { DosageCalculator } from "@/components/dose-wise/dosage-calculator";
import { DosageDisplay } from "@/components/dose-wise/dosage-display";
import type { CalculationData, CalculationResult } from "@/lib/types";
import { Stethoscope } from "lucide-react";

export default function Home() {
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null);
  const [loadedData, setLoadedData] = useState<CalculationData | null>(null);

  const handleCalculate = (result: CalculationResult) => {
    setCurrentResult(result);
    setLoadedData(result.inputs);
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
          <DosageDisplay result={currentResult} />
        </div>
      </div>
    </main>
  );
}
