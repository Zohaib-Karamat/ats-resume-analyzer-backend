import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';

export const registerUser = async (userData) => {
  const { name, email, password } = userData;
  
  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Create user
  const user = await User.create({ name, email, password });
  
  const createdUser = await User.findById(user._id).select('-password');
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
  const loggedInUser = await User.findById(user._id).select('-password');

  return { user: loggedInUser, token };
};
