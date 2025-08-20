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
import { checkInteractionWarning } from "@/ai/flows/interaction-warning";
import { useState, useEffect } from "react";
import { Loader2, Pill } from "lucide-react";
import { medicineLibrary } from "@/lib/medicines";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const formSchema = z.object({
  medicineName: z.string().min(2, { message: "نام دارو الزامی است." }),
  patientWeight: z.coerce.number().positive({ message: "وزن باید مثبت باشد." }),
  dosageGuidelines: z.string().min(10, { message: "راهنمای دوز مورد نیاز است." }),
  syrupConcentration: z.string().min(3, { message: "غلظت شربت الزامی است." }),
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
    },
  });

  useEffect(() => {
    if (loadData) {
      form.reset(loadData);
    }
  }, [loadData, form]);

  const selectedMedicineName = form.watch("medicineName");
  const selectedMedicine = medicineLibrary.find(med => med.name === selectedMedicineName);

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const aiInput = {
        medicineName: values.medicineName,
        patientWeight: values.patientWeight,
        dosageGuidelines: values.dosageGuidelines,
        syrupConcentration: values.syrupConcentration,
      };

      const aiResponse = await checkInteractionWarning(aiInput);
      
      onCalculate({
        inputs: values,
        aiResponse,
      });

    } catch (error) {
      console.error("Calculation error:", error);
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>محاسبه‌گر دوز شربت</CardTitle>
        <CardDescription>برای بررسی دوز و هشدارها، جزئیات زیر را وارد کنید.</CardDescription>
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
                          <span className={cn("flex-1", field.value ? "text-left" : "text-right")} dir={field.value ? "ltr" : "rtl"}>
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
                        <CommandInput placeholder="جستجوی دارو..." onValueChange={(search) => { form.setValue('medicineName', search); }} dir="ltr" />
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
                                form.setValue("dosageGuidelines", med.guidelines);
                                const firstConcentration = med.concentrations[0] || "";
                                form.setValue("syrupConcentration", firstConcentration);
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
              name="syrupConcentration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>غلظت شربت</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!selectedMedicine}>
                    <FormControl>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="ابتدا یک دارو انتخاب کنید" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl">
                      {selectedMedicine?.concentrations.map((concentration) => (
                        <SelectItem key={concentration} value={concentration}>
                          {concentration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    غلظت ماده موثره در شربت را انتخاب کنید.
                  </FormDescription>
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
                      placeholder="دستورالعمل دوز پس از انتخاب دارو نمایش داده می‌شود."
                      className="resize-none"
                      rows={5}
                      {...field}
                      readOnly
                    />
                  </FormControl>
                  <FormDescription>
                    این اطلاعات بر اساس داروی انتخاب شده و از منابع معتبر است.
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
