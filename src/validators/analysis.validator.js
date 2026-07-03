import { z } from 'zod';

export const analyzeResumeSchema = z.object({
  resumeId: z.string().trim().min(1, "Resume ID is required"),
  jobDescriptionId: z.string().trim().min(1, "Job Description ID is required"),
});
