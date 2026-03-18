import { config } from 'dotenv';
config();

import '@/ai/flows/smart-diagnosis-assistance-flow.ts';
import '@/ai/flows/ai-prescription-explanation-flow.ts';
import '@/ai/flows/ai-patient-risk-flagging.ts';
import '@/ai/flows/pdf-medical-analysis-flow.ts';
import '@/ai/flows/patient-health-summary-flow.ts';
