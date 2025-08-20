'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InteractionWarningInputSchema = z.object({
  medicineName: z.string().describe("نام دارو"),
  patientWeight: z.number().describe("وزن بیمار به کیلوگرم"),
  dosageGuidelines: z.string().describe("دستورالعمل‌های استاندارد دوز مصرفی دارو"),
  syrupConcentration: z.string().describe("غلظت شربت (مثلاً ۱۶۰ میلی‌گرم در ۵ میلی‌لیتر)"),
});
export type InteractionWarningInput = z.infer<typeof InteractionWarningInputSchema>;

const InteractionWarningOutputSchema = z.object({
  hasWarning: z.boolean().describe("آیا هشدار یا احتیاط خاصی وجود دارد؟"),
  warningMessage: z.string().describe("متن هشدار یا پیام تاییدی مبنی بر عدم وجود هشدار."),
  calculatedDose: z.string().describe("دوز محاسبه شده برای هر نوبت مصرف (مثلا: '۱۴۰ الی ۲۱۰ میلی‌گرم'). از کلمه «الی» برای بازه استفاده کن و واحد را به صورت کامل (میلی‌گرم) بنویس."),
  calculatedVolume: z.string().describe("حجم مایع محاسبه شده برای هر نوبت مصرف (مثلا: '۴.۴ الی ۶.۶ میلی‌لیتر'). از کلمه «الی» برای بازه استفاده کن و واحد را به صورت کامل (میلی‌لیتر) بنویس."),
});
export type AIResponse = z.infer<typeof InteractionWarningOutputSchema>;

export async function getInteractionWarning(input: InteractionWarningInput): Promise<AIResponse> {
  return interactionWarningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interactionWarningPrompt',
  input: { schema: InteractionWarningInputSchema },
  output: { schema: InteractionWarningOutputSchema },
  prompt: `شما یک دستیار داروساز متخصص هستید. وظیفه شما محاسبه دوز دقیق دارو برای کودکان بر اساس وزن و دستورالعمل‌های ارائه شده و همچنین شناسایی هشدارهای احتمالی است.

اطلاعات بیمار و دارو:
- نام دارو: {{{medicineName}}}
- وزن بیمار: {{{patientWeight}}} کیلوگرم
- دستورالعمل‌های دوز مصرفی: {{{dosageGuidelines}}}
- غلظت شربت: {{{syrupConcentration}}}

وظایف شما:
۱. محاسبه دوز: بر اساس وزن بیمار و دستورالعمل‌ها، دوز دقیق دارو را در واحد میلی‌گرم محاسبه کن. نتیجه باید یک بازه (مثلا: ۱۴۰ الی ۲۱۰ میلی‌گرم) یا یک عدد دقیق باشد.
۲. محاسبه حجم: بر اساس دوز محاسبه شده و غلظت شربت، حجم مورد نیاز از شربت را در واحد میلی‌لیتر محاسبه کن. نتیجه باید یک بازه (مثلا: ۴.۴ الی ۶.۶ میلی‌لیتر) یا یک عدد دقیق باشد.
۳. بررسی هشدارها: با توجه به نوع دارو و وزن بیمار، هرگونه هشدار، احتیاط یا موارد منع مصرف را شناسایی کن. برای مثال، برخی داروها برای نوزادان یا وزن‌های خاص مناسب نیستند. اگر هشداری وجود دارد، فیلد hasWarning را true قرار بده و پیام هشدار واضحی بنویس. اگر هیچ هشداری وجود ندارد، hasWarning را false قرار بده و یک پیام تاییدی مبنی بر عدم وجود مشکل بنویس.

خروجی خود را به صورت یک شیء JSON با ساختار مشخص شده در outputSchema برگردان.`,
});

const interactionWarningFlow = ai.defineFlow(
  {
    name: 'interactionWarningFlow',
    inputSchema: InteractionWarningInputSchema,
    outputSchema: InteractionWarningOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("AI did not return an output.");
    }
    return output;
  }
);
