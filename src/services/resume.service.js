import https from 'https';
import { Resume } from '../models/resume.model.js';
import { ApiError } from '../utils/ApiError.js';
import { extractTextFromFile } from '../utils/fileParser.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

// ─── Upload & Parse ───────────────────────────────────────────────────────────
export const uploadAndParseResume = async (userId, file) => {
  if (!file) {
    throw new ApiError(400, 'No file uploaded');
  }

  // Step 1 — Upload the in-memory buffer to Cloudinary
  let cloudinaryUrl, cloudinaryPublicId;
  try {
    const result = await uploadToCloudinary(file.buffer, file.originalname, file.mimetype);
    cloudinaryUrl = result.secure_url;
    cloudinaryPublicId = result.public_id;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new ApiError(500, 'Failed to upload resume to cloud storage');
  }

  // Step 2 — Create a DB record immediately after successful upload
  const resume = await Resume.create({
    user: userId,
    originalFileName: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size,
    cloudinaryUrl,
    cloudinaryPublicId,
    uploadStatus: 'pending',
  });

  // Step 3 — Parse text from the buffer (no disk I/O needed)
  try {
    const extractedText = await extractTextFromFile(file.buffer, file.mimetype);
    resume.extractedText = extractedText;
    resume.uploadStatus = 'parsed';
    await resume.save();
  } catch (error) {
    // Parsing failed but the file is already safely on Cloudinary
    resume.uploadStatus = 'failed';
    await resume.save();
    throw new ApiError(500, 'File uploaded to cloud but text parsing failed');
  }

  return resume;
};

// ─── Get All Resumes for a User ───────────────────────────────────────────────
export const getUserResumes = async (userId) => {
  return await Resume.find({ user: userId })
    .select('-extractedText') // Omit heavy text field from list views
    .sort({ createdAt: -1 });
};

// ─── Get Single Resume ────────────────────────────────────────────────────────
export const getResumeById = async (resumeId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, user: userId });
  if (!resume) {
    throw new ApiError(404, 'Resume not found');
  }
  return resume;
};

// ─── Delete Resume ────────────────────────────────────────────────────────────
export const deleteResume = async (resumeId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, user: userId });
  if (!resume) {
    throw new ApiError(404, 'Resume not found');
  }

  // Delete from Cloudinary first, then remove DB record
  await deleteFromCloudinary(resume.cloudinaryPublicId);
  await resume.deleteOne();

  return true;
};

// ─── Stream Resume File (Inline Preview) ──────────────────────────────────────
// Proxies the raw Cloudinary file back to the client with inline headers.
// This keeps auth enforcement: the Cloudinary URL is never exposed to the browser.
export const streamResumeFile = (resumeId, userId) => {
  return new Promise(async (resolve, reject) => {
    const resume = await Resume.findOne({ _id: resumeId, user: userId });
    if (!resume) return reject(new ApiError(404, 'Resume not found'));
    if (!resume.cloudinaryUrl) return reject(new ApiError(404, 'File not available in cloud storage'));

    // Use Node's built-in https to fetch the file as a stream (no extra dependencies)
    https.get(resume.cloudinaryUrl, (stream) => {
      if (stream.statusCode !== 200) {
        return reject(new ApiError(502, 'Failed to fetch file from cloud storage'));
      }
      resolve({
        stream,
        mimeType: resume.mimeType,
        originalFileName: resume.originalFileName,
      });
    }).on('error', (err) => {
      reject(new ApiError(502, 'Cloud storage connection error'));
    });
  });
};

// ─── Stream Resume File (Force Download) ──────────────────────────────────────
// Same proxy approach but sets Content-Disposition: attachment so the browser
// downloads the file instead of rendering it inline.
export const downloadResumeFile = async (resumeId, userId) => {
  return streamResumeFile(resumeId, userId); // Same stream, different header in controller
};
