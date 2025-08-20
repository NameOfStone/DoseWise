'use server';

/**
 * @fileOverview An AI agent that checks for medicine warnings.
 *
 * - checkInteractionWarning - A function that checks medicine dosages and guidelines against known warnings.
 * - CheckInteractionWarningInput - The input type for the checkInteractionWarning function.
 * - CheckInteractionWarningOutput - The return type for the checkInteractionWarning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckInteractionWarningInputSchema = z.object({
  medicineName: z.string().describe('The name of the medicine.'),
  patientWeight: z.number().describe('The weight of the patient in kilograms.'),
  dosageGuidelines: z.string().describe('The dosage guidelines for the medicine.'),
  syrupConcentration: z.string().describe('The concentration of the syrup (e.g., "100 mg در 5 ml").'),
});
export type CheckInteractionWarningInput = z.infer<typeof CheckInteractionWarningInputSchema>;

const CheckInteractionWarningOutputSchema = z.object({
  hasWarning: z.boolean().describe('Whether there is a potential warning.'),
  warningMessage: z.string().describe('The message describing the warning, if any.'),
  calculatedDose: z.string().describe('The calculated dosage based on the patient\'s weight and guidelines. This could be a range in mg.'),
  calculatedVolume: z.string().describe('The calculated volume in ml based on the calculated dose and syrup concentration. This could be a range in ml.'),
});
export type CheckInteractionWarningOutput = z.infer<typeof CheckInteractionWarningOutputSchema>;

export async function checkInteractionWarning(
  input: CheckInteractionWarningInput
): Promise<CheckInteractionWarningOutput> {
  return checkInteractionWarningFlow(input);
}

const interactionWarningPrompt = ai.definePrompt({
  name: 'interactionWarningPrompt',
  input: {schema: CheckInteractionWarningInputSchema},
  output: {schema: CheckInteractionWarningOutputSchema},
  prompt: `You are a pharmacist specializing in identifying medicine warnings and calculating dosages for syrups. Your responses must be in Persian.

You will be provided with the medicine name, patient weight, dosage guidelines, and syrup concentration. You will cross-reference this information against known warnings.

Medicine Name: {{{medicineName}}}
Patient Weight: {{{patientWeight}}} kg
Dosage Guidelines: {{{dosageGuidelines}}}
Syrup Concentration: {{{syrupConcentration}}}

Based on this information, first calculate the recommended dose in mg for the patient. The result should be a string and can be a range if the guidelines specify one. For ranges, use the word "الی" instead of a hyphen (e.g., "۱۴۰ الی ۲۱۰ mg"). 
Then, using the calculated dose and the syrup concentration, calculate the corresponding volume in ml. The result should be a string and can be a range (e.g., "۷ الی ۱۰.۵ ml").
**Important: All calculated numerical results for dose and volume must be in Persian numerals and rounded to one decimal place.**
Also, determine if there are any potential warnings. If there are, set the hasWarning field to true and provide a detailed warning message in Persian. If there are no warnings, set the hasWarning field to false and provide a message confirming no issues were found, also in Persian.
`,
});

const checkInteractionWarningFlow = ai.defineFlow(
  {
    name: 'checkInteractionWarningFlow',
    inputSchema: CheckInteractionWarningInputSchema,
    outputSchema: CheckInteractionWarningOutputSchema,
  },
  async input => {
    const {output} = await interactionWarningPrompt(input);
    return output!;
  }
);
