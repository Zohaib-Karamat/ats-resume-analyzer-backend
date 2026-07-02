import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import * as authService from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

export const register = asyncHandler(async (req, res) => {
  // Validate request body
  const validationResult = registerSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new ApiError(400, "Validation Error", validationResult.error.format());
  }

  const user = await authService.registerUser(validationResult.data);

  return res.status(201).json(
    new ApiResponse(201, user, "User registered successfully")
  );
});

export const login = asyncHandler(async (req, res) => {
  // Validate request body
  const validationResult = loginSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new ApiError(400, "Validation Error", validationResult.error.format());
  }

  const { email, password } = validationResult.data;
  const { user, token } = await authService.loginUser(email, password);

  return res.status(200).json(
    new ApiResponse(200, { user, token }, "User logged in successfully")
  );
});

export const getMe = asyncHandler(async (req, res) => {
  // req.user is set by authMiddleware
  return res.status(200).json(
    new ApiResponse(200, req.user, "User profile fetched successfully")
  );
});
