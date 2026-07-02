import { JobDescription } from '../models/jobDescription.model.js';
import { ApiError } from '../utils/ApiError.js';

export const createJobDescription = async (userId, data) => {
  const jobDescription = await JobDescription.create({
    user: userId,
    ...data
  });
  return jobDescription;
};

export const getJobDescriptions = async (userId, query) => {
  const { page = 1, limit = 10, sort = 'desc', search } = query;
  const skip = (page - 1) * limit;

  // Base query filters to only this user's records
  const filter = { user: userId };

  // If a search keyword is provided, use the text index
  if (search) {
    filter.$text = { $search: search };
  }

  // Determine sort order (desc = newest first, asc = oldest first)
  const sortOption = sort === 'asc' ? { createdAt: 1 } : { createdAt: -1 };

  const jobDescriptions = await JobDescription.find(filter)
    .sort(sortOption)
    .skip(Number(skip))
    .limit(Number(limit));

  const total = await JobDescription.countDocuments(filter);

  return {
    jobDescriptions,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getJobDescriptionById = async (id, userId) => {
  const jobDescription = await JobDescription.findOne({ _id: id, user: userId });
  if (!jobDescription) {
    throw new ApiError(404, 'Job description not found');
  }
  return jobDescription;
};

export const updateJobDescription = async (id, userId, data) => {
  const jobDescription = await JobDescription.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!jobDescription) {
    throw new ApiError(404, 'Job description not found');
  }
  return jobDescription;
};

export const deleteJobDescription = async (id, userId) => {
  const jobDescription = await JobDescription.findOneAndDelete({ _id: id, user: userId });
  if (!jobDescription) {
    throw new ApiError(404, 'Job description not found');
  }
  return true;
};
