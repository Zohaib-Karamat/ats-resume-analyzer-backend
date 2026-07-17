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
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    // ─── Cloudinary Fields ───────────────────────────────────────────────────
    cloudinaryUrl: {
      type: String,
      required: true, // Public HTTPS URL returned by Cloudinary
    },
    cloudinaryPublicId: {
      type: String,
      required: true, // Used to delete the asset from Cloudinary later
    },
    // ────────────────────────────────────────────────────────────────────────
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
