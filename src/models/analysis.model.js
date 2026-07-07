import mongoose, { Schema } from 'mongoose';

const analysisSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    jobDescription: {
      type: Schema.Types.ObjectId,
      ref: 'JobDescription',
      required: true,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    keywordScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    grammarSuggestions: {
      type: [String],
      default: [],
    },
    atsSuggestions: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      required: true,
    },
    aiModel: {
      type: String,
      default: 'gemini-3.5-flash',
    },
    rawResponse: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent a user from accidentally analyzing the exact same resume against the exact same job description twice
analysisSchema.index({ user: 1, resume: 1, jobDescription: 1 }, { unique: true });

export const Analysis = mongoose.model('Analysis', analysisSchema);
