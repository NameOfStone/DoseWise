"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CalculationData, CalculationResult, Unit } from "@/lib/types";
import { checkInteractionWarning } from "@/ai/flows/interaction-warning";
import { useState } from "react";
import { Loader2, Pill } from "lucide-react";
import { medicineLibrary } from "@/lib/medicines";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const formSchema = z.object({
  medicineName: z.string().min(2, { message: "Medicine name is required." }),
  patientWeight: z.coerce.number().positive({ message: "Weight must be positive." }),
  patientWeightUnit: z.enum(["kg", "lbs"]),
  dosageGuidelines: z.string().min(10, { message: "Dosage guidelines are required." }),
});

type FormValues = z.infer<typeof formSchema>;

interface DosageCalculatorProps {
  onCalculate: (result: CalculationResult) => void;
  loadData?: CalculationData | null;
}

export function DosageCalculator({ onCalculate, loadData }: DosageCalculatorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: loadData || {
      medicineName: "",
      patientWeight: 0,
      patientWeightUnit: "kg",
      dosageGuidelines: "",
    },
    values: loadData, // Use values to sync with parent state
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      let weightInKg = values.patientWeight;
      if (values.patientWeightUnit === "lbs") {
        weightInKg = values.patientWeight / 2.20462;
      }

      const aiInput = {
        medicineName: values.medicineName,
        patientWeight: parseFloat(weightInKg.toFixed(2)),
        dosageGuidelines: values.dosageGuidelines,
      };

      const aiResponse = await checkInteractionWarning(aiInput);
      
      onCalculate({
        inputs: values,
        aiResponse,
      });

    } catch (error) {
      console.error("Calculation error:", error);
      // Here you would use a toast to show the error
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Dosage Calculator</CardTitle>
        <CardDescription>Enter the details below to check for dosage and warnings.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="medicineName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicine Name</FormLabel>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                        >
                          {field.value
                            ? medicineLibrary.find((med) => med.name === field.value)?.name
                            : "Select medicine"}
                          <Pill className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search medicine..." onValueChange={(search) => { form.setValue('medicineName', search); }} />
                        <CommandEmpty>No medicine found.</CommandEmpty>
                        <CommandGroup>
                          {medicineLibrary.map((med) => (
                            <CommandItem
                              value={med.name}
                              key={med.name}
                              onSelect={() => {
                                form.setValue("medicineName", med.name);
                                form.setValue("dosageGuidelines", med.guidelines);
                                setPopoverOpen(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", med.name === field.value ? "opacity-100" : "opacity-0")} />
                              {med.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="patientWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Weight</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type="number" placeholder="e.g., 70" {...field} />
                    </FormControl>
                    <FormField
                      control={form.control}
                      name="patientWeightUnit"
                      render={({ field: unitField }) => (
                        <Select onValueChange={unitField.onChange} defaultValue={unitField.value}>
                          <FormControl>
                            <SelectTrigger className="w-[80px]">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="lbs">lbs</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dosageGuidelines"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosage Guidelines</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 10-15 mg/kg per dose..."
                      className="resize-none"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the dosage guidelines for the medicine.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Calculate Dosage
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
