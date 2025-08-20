'use server';

/**
 * @fileOverview An AI agent that checks for medicine interactions and warnings.
 *
 * - checkInteractionWarning - A function that checks medicine dosages and guidelines against known interactions and warnings.
 * - CheckInteractionWarningInput - The input type for the checkInteractionWarning function.
 * - CheckInteractionWarningOutput - The return type for the checkInteractionWarning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckInteractionWarningInputSchema = z.object({
  medicineName: z.string().describe('The name of the medicine.'),
  patientWeight: z.number().describe('The weight of the patient in kilograms.'),
  dosageGuidelines: z.string().describe('The dosage guidelines for the medicine.'),
});
export type CheckInteractionWarningInput = z.infer<typeof CheckInteractionWarningInputSchema>;

const CheckInteractionWarningOutputSchema = z.object({
  hasWarning: z.boolean().describe('Whether there is a potential interaction or warning.'),
  warningMessage: z.string().describe('The message describing the interaction or warning, if any.'),
  calculatedDose: z.string().describe('The calculated dosage based on the patient\'s weight and guidelines. This could be a range.'),
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
  prompt: `You are a pharmacist specializing in identifying medicine interactions and warnings and calculating dosages.

You will be provided with the medicine name, patient weight, and dosage guidelines. You will cross-reference this information against known interactions and warnings.

Medicine Name: {{{medicineName}}}
Patient Weight: {{{patientWeight}}} kg
Dosage Guidelines: {{{dosageGuidelines}}}

Based on this information, calculate the recommended dose for the patient. The result should be a string, and can be a range if the guidelines specify one (e.g., "140-210 mg"). Also, determine if there are any potential interactions or warnings. If there are, set the hasWarning field to true and provide a detailed warning message. If there are no warnings, set the hasWarning field to false and provide a message confirming no issues were found.
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
