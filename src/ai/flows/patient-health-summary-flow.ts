'use server';
/**
 * @fileOverview An AI agent that generates a clinical summary of a patient's medical history.
 *
 * - generatePatientSummary - A function that generates the summary.
 * - PatientSummaryInput - The input type for the function.
 * - PatientSummaryOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PatientSummaryInputSchema = z.object({
  patientName: z.string(),
  history: z.array(z.string()).describe('List of past diagnoses, notes, and treatments.'),
  medications: z.array(z.string()).describe('List of currently or previously prescribed medicines.'),
});
export type PatientSummaryInput = z.infer<typeof PatientSummaryInputSchema>;

const PatientSummaryOutputSchema = z.object({
  summary: z.string().describe('A 2-3 sentence overview of the patient\'s health history.'),
  topConcerns: z.array(z.string()).describe('The most significant recurring medical issues or risks.'),
  stabilityScore: z.enum(['Stable', 'Guarded', 'Declining', 'Improving']).describe('General trend of patient health.'),
});
export type PatientSummaryOutput = z.infer<typeof PatientSummaryOutputSchema>;

export async function generatePatientSummary(input: PatientSummaryInput): Promise<PatientSummaryOutput> {
  return generatePatientSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePatientSummaryPrompt',
  input: { schema: PatientSummaryInputSchema },
  output: { schema: PatientSummaryOutputSchema },
  prompt: `You are a clinical analyst. Summarize the medical history for patient {{{patientName}}}.
  
  History Records:
  {{#each history}}
  - {{{this}}}
  {{/each}}
  
  Medications:
  {{#each medications}}
  - {{{this}}}
  {{/each}}
  
  Provide a professional summary, list top clinical concerns, and assess the overall health trend (Stable, Guarded, Declining, Improving).`,
});

const generatePatientSummaryFlow = ai.defineFlow(
  {
    name: 'generatePatientSummaryFlow',
    inputSchema: PatientSummaryInputSchema,
    outputSchema: PatientSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
