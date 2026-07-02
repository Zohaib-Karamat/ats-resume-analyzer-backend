import { z } from 'zod';

export const createJobDescriptionSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  company: z.string().trim().optional(),
  description: z.string().trim().min(1, "Description is required"),
});

export const updateJobDescriptionSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").optional(),
  company: z.string().trim().optional(),
  description: z.string().trim().min(1, "Description cannot be empty").optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field (title, company, or description) must be provided to update",
});
