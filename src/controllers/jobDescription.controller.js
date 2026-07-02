import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import * as jobDescriptionService from '../services/jobDescription.service.js';
import { createJobDescriptionSchema, updateJobDescriptionSchema } from '../validators/jobDescription.validator.js';

export const createJobDescription = asyncHandler(async (req, res) => {
  const validationResult = createJobDescriptionSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new ApiError(400, "Validation Error", validationResult.error.format());
  }

  const jobDescription = await jobDescriptionService.createJobDescription(req.user._id, validationResult.data);

  return res.status(201).json(
    new ApiResponse(201, jobDescription, "Job description created successfully.")
  );
});

export const getJobDescriptions = asyncHandler(async (req, res) => {
  const result = await jobDescriptionService.getJobDescriptions(req.user._id, req.query);

  return res.status(200).json(
    new ApiResponse(200, result, "Job descriptions fetched successfully.")
  );
});

export const getJobDescriptionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const jobDescription = await jobDescriptionService.getJobDescriptionById(id, req.user._id);

  return res.status(200).json(
    new ApiResponse(200, jobDescription, "Job description fetched successfully.")
  );
});

export const updateJobDescription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const validationResult = updateJobDescriptionSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new ApiError(400, "Validation Error", validationResult.error.format());
  }

  const jobDescription = await jobDescriptionService.updateJobDescription(id, req.user._id, validationResult.data);

  return res.status(200).json(
    new ApiResponse(200, jobDescription, "Job description updated successfully.")
  );
});

export const deleteJobDescription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await jobDescriptionService.deleteJobDescription(id, req.user._id);

  return res.status(200).json(
    new ApiResponse(200, null, "Job description deleted successfully.")
  );
});
