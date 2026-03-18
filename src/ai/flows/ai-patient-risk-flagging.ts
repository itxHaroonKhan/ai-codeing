'use server';
/**
 * @fileOverview An AI agent to analyze patient medical history and flag potential risks.
 *
 * - aiPatientRiskFlagging - A function that handles the patient risk flagging process.
 * - AIPatientRiskFlaggingInput - The input type for the aiPatientRiskFlagging function.
 * - AIPatientRiskFlaggingOutput - The return type for the aiPatientRiskFlagging function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIPatientRiskFlaggingInputSchema = z.object({
  patientId: z.string().describe('The unique identifier for the patient.'),
  diagnosisHistory: z
    .array(z.string())
    .describe('A list of past diagnoses for the patient, including dates if available.'),
  symptomsHistory: z
    .array(z.string())
    .describe('A list of recorded symptoms for the patient, including duration or frequency.'),
  medicationHistory: z
    .array(z.string())
    .describe('A list of medications prescribed to the patient, including dates if available.'),
});
export type AIPatientRiskFlaggingInput = z.infer<typeof AIPatientRiskFlaggingInputSchema>;

const AIPatientRiskFlaggingOutputSchema = z.object({
  hasRepeatedInfectionPatterns: z
    .boolean()
    .describe('True if the patient shows patterns of recurrent infections.'),
  hasChronicSymptoms: z.boolean().describe('True if the patient presents with chronic or persistent symptoms.'),
  hasHighRiskCombinations: z
    .boolean()
    .describe('True if the patient has medical conditions or medications that form high-risk combinations.'),
  riskSummary: z
    .string()
    .describe('A summary explaining the identified risks and the reasoning.'),
  recommendedAction: z
    .string()
    .describe('Suggested proactive interventions or further tests based on the identified risks.'),
});
export type AIPatientRiskFlaggingOutput = z.infer<typeof AIPatientRiskFlaggingOutputSchema>;

export async function aiPatientRiskFlagging(
  input: AIPatientRiskFlaggingInput
): Promise<AIPatientRiskFlaggingOutput> {
  return aiPatientRiskFlaggingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPatientRiskFlaggingPrompt',
  input: { schema: AIPatientRiskFlaggingInputSchema },
  output: { schema: AIPatientRiskFlaggingOutputSchema },
  prompt: `You are an AI medical assistant specializing in identifying patient risks from medical history.

Analyze the provided patient medical history and identify any of the following risk patterns:
1.  **Repeated infection patterns**: Look for diagnoses or symptoms indicating recurring infections (e.g., flu, common cold, UTIs) over a period.
2.  **Chronic symptoms**: Identify symptoms that are persistent, long-lasting, or frequently reoccurring, suggesting a chronic condition.
3.  **High-risk combinations**: Detect any combinations of diagnoses, symptoms, or medications that might pose a significant health risk or indicate potential complications.

Based on your analysis, determine the boolean flags for each risk category and provide a clear, concise summary of your findings and a recommended proactive action for the doctor.

Patient ID: {{{patientId}}}
Diagnosis History: {{{diagnosisHistory}}}
Symptoms History: {{{symptomsHistory}}}
Medication History: {{{medicationHistory}}}`,
});

const aiPatientRiskFlaggingFlow = ai.defineFlow(
  {
    name: 'aiPatientRiskFlaggingFlow',
    inputSchema: AIPatientRiskFlaggingInputSchema,
    outputSchema: AIPatientRiskFlaggingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
