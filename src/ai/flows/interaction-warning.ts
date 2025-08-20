'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const InteractionWarningInputSchema = z.object({
  medicineName: z.string().describe("نام دارو"),
  patientWeight: z.union([z.coerce.number(), z.literal("")]).describe("وزن بیمار به کیلوگرم (می‌تواند برای داروهای مبتنی بر سن خالی باشد)"),
  dosageGuidelines: z.string().describe("دستورالعمل‌های استاندارد دوز مصرفی دارو برای بیماری مشخص شده"),
  syrupConcentration: z.string().describe("غلظت شربت (مثلاً ۱۶۰ میلی‌گرم در ۵ میلی‌لیتر)"),
  disease: z.string().describe("بیماری انتخاب شده"),
  notes: z.string().describe("نکات مهم اولیه در مورد دارو و بیماری"),
});
export type InteractionWarningInput = z.infer<typeof InteractionWarningInputSchema>;

const InteractionWarningOutputSchema = z.object({
  notes: z.string().describe("نکات نهایی و تکمیلی در مورد دارو، بیماری و دوز محاسبه شده. اگر دستورالعمل بر اساس سن است، کل دستورالعمل‌های سنی را اینجا برگردان."),
  calculatedDose: z.string().describe("دوز محاسبه شده برای هر نوبت مصرف به صورت یک عدد (مثلا: '۱۴۰ میلی‌گرم'). اگر دستورالعمل مبتنی بر سن است این فیلد را خالی بگذار."),
  calculatedVolume: z.string().describe("حجم مایع محاسبه شده برای هر نوبت مصرف به صورت یک عدد (مثلا: '۴.۴ میلی‌لیتر'). اگر دستورالعمل مبتنی بر سن است این فیلد را خالی بگذار."),
  frequency: z.string().describe("فاصله زمانی مصرف دارو برای هر نوبت (مثلا: 'هر ۶ ساعت'). این اطلاعات را از دستورالعمل دوز استخراج کن و فقط رایج‌ترین مقدار را برگردان. اگر دستورالعمل مبتنی بر سن است این فیلد را خالی بگذار."),
});
export type AIResponse = z.infer<typeof InteractionWarningOutputSchema>;

export async function getInteractionWarning(input: InteractionWarningInput): Promise<AIResponse> {
  return interactionWarningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interactionWarningPrompt',
  input: { schema: InteractionWarningInputSchema },
  output: { schema: InteractionWarningOutputSchema },
  prompt: `شما یک دستیار داروساز متخصص هستید. وظیفه شما محاسبه دقیق دوز دارو برای کودکان و ارائه نکات مهم است. همیشه از مقادیر بالاتر و رایج‌تر برای دوز و فرکانس استفاده کن.

اطلاعات بیمار و دارو:
- نام دارو: {{{medicineName}}}
- بیماری: {{{disease}}}
- وزن بیمار: {{{patientWeight}}} کیلوگرم
- دستورالعمل‌های دوز مصرفی: {{{dosageGuidelines}}}
- غلظت شربت: {{{syrupConcentration}}}
- نکات اولیه: {{{notes}}}

وظایف شما:
1.  **تشخیص نوع دستورالعمل**: ابتدا بررسی کن که آیا دستورالعمل بر اساس وزن بیمار ("به ازای هر کیلوگرم") است یا بر اساس گروه‌های سنی مختلف (مثلاً "کودکان 2 تا 5 سال").

2.  **اگر دستورالعمل بر اساس وزن است**:
    - **تحلیل دستورالعمل دوز**: تشخیص بده که آیا دستورالعمل بر اساس "دوز در هر نوبت" (مثلاً ۱۰ میلی‌گرم/کیلوگرم/نوبت) است یا "دوز روزانه" (مثلاً ۴۰ میلی‌گرم/کیلوگرم/روز).
    - **استخراج فاصله زمانی (Frequency)**: از داخل 'دستورالعمل‌های دوز مصرفی'، فاصله زمانی بین هر نوبت مصرف را استخراج کن (مثلاً: 'هر ۶ ساعت' یا 'هر ۸ ساعت'). فقط رایج‌ترین مقدار را انتخاب کن.
    - **محاسبه دوز برای هر نوبت (Calculated Dose)**:
        - **اگر دستورالعمل بر اساس "دوز در هر نوبت" است**: دوز را مستقیماً بر اساس وزن بیمار و مقدار بالاتر توصیه شده محاسبه کن.
        - **اگر دستورالعمل بر اساس "دوز روزانه" است**:
            الف. ابتدا کل دوز روزانه را بر اساس وزن بیمار و مقدار بالاتر توصیه شده محاسبه کن.
            ب. سپس، تعداد نوبت‌های مصرف در روز را از فاصله زمانی (frequency) به دست بیاور (مثلاً 'هر ۸ ساعت' یعنی ۳ بار در روز).
            ج. کل دوز روزانه را بر تعداد نوبت‌ها تقسیم کن تا دوز برای **هر نوبت** به دست آید.
        - نتیجه را به صورت یک عدد با واحد میلی‌گرم برگردان (مثال: '۲۱۰ میلی‌گرم').
    - **محاسبه حجم برای هر نوبت (Calculated Volume)**: بر اساس دوز محاسبه شده در مرحله قبل و غلظت شربت، حجم مورد نیاز از شربت را در واحد میلی‌لیتر برای هر نوبت مصرف محاسبه کن. نتیجه باید یک عدد باشد (مثال: '۶.۶ میلی‌لیتر').
    - **ارائه نکات (Notes)**: نکات اولیه ارائه شده را با هر نکته تکمیلی و مهم دیگری مرتبط با دارو، بیماری و دوز محاسبه شده، ترکیب کن.

3.  **اگر دستورالعمل بر اساس سن است**:
    - **خروجی‌ها را تنظیم کن**:
        - فیلدهای \`calculatedDose\`، \`calculatedVolume\` و \`frequency\` را خالی بگذار.
        - در فیلد \`notes\`، متن کامل \`dosageGuidelines\` (که شامل دستورالعمل‌های تمام گروه‌های سنی است) را به همراه \`notes\` اولیه قرار بده.

خروجی خود را به صورت یک شیء JSON با ساختار مشخص شده در outputSchema برگردان.`,
});

const interactionWarningFlow = ai.defineFlow(
  {
    name: 'interactionWarningFlow',
    inputSchema: InteractionWarningInputSchema,
    outputSchema: InteractionWarningOutputSchema,
  },
  async (input) => {
    // For age-based dosing, patientWeight is not required.
    const weight = input.patientWeight === "" ? 0 : input.patientWeight;
    const { output } = await prompt({...input, patientWeight: weight});

    if (!output) {
        throw new Error("AI did not return an output.");
    }
    return output;
  }
);
