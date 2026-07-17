import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as resumeService from '../services/resume.service.js';

export const uploadResume = asyncHandler(async (req, res) => {
  // req.file contains the uploaded file info, req.user is from auth middleware
  const resume = await resumeService.uploadAndParseResume(req.user._id, req.file);

  return res.status(201).json(
    new ApiResponse(201, resume, 'Resume uploaded and parsed successfully')
  );
});

export const getMyResumes = asyncHandler(async (req, res) => {
  const resumes = await resumeService.getUserResumes(req.user._id);

  return res.status(200).json(
    new ApiResponse(200, resumes, 'Resumes fetched successfully')
  );
});

export const getResume = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const resume = await resumeService.getResumeById(id, req.user._id);

  return res.status(200).json(
    new ApiResponse(200, resume, 'Resume details fetched successfully')
  );
});

export const deleteResume = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await resumeService.deleteResume(id, req.user._id);

  return res.status(200).json(
    new ApiResponse(200, null, 'Resume deleted successfully')
  );
});

// ─── Serve File for Inline Preview ──────────────────────────────────────────
export const serveResumeFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { stream, mimeType, originalFileName } = await resumeService.streamResumeFile(id, req.user._id);

  // Content-Disposition: inline  → browser renders/previews the file
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${originalFileName}"`);
  res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour per session

  stream.pipe(res);
});

// ─── Force Download ────────────────────────────────────────────────────────────
export const downloadResume = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { stream, mimeType, originalFileName } = await resumeService.downloadResumeFile(id, req.user._id);

  // Content-Disposition: attachment  → browser saves the file to disk
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${originalFileName}"`);
  res.setHeader('Cache-Control', 'private, max-age=3600');

  stream.pipe(res);
});
