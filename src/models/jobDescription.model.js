import mongoose, { Schema } from 'mongoose';

const jobDescriptionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Adding an index for faster text search across title and company
jobDescriptionSchema.index({ title: 'text', company: 'text' });

export const JobDescription = mongoose.model('JobDescription', jobDescriptionSchema);
