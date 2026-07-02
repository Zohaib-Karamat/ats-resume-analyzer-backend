import fs from 'fs';
import path from 'path';
import { Resume } from '../models/resume.model.js';
import { ApiError } from '../utils/ApiError.js';
import { extractTextFromFile } from '../utils/fileParser.js';

export const uploadAndParseResume = async (userId, file) => {
  if (!file) {
    throw new ApiError(400, 'No file uploaded');
  }

  // Initial resume record (pending state)
  const resume = await Resume.create({
    user: userId,
    originalFileName: file.originalname,
    storedFileName: file.filename,
    mimeType: file.mimetype,
    fileSize: file.size,
    filePath: file.path,
    uploadStatus: 'pending'
  });

  try {
    // Extract text synchronously/asynchronously
    const extractedText = await extractTextFromFile(file.path, file.mimetype);
    
    // Update resume record
    resume.extractedText = extractedText;
    resume.uploadStatus = 'parsed';
    await resume.save();
    
    return resume;
  } catch (error) {
    resume.uploadStatus = 'failed';
    await resume.save();
    throw new ApiError(500, 'File uploaded but parsing failed');
  }
};

export const getUserResumes = async (userId) => {
  return await Resume.find({ user: userId }).sort({ createdAt: -1 });
};

export const getResumeById = async (resumeId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, user: userId });
  if (!resume) {
    throw new ApiError(404, 'Resume not found');
  }
  return resume;
};

export const deleteResume = async (resumeId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, user: userId });
  if (!resume) {
    throw new ApiError(404, 'Resume not found');
  }

  // Delete physical file
  if (fs.existsSync(resume.filePath)) {
    fs.unlinkSync(resume.filePath);
  }

  await resume.deleteOne();
  return true;
};
