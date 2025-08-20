"use client";

import type { CalculationResult } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Pill, Scale, Stethoscope, Beaker, FlaskConical, Activity } from "lucide-react";

interface DosageDisplayProps {
  result: CalculationResult | null;
}

const toPersianNumerals = (text: string | number) => {
    if (text === null || text === undefined) return "";
    const persianNumerals = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return String(text).replace(/[0-9]/g, (w) => persianNumerals[+w]);
};


export function DosageDisplay({ result }: DosageDisplayProps) {
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
            <div className="flex items-center gap-2 text-sm"><FlaskConical className="h-4 w-4 text-primary" /> غلظت: {toPersianNumerals(inputs.syrupConcentration)}</div>
            <div className="flex items-center gap-2 text-sm"><Activity className="h-4 w-4 text-primary" /> بیماری: {inputs.disease}</div>
            <div className="flex items-center gap-2 text-sm"><Scale className="h-4 w-4 text-primary" /> وزن بیمار: {toPersianNumerals(inputs.patientWeight)} کیلوگرم</div>
        </div>
        
        <div className="space-y-2">
            <h3 className="font-semibold text-lg">نتایج محاسبه شده</h3>
            <div className="flex items-center gap-2 text-md"><Beaker className="h-5 w-5" /> دوز: {aiResponse.calculatedDose} ({toPersianNumerals(aiResponse.frequency)})</div>
            <div className="flex items-center gap-2 text-lg font-bold text-primary"><Beaker className="h-5 w-5" /> حجم: {aiResponse.calculatedVolume} ({toPersianNumerals(aiResponse.frequency)})</div>
        </div>
        
        <Alert className="bg-accent/50 border-accent">
          <Info className="h-4 w-4 text-accent-foreground" />
          <AlertTitle>نکات مهم دارویی</AlertTitle>
          <AlertDescription>{aiResponse.notes}</AlertDescription>
        </Alert>

      </CardContent>
    </Card>
  );
}
