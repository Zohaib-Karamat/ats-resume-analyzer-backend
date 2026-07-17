import mongoose, { Schema } from 'mongoose';

const coverLetterSchema = new Schema(
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
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicating the cover letter generation for the exact same inputs
coverLetterSchema.index({ user: 1, resume: 1, jobDescription: 1 }, { unique: true });

export const CoverLetter = mongoose.model('CoverLetter', coverLetterSchema);
