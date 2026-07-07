import { Analysis } from '../models/analysis.model.js';
import { getResumeById } from './resume.service.js';
import { getJobDescriptionById } from './jobDescription.service.js';
import { generateAtsPrompt } from '../prompts/atsAnalysis.prompt.js';
import { callGeminiApi } from './gemini.service.js';
import { ApiError } from '../utils/ApiError.js';

export const runAnalysis = async (userId, resumeId, jobDescriptionId) => {
  // Check if this exact analysis already exists to save AI cost
  const existingAnalysis = await Analysis.findOne({ user: userId, resume: resumeId, jobDescription: jobDescriptionId });
  if (existingAnalysis) {
    return existingAnalysis;
  }

  // Ensure user owns both the Resume and the Job Description
  // These service functions already verify ownership and throw 404 if not found
  const resume = await getResumeById(resumeId, userId);
  const jobDescription = await getJobDescriptionById(jobDescriptionId, userId);

  if (!resume.extractedText) {
    throw new ApiError(400, "Resume text is empty. Cannot perform analysis.");
  }

  // Build the Prompt
  const prompt = generateAtsPrompt(resume.extractedText, jobDescription.description);

  // Call AI
  const { parsed, raw, model } = await callGeminiApi(prompt);

  // Save the result in DB
  const analysisRecord = await Analysis.create({
    user: userId,
    resume: resumeId,
    jobDescription: jobDescriptionId,
    overallScore: parsed.overallScore,
    keywordScore: parsed.keywordScore,
    matchedSkills: parsed.matchedSkills || [],
    missingSkills: parsed.missingSkills || [],
    strengths: parsed.strengths || [],
    weaknesses: parsed.weaknesses || [],
    grammarSuggestions: parsed.grammarSuggestions || [],
    atsSuggestions: parsed.atsSuggestions || [],
    summary: parsed.summary || "",
    aiModel: model,
    rawResponse: raw
  });

  return analysisRecord;
};

export const getAnalyses = async (userId) => {
  return await Analysis.find({ user: userId })
    .populate('resume', 'originalFileName')
    .populate('jobDescription', 'title company')
    .sort({ createdAt: -1 });
};

export const getAnalysisById = async (id, userId) => {
  const analysis = await Analysis.findOne({ _id: id, user: userId })
    .populate('resume', 'originalFileName extractedText')
    .populate('jobDescription', 'title company description');
    
  if (!analysis) {
    throw new ApiError(404, "Analysis not found");
  }
  return analysis;
};

export const deleteAnalysis = async (id, userId) => {
  const analysis = await Analysis.findOneAndDelete({ _id: id, user: userId });
  if (!analysis) {
    throw new ApiError(404, "Analysis not found");
  }
  return true;
};
