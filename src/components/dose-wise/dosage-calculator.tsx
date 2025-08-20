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
import type { CalculationData, CalculationResult } from "@/lib/types";
import { getInteractionWarning } from "@/ai/flows/interaction-warning";
import { useState, useEffect } from "react";
import { Loader2, Pill, Syringe } from "lucide-react";
import { medicineLibrary } from "@/lib/medicines";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, Stethoscope } from "lucide-react";

const formSchema = z.object({
  medicineName: z.string().min(2, { message: "نام دارو الزامی است." }),
  syrupConcentration: z.string().min(3, { message: "غلظت شربت الزامی است." }),
  disease: z.string().min(1, { message: "انتخاب بیماری الزامی است."}),
  patientWeight: z.union([z.coerce.number().positive({ message: "وزن باید مثبت باشد." }), z.literal("")]),
  dosageGuidelines: z.string().min(1, { message: "راهنمای دوز مورد نیاز است." }),
  notes: z.string(),
}).refine(data => {
    const selectedMedicine = medicineLibrary.find(med => med.name === data.medicineName);
    const isWeightBased = selectedMedicine?.diseases.some(d => d.guidelines.includes("به ازای هر کیلوگرم"));
    // If it's weight-based, patientWeight is required. Otherwise, it's optional.
    return !isWeightBased || data.patientWeight !== "";
}, {
    message: "وزن بیمار برای این دارو الزامی است.",
    path: ["patientWeight"],
});


type FormValues = z.infer<typeof formSchema>;

interface DosageCalculatorProps {
  onCalculate: (result: CalculationResult) => void;
  loadData?: CalculationData | null;
}

const toPersianNumerals = (text: string | number | undefined | null) => {
    if (text === null || text === undefined) return "";
    return String(text).replace(/[0-9]/g, (w) => "۰۱۲۳۴۵۶۷۸۹"[+w]);
};


