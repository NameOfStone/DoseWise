"use client";

import type { SavedCalculation, CalculationResult } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, History, Pill, Scale, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { faIR } from "date-fns/locale";

interface SavedCalculationsProps {
  savedCalculations: SavedCalculation[];
  onLoad: (result: CalculationResult) => void;
  onDelete: (id: string) => void;
}

export function SavedCalculations({ savedCalculations, onLoad, onDelete }: SavedCalculationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>محاسبات ذخیره شده</CardTitle>
        <CardDescription>محاسبات گذشته خود را مرور کنید.</CardDescription>
      </CardHeader>
      <CardContent>
        {savedCalculations.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {savedCalculations.map((calc) => (
              <AccordionItem value={calc.id} key={calc.id}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    {calc.aiResponse.hasWarning && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    <span>{calc.inputs.medicineName} - {format(new Date(calc.createdAt), "PPp", { locale: faIR })}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm"><Pill className="h-4 w-4 text-primary" /> {calc.inputs.medicineName}</div>
                    <div className="flex items-center gap-2 text-sm"><Scale className="h-4 w-4 text-primary" /> {calc.inputs.patientWeight} {calc.inputs.patientWeightUnit}</div>
                    <p className="text-sm text-muted-foreground">{calc.inputs.dosageGuidelines}</p>
                    {calc.aiResponse.hasWarning && <p className="text-sm text-destructive">{calc.aiResponse.warningMessage}</p>}
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={() => onLoad(calc)}>بارگیری</Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(calc.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <History className="mx-auto h-12 w-12" />
            <p>هنوز محاسبه ذخیره شده‌ای وجود ندارد.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
