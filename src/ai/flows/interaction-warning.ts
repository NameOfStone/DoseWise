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
  calculatedDose: z.string().describe("دوز محاسبه شده برای هر نوبت مصرف به صورت یک بازه (مثلا: '۱۴۰ الی ۲۱۰ میلی‌گرم'). از کلمه «الی» برای بازه استفاده کن و واحد را به صورت کامل (میلی‌گرم) بنویس."),
  calculatedVolume: z.string().describe("حجم مایع محاسبه شده برای هر نوبت مصرف به صورت یک بازه (مثلا: '۴.۴ الی ۶.۶ میلی‌لیتر'). از کلمه «الی» برای بازه استفاده کن و واحد را به صورت کامل (میلی‌لیتر) بنویس."),
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
  prompt: `شما یک دستیار داروساز متخصص هستید. وظیفه شما محاسبه دقیق دوز دارو برای کودکان و ارائه نکات مهم است.

اطلاعات بیمار و دارو:
- نام دارو: {{{medicineName}}}
- بیماری: {{{disease}}}
- وزن بیمار: {{{patientWeight}}} کیلوگرم
- دستورالعمل‌های دوز مصرفی: {{{dosageGuidelines}}}
- غلظت شربت: {{{syrupConcentration}}}
- نکات اولیه: {{{notes}}}

وظایف شما:
۱. **تحلیل دستورالعمل دوز**: ابتدا تشخیص بده که آیا دستورالعمل بر اساس "دوز در هر نوبت" (مثلاً ۱۰ میلی‌گرم/کیلوگرم/نوبت) است یا "دوز روزانه" (مثلاً ۴۰ میلی‌گرم/کیلوگرم/روز).
۲. **استخراج فاصله زمانی (Frequency)**: از داخل 'دستورالعمل‌های دوز مصرفی'، فاصله زمانی بین هر نوبت مصرف را استخراج کن (مثلاً: 'هر ۴ الی ۶ ساعت' یا 'هر ۸ ساعت').
۳. **محاسبه دوز برای هر نوبت (Calculated Dose)**:
    - **اگر دستورالعمل بر اساس "دوز در هر نوبت" است**: بازه دوز را مستقیماً بر اساس وزن بیمار محاسبه کن.
    - **اگر دستورالعمل بر اساس "دوز روزانه" است**:
        الف. ابتدا کل دوز روزانه را بر اساس وزن بیمار محاسبه کن (به صورت یک بازه).
        ب. سپس، تعداد نوبت‌های مصرف در روز را از فاصله زمانی (frequency) به دست بیاور (مثلاً 'هر ۸ ساعت' یعنی ۳ بار در روز، 'هر ۱۲ ساعت' یعنی ۲ بار در روز). اگر فرکانس یک بازه بود (مثلا هر ۴ الی ۶ ساعت)، از هر دو برای محاسبه بازه نهایی استفاده کن.
        ج. کل دوز روزانه را بر تعداد نوبت‌ها تقسیم کن تا بازه دوز برای **هر نوبت** به دست آید.
    - نتیجه را به صورت یک بازه متنی با واحد میلی‌گرم برگردان (مثال: '۱۴۰ الی ۲۱۰ میلی‌گرم').
۴. **محاسبه حجم برای هر نوبت (Calculated Volume)**: بر اساس بازه دوز محاسبه شده در مرحله قبل و غلظت شربت، بازه حجم مورد نیاز از شربت را در واحد میلی‌لیتر برای هر نوبت مصرف محاسبه کن. نتیجه باید یک بازه متنی باشد (مثال: '۴.۴ الی ۶.۶ میلی‌لیتر').
۵. **ارائه نکات (Notes)**: نکات اولیه ارائه شده را بررسی کن و در صورت لزوم، نکات تکمیلی و مهم دیگری مرتبط با دارو، بیماری و دوز محاسبه شده به آن اضافه کن.

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
