import { CoverLetter } from "../models/coverLetter.model.js";
import { getResumeById } from "./resume.service.js";
import { getJobDescriptionById } from "./jobDescription.service.js";
import { generateCoverLetterPrompt } from "../prompts/coverLetter.prompt.js";
import { callGeminiApi } from "./gemini.service.js";
import { ApiError } from "../utils/ApiError.js";
import PDFDocument from "pdfkit";

export const generateCoverLetter = async (
  userId,
  resumeId,
  jobDescriptionId,
) => {
  // Check if it already exists
  const existingCoverLetter = await CoverLetter.findOne({
    user: userId,
    resume: resumeId,
    jobDescription: jobDescriptionId,
  });
  if (existingCoverLetter) {
    return existingCoverLetter;
  }

  // Verify ownership
  const resume = await getResumeById(resumeId, userId);
  const jobDescription = await getJobDescriptionById(jobDescriptionId, userId);

  if (!resume.extractedText) {
    throw new ApiError(
      400,
      "Resume text is empty. Cannot generate cover letter.",
    );
  }

  // Build the Prompt
  const prompt = generateCoverLetterPrompt(
    resume.extractedText,
    jobDescription.description,
    jobDescription.company,
    jobDescription.title,
  );

  // Call AI (expects { parsed: { coverLetter: string }, ... })
  const { parsed } = await callGeminiApi(prompt);

  if (!parsed || !parsed.coverLetter) {
    throw new ApiError(500, "AI failed to generate a valid cover letter.");
  }

  // Save to DB
  const coverLetterRecord = await CoverLetter.create({
    user: userId,
    resume: resumeId,
    jobDescription: jobDescriptionId,
    content: parsed.coverLetter,
  });

  return coverLetterRecord;
};

export const getCoverLetters = async (userId) => {
  return await CoverLetter.find({ user: userId })
    .populate("resume", "originalFileName")
    .populate("jobDescription", "title company")
    .sort({ createdAt: -1 });
};

export const getCoverLetterById = async (id, userId) => {
  const coverLetter = await CoverLetter.findOne({ _id: id, user: userId })
    .populate("resume", "originalFileName")
    .populate("jobDescription", "title company");

  if (!coverLetter) {
    throw new ApiError(404, "Cover letter not found");
  }
  return coverLetter;
};

export const deleteCoverLetter = async (id, userId) => {
  const coverLetter = await CoverLetter.findOneAndDelete({
    _id: id,
    user: userId,
  });
  if (!coverLetter) {
    throw new ApiError(404, "Cover letter not found");
  }
  return true;
};

export const generatePdfStream = (content) => {
  const doc = new PDFDocument({ margin: 50 });

  // Font sizes and line gaps
  doc.fontSize(12);
  doc.font("Times-Roman");

  // Split content by newlines to handle paragraphs
  const paragraphs = content.split("\n").filter((p) => p.trim() !== "");

  paragraphs.forEach((paragraph, index) => {
    doc.text(paragraph.trim(), {
      align: "left",
    });
    // Add spacing between paragraphs
    if (index < paragraphs.length - 1) {
      doc.moveDown();
    }
  });

  doc.end();
  return doc;
};
