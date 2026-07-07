import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const registerUser = async (userData) => {
  const { name, email, password } = userData;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Create user
  const user = await User.create({ name, email, password });

  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser) {
    throw new ApiError(500, "Failed to register user");
  }

  return createdUser;
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = user.generateAuthToken();
  const loggedInUser = await User.findById(user._id).select("-password");

  return { user: loggedInUser, token };
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();
};

export const updateProfile = async (userId, updateData) => {
  const { email } = updateData;

  if (email) {
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      throw new ApiError(409, "Email is already in use by another account");
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true },
  ).select("-password");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return updatedUser;
};
