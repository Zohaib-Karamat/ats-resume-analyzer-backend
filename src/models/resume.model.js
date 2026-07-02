import mongoose, { Schema } from 'mongoose';

const resumeSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    storedFileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    uploadStatus: {
      type: String,
      enum: ['pending', 'parsed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const Resume = mongoose.model('Resume', resumeSchema);
