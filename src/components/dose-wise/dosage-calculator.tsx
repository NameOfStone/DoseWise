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
  patientWeight: z.coerce.number().positive({ message: "وزن باید مثبت باشد." }),
  dosageGuidelines: z.string().min(10, { message: "راهنمای دوز مورد نیاز است." }),
  notes: z.string(),
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
    defaultValues: {
      medicineName: "",
      patientWeight: 0,
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

  useEffect(() => {
    if (selectedMedicine) {
      if (selectedMedicine.concentrations.length === 1) {
        form.setValue("syrupConcentration", selectedMedicine.concentrations[0]);
      }
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
        inputs: values,
        aiResponse,
      });

    } catch (error) {
      console.error("AI error:", error);
    } finally {
      setIsLoading(false);
    }
  }
  
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
                          <span 
                            className={cn("flex-1", !field.value ? "text-right" : "text-left")}
                            dir={!field.value ? "rtl" : "ltr"}
                          >
                            {field.value
                              ? medicineLibrary.find((med) => med.name === field.value)?.name
                              : "انتخاب دارو"}
                          </span>
                          <Pill className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="جستجوی دارو..." onValueChange={(search) => { form.setValue('medicineName', search, { shouldValidate: true }); form.setValue('disease', ''); }} dir="ltr" />
                        <CommandEmpty>دارویی یافت نشد.</CommandEmpty>
                        <CommandGroup>
                          {medicineLibrary.map((med) => (
                            <CommandItem
                              value={med.name}
                              key={med.name}
                              className="text-left"
                              dir="ltr"
                              onSelect={() => {
                                form.setValue("medicineName", med.name);
                                // This logic is now handled by the useEffect hook
                                if (med.concentrations.length !== 1) {
                                  form.setValue("syrupConcentration", "");
                                }
                                form.setValue("disease", "");
                                form.setValue("dosageGuidelines", "");
                                form.setValue("notes", "");
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
                            placeholder={!selectedMedicine ? "ابتدا یک دارو انتخاب کنید" : ""}
                            className={cn(!field.value && "text-right")}
                          />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl">
                      {selectedMedicine?.concentrations.map((concentration) => (
                        <SelectItem key={concentration} value={concentration} className="text-right" dir="rtl">
                          {concentration}
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
                   <Select onValueChange={field.onChange} value={field.value} disabled={!selectedMedicine}>
                    <FormControl>
                      <SelectTrigger dir="rtl">
                         <SelectValue 
                            placeholder={!selectedMedicine ? "ابتدا یک دارو انتخاب کنید" : "انتخاب بیماری"}
                            className={cn(!field.value && "text-right")}
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

            <FormField
              control={form.control}
              name="patientWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وزن بیمار (کیلوگرم)</FormLabel>
                  <FormControl>
                    <Input type="number" dir="ltr" placeholder="مثلاً ۱۲.۵" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dosageGuidelines"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>دستورالعمل دوز مصرفی</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="دستورالعمل دوز پس از انتخاب دارو و بیماری نمایش داده می‌شود."
                      className="resize-none"
                      rows={5}
                      {...field}
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
              محاسبه دوز
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
