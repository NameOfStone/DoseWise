"use client";

import type { CalculationResult, SavedCalculation } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Pill, Scale, Stethoscope, Beaker, FlaskConical } from "lucide-react";

interface DosageDisplayProps {
  result: CalculationResult | null;
  onSave: (result: CalculationResult) => void;
  isSaved: (result: CalculationResult) => boolean;
}

export function DosageDisplay({ result, onSave, isSaved }: DosageDisplayProps) {
  if (!result) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>نتایج</CardTitle>
          <CardDescription>نتایج محاسبه شما در اینجا نمایش داده می‌شود.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full text-muted-foreground min-h-[200px]">
          <div className="text-center">
            <Stethoscope className="mx-auto h-12 w-12" />
            <p>در انتظار محاسبه...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { inputs, aiResponse } = result;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>نتیجه محاسبه</CardTitle>
        <CardDescription>بر اساس اطلاعات ارائه شده.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="space-y-2">
            <h3 className="font-semibold text-lg">ورودی‌ها</h3>
            <div className="flex items-center gap-2 text-sm"><Pill className="h-4 w-4 text-primary" /> دارو: {inputs.medicineName}</div>
            <div className="flex items-center gap-2 text-sm"><Scale className="h-4 w-4 text-primary" /> وزن بیمار: {inputs.patientWeight} {inputs.patientWeightUnit}</div>
            <div className="flex items-center gap-2 text-sm"><FlaskConical className="h-4 w-4 text-primary" /> غلظت: {inputs.syrupConcentration}</div>
        </div>
        
        <div className="space-y-2">
            <h3 className="font-semibold text-lg">نتایج محاسبه شده</h3>
            <div className="flex items-center gap-2 text-md"><Beaker className="h-5 w-5" /> دوز (mg): {aiResponse.calculatedDose}</div>
            <div className="flex items-center gap-2 text-lg font-bold text-primary"><Beaker className="h-5 w-5" /> حجم (ml): {aiResponse.calculatedVolume}</div>
        </div>

        {aiResponse.hasWarning ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>هشدار دارویی!</AlertTitle>
            <AlertDescription>{aiResponse.warningMessage}</AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-accent/50 border-accent">
            <CheckCircle2 className="h-4 w-4 text-accent-foreground" />
            <AlertTitle>هیچ هشداری یافت نشد</AlertTitle>
            <AlertDescription>{aiResponse.warningMessage || "بر اساس اطلاعات ارائه شده، هیچ هشدار بالقوه‌ای یافت نشد."}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={() => onSave(result)} disabled={isSaved(result)} className="w-full">
          {isSaved(result) ? "محاسبه ذخیره شد" : "ذخیره محاسبه"}
        </Button>
      </CardFooter>
    </Card>
  );
}
