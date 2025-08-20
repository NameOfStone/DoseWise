"use client";

import type { CalculationResult, SavedCalculation } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Pill, Scale, Stethoscope, Beaker } from "lucide-react";

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
          <CardTitle>Results</CardTitle>
          <CardDescription>Your calculation results will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full text-muted-foreground min-h-[200px]">
          <div className="text-center">
            <Stethoscope className="mx-auto h-12 w-12" />
            <p>Awaiting calculation...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { inputs, aiResponse } = result;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Calculation Result</CardTitle>
        <CardDescription>Based on the information provided.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="space-y-2">
            <h3 className="font-semibold text-lg">Inputs</h3>
            <div className="flex items-center gap-2 text-sm"><Pill className="h-4 w-4 text-primary" /> Medicine: {inputs.medicineName}</div>
            <div className="flex items-center gap-2 text-sm"><Scale className="h-4 w-4 text-primary" /> Patient Weight: {inputs.patientWeight} {inputs.patientWeightUnit}</div>
        </div>
        
        <div className="space-y-2">
            <h3 className="font-semibold text-lg">Dosage</h3>
            <div className="flex items-center gap-2 text-lg font-bold text-primary"><Beaker className="h-5 w-5" /> {aiResponse.calculatedDose}</div>
        </div>

        {aiResponse.hasWarning ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Interaction Warning!</AlertTitle>
            <AlertDescription>{aiResponse.warningMessage}</AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-accent/50 border-accent">
            <CheckCircle2 className="h-4 w-4 text-accent-foreground" />
            <AlertTitle>No Warnings Detected</AlertTitle>
            <AlertDescription>{aiResponse.warningMessage || "No potential interactions or warnings were found based on the provided information."}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={() => onSave(result)} disabled={isSaved(result)} className="w-full">
          {isSaved(result) ? "Calculation Saved" : "Save Calculation"}
        </Button>
      </CardFooter>
    </Card>
  );
}
