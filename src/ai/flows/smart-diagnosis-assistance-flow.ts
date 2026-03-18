'use server';
/**
 * @fileOverview An AI assistant for doctors to aid in patient diagnosis.
 *
 * - smartDiagnosisAssistance - A function that handles the smart diagnosis process.
 * - SmartDiagnosisAssistanceInput - The input type for the smartDiagnosisAssistance function.
 * - SmartDiagnosisAssistanceOutput - The return type for the smartDiagnosisAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartDiagnosisAssistanceInputSchema = z.object({
  symptoms: z.string().describe('A detailed description of the patient\'s symptoms.'),
  age: z.number().int().positive().describe('The patient\'s age in years.'),
  gender: z.string().describe('The patient\'s gender (e.g., Male, Female, Other).'),
  medicalHistory: z.string().describe('Relevant medical history of the patient, including past illnesses, conditions, and medications.'),
});
export type SmartDiagnosisAssistanceInput = z.infer<typeof SmartDiagnosisAssistanceInputSchema>;

const SmartDiagnosisAssistanceOutputSchema = z.object({
  possibleConditions: z.array(z.string()).describe('A list of possible medical conditions based on the input.'),
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The calculated risk level associated with the possible conditions.'),
  suggestedTests: z.array(z.string()).describe('A list of suggested diagnostic tests to confirm or rule out conditions.'),
});
export type SmartDiagnosisAssistanceOutput = z.infer<typeof SmartDiagnosisAssistanceOutputSchema>;

export async function smartDiagnosisAssistance(input: SmartDiagnosisAssistanceInput): Promise<SmartDiagnosisAssistanceOutput> {
  return smartDiagnosisAssistanceFlow(input);
}

const smartDiagnosisAssistancePrompt = ai.definePrompt({
  name: 'smartDiagnosisAssistancePrompt',
  input: { schema: SmartDiagnosisAssistanceInputSchema },
  output: { schema: SmartDiagnosisAssistanceOutputSchema },
  prompt: `You are an AI diagnostic assistant for doctors. Your goal is to provide intelligent suggestions based on patient information to aid the diagnostic process. Analyze the provided symptoms, age, gender, and medical history to suggest possible conditions, assess the risk level, and recommend relevant diagnostic tests.

Patient Information:
Symptoms: {{{symptoms}}}
Age: {{{age}}}
Gender: {{{gender}}}
Medical History: {{{medicalHistory}}}

Based on this information, provide the following:
- A list of possible medical conditions.
- An assessment of the overall risk level (Low, Medium, High, Critical).
- A list of suggested diagnostic tests.`,
});

const smartDiagnosisAssistanceFlow = ai.defineFlow(
  {
    name: 'smartDiagnosisAssistanceFlow',
    inputSchema: SmartDiagnosisAssistanceInputSchema,
    outputSchema: SmartDiagnosisAssistanceOutputSchema,
  },
  async (input) => {
    const { output } = await smartDiagnosisAssistancePrompt(input);
    return output!;
  }
);
