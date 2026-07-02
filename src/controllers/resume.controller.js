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
