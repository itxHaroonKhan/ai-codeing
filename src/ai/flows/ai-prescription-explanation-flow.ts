'use server';
/**
 * @fileOverview An AI agent that generates easy-to-understand explanations for prescribed medications.
 *
 * - aiPrescriptionExplanation - A function that handles the AI prescription explanation process.
 * - AIPrescriptionExplanationInput - The input type for the aiPrescriptionExplanation function.
 * - AIPrescriptionExplanationOutput - The return type for the aiPrescriptionExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicineSchema = z.object({
  name: z.string().describe('The name of the medicine.'),
  dosage: z.string().describe('The dosage instructions for the medicine.'),
  notes: z
    .string()
    .optional()
    .describe('Any additional notes or instructions for the medicine.'),
});

const AIPrescriptionExplanationInputSchema = z.object({
  patientName: z.string().describe('The name of the patient.'),
  doctorName: z.string().describe('The name of the prescribing doctor.'),
  medicines: z
    .array(MedicineSchema)
    .describe('An array of medicines included in the prescription.'),
  instructions: z
    .string()
    .optional()
    .describe('General instructions for the entire prescription.'),
});
export type AIPrescriptionExplanationInput = z.infer<
  typeof AIPrescriptionExplanationInputSchema
>;

const AIPrescriptionExplanationOutputSchema = z.object({
  simpleExplanation: z
    .string()
    .describe(
      'A simple, easy-to-understand explanation of the prescribed medications and their purpose.'
    ),
  lifestyleRecommendations: z
    .array(z.string())
    .describe('A list of lifestyle recommendations relevant to the prescription.'),
  preventativeAdvice: z
    .array(z.string())
    .describe('A list of preventative health advice.'),
});
export type AIPrescriptionExplanationOutput = z.infer<
  typeof AIPrescriptionExplanationOutputSchema
>;

export async function aiPrescriptionExplanation(
  input: AIPrescriptionExplanationInput
): Promise<AIPrescriptionExplanationOutput> {
  return aiPrescriptionExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPrescriptionExplanationPrompt',
  input: {schema: AIPrescriptionExplanationInputSchema},
  output: {schema: AIPrescriptionExplanationOutputSchema},
  prompt: `You are a helpful and empathetic AI assistant designed to explain medical prescriptions to patients in a simple, clear, and encouraging manner.
Your goal is to ensure the patient fully understands their treatment plan, including how to take their medication, why it's prescribed, and any relevant lifestyle or preventative advice.

Generate a simple explanation for the patient, a list of lifestyle recommendations, and a list of preventative advice based on the following prescription details:

Patient Name: {{{patientName}}}
Doctor Name: {{{doctorName}}}

Prescribed Medicines:
{{#each medicines}}
- Medicine: {{{name}}}
  Dosage: {{{dosage}}}
  {{#if notes}}Notes: {{{notes}}}{{/if}}
{{/each}}

{{#if instructions}}
General Instructions: {{{instructions}}}
{{/if}}

Provide the explanation in an easy-to-understand language, avoiding medical jargon where possible. Focus on what the patient needs to know to take their medication safely and effectively, and how to support their recovery or health maintenance through lifestyle choices.

Make sure your output strictly follows the JSON schema provided, including the specified fields for simpleExplanation, lifestyleRecommendations, and preventativeAdvice.`,
});

const aiPrescriptionExplanationFlow = ai.defineFlow(
  {
    name: 'aiPrescriptionExplanationFlow',
    inputSchema: AIPrescriptionExplanationInputSchema,
    outputSchema: AIPrescriptionExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
