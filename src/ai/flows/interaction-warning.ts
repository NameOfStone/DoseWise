'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const InteractionWarningInputSchema = z.object({
  medicineName: z.string().describe("نام دارو"),
  patientWeight: z.number().describe("وزن بیمار به کیلوگرم"),
  dosageGuidelines: z.string().describe("دستورالعمل‌های استاندارد دوز مصرفی دارو برای بیماری مشخص شده"),
  syrupConcentration: z.string().describe("غلظت شربت (مثلاً ۱۶۰ میلی‌گرم در ۵ میلی‌لیتر)"),
  disease: z.string().describe("بیماری انتخاب شده"),
  notes: z.string().describe("نکات مهم اولیه در مورد دارو و بیماری"),
});
export type InteractionWarningInput = z.infer<typeof InteractionWarningInputSchema>;

const InteractionWarningOutputSchema = z.object({
  notes: z.string().describe("نکات نهایی و تکمیلی در مورد دارو، بیماری و دوز محاسبه شده."),
  calculatedDose: z.string().describe("دوز محاسبه شده برای هر نوبت مصرف (مثلا: '۱۴۰ الی ۲۱۰ میلی‌گرم'). از کلمه «الی» برای بازه استفاده کن و واحد را به صورت کامل (میلی‌گرم) بنویس."),
  calculatedVolume: z.string().describe("حجم مایع محاسبه شده برای هر نوبت مصرف (مثلا: '۴.۴ الی ۶.۶ میلی‌لیتر'). از کلمه «الی» برای بازه استفاده کن و واحد را به صورت کامل (میلی‌لیتر) بنویس."),
  frequency: z.string().describe("فاصله زمانی مصرف دارو برای هر نوبت (مثلا: 'هر ۴ الی ۶ ساعت'). این اطلاعات را از دستورالعمل دوز استخراج کن."),
});
export type AIResponse = z.infer<typeof InteractionWarningOutputSchema>;

export async function getInteractionWarning(input: InteractionWarningInput): Promise<AIResponse> {
  return interactionWarningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interactionWarningPrompt',
  input: { schema: InteractionWarningInputSchema },
  output: { schema: InteractionWarningOutputSchema },
  prompt: `شما یک دستیار داروساز متخصص هستید. وظیفه شما محاسبه دوز دقیق دارو برای کودکان بر اساس وزن، بیماری و دستورالعمل‌های ارائه شده و همچنین ارائه نکات مهم است.

اطلاعات بیمار و دارو:
- نام دارو: {{{medicineName}}}
- بیماری: {{{disease}}}
- وزن بیمار: {{{patientWeight}}} کیلوگرم
- دستورالعمل‌های دوز مصرفی: {{{dosageGuidelines}}}
- غلظت شربت: {{{syrupConcentration}}}
- نکات اولیه: {{{notes}}}

وظایف شما:
۱. محاسبه دوز: بر اساس وزن بیمار و دستورالعمل‌ها، دوز دقیق دارو را در واحد میلی‌گرم برای هر نوبت مصرف محاسبه کن. نتیجه باید یک بازه (مثلا: ۱۴۰ الی ۲۱۰ میلی‌گرم) یا یک عدد دقیق باشد.
۲. محاسبه حجم: بر اساس دوز محاسبه شده و غلظت شربت، حجم مورد نیاز از شربت را در واحد میلی‌لیتر برای هر نوبت مصرف محاسبه کن. نتیجه باید یک بازه (مثلا: ۴.۴ الی ۶.۶ میلی‌لیتر) یا یک عدد دقیق باشد.
۳. استخراج فاصله زمانی: از داخل 'دستورالعمل‌های دوز مصرفی'، فاصله زمانی بین هر نوبت مصرف را استخراج کن (مثلا: 'هر ۴ الی ۶ ساعت').
۴. ارائه نکات: نکات اولیه ارائه شده را بررسی کن و در صورت لزوم، نکات تکمیلی و مهم دیگری مرتبط با دارو، بیماری و دوز محاسبه شده به آن اضافه کن. اگر نکته جدیدی نبود، همان نکات اولیه را برگردان.

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
