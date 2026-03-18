'use server';
/**
 * @fileOverview An AI agent that analyzes medical PDF documents (lab reports, records).
 *
 * - analyzeMedicalPdf - A function that handles the PDF analysis process.
 * - AnalyzeMedicalPdfInput - The input type for the analyzeMedicalPdf function.
 * - AnalyzeMedicalPdfOutput - The return type for the analyzeMedicalPdf function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeMedicalPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "The PDF document as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  additionalContext: z
    .string()
    .optional()
    .describe('Any additional notes or specific questions about the document.'),
});
export type AnalyzeMedicalPdfInput = z.infer<typeof AnalyzeMedicalPdfInputSchema>;

const AnalyzeMedicalPdfOutputSchema = z.object({
  documentType: z.string().describe('The type of medical document identified (e.g., Blood Test, MRI Report, etc.).'),
  summary: z.string().describe('A high-level summary of the document contents.'),
  keyFindings: z.array(z.string()).describe('A list of important medical findings or abnormal values.'),
  recommendations: z.array(z.string()).describe('Suggested follow-up actions or tests for the doctor to consider.'),
  criticalFlags: z.array(z.string()).describe('Any urgent or critical issues that require immediate attention.'),
});
export type AnalyzeMedicalPdfOutput = z.infer<typeof AnalyzeMedicalPdfOutputSchema>;

export async function analyzeMedicalPdf(input: AnalyzeMedicalPdfInput): Promise<AnalyzeMedicalPdfOutput> {
  return analyzeMedicalPdfFlow(input);
}

const pdfPrompt = ai.definePrompt({
  name: 'analyzeMedicalPdfPrompt',
  input: { schema: AnalyzeMedicalPdfInputSchema },
  output: { schema: AnalyzeMedicalPdfOutputSchema },
  prompt: `You are an expert medical document analyst. Your task is to analyze the provided medical PDF document and extract meaningful clinical insights for a physician.

Focus on:
1. Identifying the specific type of report.
2. Summarizing the overall health status indicated.
3. Highlighting any values that are outside of the normal range (abnormalities).
4. Providing professional recommendations for next steps.
5. Flagging any life-threatening or urgent critical issues.

Context from Doctor: {{{additionalContext}}}

Document: {{media url=pdfDataUri}}`,
});

const analyzeMedicalPdfFlow = ai.defineFlow(
  {
    name: 'analyzeMedicalPdfFlow',
    inputSchema: AnalyzeMedicalPdfInputSchema,
    outputSchema: AnalyzeMedicalPdfOutputSchema,
  },
  async (input) => {
    const { output } = await pdfPrompt(input);
    return output!;
  }
);
