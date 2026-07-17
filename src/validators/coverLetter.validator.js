import { z } from 'zod';

export const generateCoverLetterSchema = z.object({
  resumeId: z.string().min(1, "Resume ID is required"),
  jobDescriptionId: z.string().min(1, "Job Description ID is required"),
});