export function DosageCalculator({ onCalculate, loadData }: DosageCalculatorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicineName: "",
      patientWeight: "",
      dosageGuidelines: "",
      syrupConcentration: "",
      disease: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (loadData) {
      form.reset(loadData);
    }
  }, [loadData, form]);

  const selectedMedicineName = form.watch("medicineName");
  const selectedMedicine = medicineLibrary.find(med => med.name === selectedMedicineName);
  const selectedDiseaseName = form.watch("disease");
  const selectedDisease = selectedMedicine?.diseases.find(d => d.name === selectedDiseaseName);
  const isWeightBased = selectedMedicine?.diseases.some(d => d.guidelines.includes("به ازای هر کیلوگرم"));

  useEffect(() => {
    if (selectedMedicine) {
      if (selectedMedicine.concentrations.length === 1) {
        form.setValue("syrupConcentration", selectedMedicine.concentrations[0]);
      } else {
        form.setValue("syrupConcentration", "");
      }

      if (selectedMedicine.diseases.length === 1) {
        form.setValue("disease", selectedMedicine.diseases[0].name);
      } else {
        form.setValue("disease", "");
      }
    } else {
      form.setValue("syrupConcentration", "");
      form.setValue("disease", "");
    }
  }, [selectedMedicine, form]);


  useEffect(() => {
      if (selectedDisease) {
          form.setValue("dosageGuidelines", selectedDisease.guidelines);
          form.setValue("notes", selectedDisease.notes);
      } else {
          form.setValue("dosageGuidelines", "");
          form.setValue("notes", "");
      }
  }, [selectedDisease, form]);


  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const aiResponse = await getInteractionWarning({
          medicineName: values.medicineName,
          patientWeight: values.patientWeight,
          dosageGuidelines: values.dosageGuidelines,
          syrupConcentration: values.syrupConcentration,
          disease: values.disease,
          notes: values.notes,
      });
      
      onCalculate({
        inputs: { ...values },
        aiResponse,
      });

    } catch (error) {
      console.error("AI error:", error);
    } finally {
      setIsLoading(false);
    }
  }
  
  const toEnglishNumerals = (str: string) => {
    if (!str) return "";
    return str.replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1728));
  }

  const formatPersianNumberInput = (value: string | number) => {
    if (value === null || value === undefined) return "";
    return String(value).replace(/[0-9]/g, w => "۰۱۲۳۴۵۶۷۸۹"[+w]);
  };


  return (
    <Card className="h-full">
      <CardHeader>
        <CardDescription>برای محاسبه دوز و مشاهده نکات، جزئیات زیر را وارد کنید.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="medicineName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام دارو</FormLabel>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                        >
                          <Pill className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          <span 
                            className="flex-1 text-right"
                          >
                            {field.value
                              ? medicineLibrary.find((med) => med.name === field.value)?.name
                              : "انتخاب دارو"}
                          </span>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="جستجوی دارو..." dir="rtl" />
                        <CommandEmpty>دارویی یافت نشد.</CommandEmpty>
                        <CommandGroup>
                          {medicineLibrary.map((med) => (
                            <CommandItem
                              value={med.name}
                              key={med.name}
                              className="text-right"
                              dir="rtl"
                              onSelect={() => {
                                form.setValue("medicineName", med.name);
                                form.clearErrors(); // Clear errors to re-evaluate based on new selections
                                setPopoverOpen(false);
                              }}
                            >
                              <Check className={cn("ml-2 h-4 w-4", med.name === field.value ? "opacity-100" : "opacity-0")} />
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
              name="syrupConcentration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>غلظت شربت</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value} disabled={!selectedMedicine || selectedMedicine.concentrations.length <= 1}>
                    <FormControl>
                      <SelectTrigger dir="rtl">
                         <SelectValue 
                            placeholder={!selectedMedicine ? "ابتدا یک دارو انتخاب کنید" : "انتخاب غلظت"}
                          >
                            {toPersianNumerals(field.value)}
                         </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl">
                      {selectedMedicine?.concentrations.map((concentration) => (
                        <SelectItem key={concentration} value={concentration} className="text-right" dir="rtl">
                          {toPersianNumerals(concentration)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="disease"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>بیماری</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value} disabled={!selectedMedicine || selectedMedicine.diseases.length <= 1}>
                    <FormControl>
                      <SelectTrigger dir="rtl">
                         <SelectValue 
                            placeholder={!selectedMedicine ? "ابتدا یک دارو انتخاب کنید" : "انتخاب بیماری"}
                          />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl">
                      {selectedMedicine?.diseases.map((disease) => (
                        <SelectItem key={disease.name} value={disease.name} className="text-right" dir="rtl">
                          {disease.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isWeightBased && (
                <FormField
                control={form.control}
                name="patientWeight"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>وزن بیمار (کیلوگرم)</FormLabel>
                    <FormControl>
                        <Input
                        type="text"
                        dir="rtl"
                        placeholder="مثلاً ۱۲.۵"
                        {...field}
                        value={formatPersianNumberInput(field.value)}
                        onChange={(e) => {
                            const englishValue = toEnglishNumerals(e.target.value);
                            // Allow only numbers and a single decimal point
                            if (/^\d*\.?\d*$/.test(englishValue)) {
                                form.setValue("patientWeight", englishValue);
                            }
                        }}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}
            
            <FormField
              control={form.control}
              name="dosageGuidelines"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>دستورالعمل دوز مصرفی</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="دستورالعمل دوز پس از انتخاب دارو و بیماری نمایش داده می‌شود."
                      className="resize-none whitespace-pre-wrap"
                      rows={5}
                      {...field}
                      value={toPersianNumerals(field.value)}
                      readOnly
                    />
                  </FormControl>
                  <FormDescription>
                    این اطلاعات بر اساس دارو و بیماری انتخاب شده و از منابع معتبر است.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              محاسبه و نمایش نکات
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
