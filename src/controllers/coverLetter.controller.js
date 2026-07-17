import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import * as coverLetterService from '../services/coverLetter.service.js';
import { generateCoverLetterSchema } from '../validators/coverLetter.validator.js';

export const generate = asyncHandler(async (req, res) => {
  const validationResult = generateCoverLetterSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new ApiError(400, "Validation Error", validationResult.error.format());
  }

  const { resumeId, jobDescriptionId } = validationResult.data;
  const coverLetter = await coverLetterService.generateCoverLetter(req.user._id, resumeId, jobDescriptionId);

  return res.status(200).json(
    new ApiResponse(200, coverLetter, "Cover letter generated successfully")
  );
});

export const getAll = asyncHandler(async (req, res) => {
  const coverLetters = await coverLetterService.getCoverLetters(req.user._id);
  return res.status(200).json(
    new ApiResponse(200, coverLetters, "Cover letters fetched successfully")
  );
});

export const getOne = asyncHandler(async (req, res) => {
  const coverLetter = await coverLetterService.getCoverLetterById(req.params.id, req.user._id);
  return res.status(200).json(
    new ApiResponse(200, coverLetter, "Cover letter fetched successfully")
  );
});

export const downloadPdf = asyncHandler(async (req, res) => {
  const coverLetter = await coverLetterService.getCoverLetterById(req.params.id, req.user._id);

  const jdTitle = coverLetter.jobDescription?.title || 'Job';
  const company = coverLetter.jobDescription?.company || 'Company';
  const fileName = `Cover_Letter_${jdTitle}_${company}.pdf`.replace(/[^a-zA-Z0-9_-]/g, '_');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  const pdfStream = coverLetterService.generatePdfStream(coverLetter.content);
  pdfStream.pipe(res);
});

export const remove = asyncHandler(async (req, res) => {
  await coverLetterService.deleteCoverLetter(req.params.id, req.user._id);
  return res.status(200).json(
    new ApiResponse(200, {}, "Cover letter deleted successfully")
  );
});
