import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import * as analysisService from '../services/analysis.service.js';
import { analyzeResumeSchema } from '../validators/analysis.validator.js';

export const runAnalysis = asyncHandler(async (req, res) => {
  const validationResult = analyzeResumeSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new ApiError(400, "Validation Error", validationResult.error.format());
  }

  const { resumeId, jobDescriptionId } = validationResult.data;
  const analysis = await analysisService.runAnalysis(req.user._id, resumeId, jobDescriptionId);

  return res.status(201).json(
    new ApiResponse(201, analysis, "Analysis completed successfully.")
  );
});

export const getAnalyses = asyncHandler(async (req, res) => {
  const analyses = await analysisService.getAnalyses(req.user._id);

  return res.status(200).json(
    new ApiResponse(200, analyses, "Analyses fetched successfully.")
  );
});

export const getAnalysisById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const analysis = await analysisService.getAnalysisById(id, req.user._id);

  return res.status(200).json(
    new ApiResponse(200, analysis, "Analysis details fetched successfully.")
  );
});

export const deleteAnalysis = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await analysisService.deleteAnalysis(id, req.user._id);

  return res.status(200).json(
    new ApiResponse(200, null, "Analysis deleted successfully.")
  );
});
