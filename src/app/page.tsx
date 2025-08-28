"use client";

import { useState } from "react";
import { DosageCalculator } from "@/components/dose-wise/dosage-calculator";
import { DosageDisplay } from "@/components/dose-wise/dosage-display";
import type { CalculationData, CalculationResult } from "@/lib/types";
import { Stethoscope, Mail, Send } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null);
  const [loadedData, setLoadedData] = useState<CalculationData | null>(null);

  const handleCalculate = (result: CalculationResult) => {
    setCurrentResult(result);
    setLoadedData(result.inputs);
  };

  return (
    <>
      <main className="container mx-auto p-4 md:p-8">
        <div className="absolute top-4 left-4">
          <ThemeToggle />
        </div>
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
      <footer className="w-full mt-12 py-6 border-t">
        <div className="container mx-auto flex flex-col md:flex-row justify-center items-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">تماس با من:</p>
            <div className="flex items-center gap-4">
                <a href="mailto:reza6.rajabalizadeh@gmail.com" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                    reza6.rajabalizadeh@gmail.com
                </a>
                <a href="https://t.me/Reza0Rbz" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                    <Send className="h-4 w-4" />
                    @Reza0Rbz
                </a>
            </div>
        </div>
      </footer>
    </>
  );
}
