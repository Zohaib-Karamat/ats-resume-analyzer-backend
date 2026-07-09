import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as authService from "../services/auth.service.js";
import {
  registerSchema,
  loginSchema,
  otpSchema,
  emailSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "../validators/auth.validator.js";

export const register = asyncHandler(async (req, res) => {
  // Validate request body
  const validationResult = registerSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new ApiError(
      400,
      "Validation Error",
      validationResult.error.format(),
    );
  }

  const user = await authService.registerUser(validationResult.data);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        user,
        "User registered successfully. Please verify your email with the OTP sent to your inbox",
      ),
    );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const validationResult = otpSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new ApiError(
      400,
      "Validation Error",
      validationResult.error.format(),
    );
  }

  const { email, otp } = validationResult.data;
  const user = await authService.verifyEmail(email, otp);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Email verified successfully"));
});

export const resendVerificationOtp = asyncHandler(async (req, res) => {
  const validationResult = emailSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new ApiError(
      400,
      "Validation Error",
      validationResult.error.format(),
    );
  }

  await authService.resendEmailVerificationOtp(validationResult.data.email);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Verification OTP sent successfully"));
});

export const login = asyncHandler(async (req, res) => {
  // Validate request body
  const validationResult = loginSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new ApiError(
      400,
      "Validation Error",
      validationResult.error.format(),
    );
  }

  const { email, password } = validationResult.data;
  const { user, token } = await authService.loginUser(email, password);

  return res
    .status(200)
    .json(new ApiResponse(200, { user, token }, "User logged in successfully"));
});

export const getMe = asyncHandler(async (req, res) => {
  // req.user is set by authMiddleware
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User profile fetched successfully"));
});

export const logout = asyncHandler(async (req, res) => {
  // Auth uses stateless JWTs (no server-side session), so logout simply
  // instructs the client to discard the token. req.user is set by verifyJWT.
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const validationResult = emailSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new ApiError(
      400,
      "Validation Error",
      validationResult.error.format(),
    );
  }

  await authService.sendForgotPasswordOtp(validationResult.data.email);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset OTP sent successfully"));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const validationResult = resetPasswordSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new ApiError(
      400,
      "Validation Error",
      validationResult.error.format(),
    );
  }

  const { email, otp, newPassword } = validationResult.data;
  await authService.resetPasswordWithOtp(email, otp, newPassword);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

export const changePassword = asyncHandler(async (req, res) => {
  // Validate request body
  const validationResult = changePasswordSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new ApiError(
      400,
      "Validation Error",
      validationResult.error.format(),
    );
  }

  const { currentPassword, newPassword } = validationResult.data;
  await authService.changePassword(req.user._id, currentPassword, newPassword);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  // Validate request body
  const validationResult = updateProfileSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new ApiError(
      400,
      "Validation Error",
      validationResult.error.format(),
    );
  }

  const updatedUser = await authService.updateProfile(
    req.user._id,
    validationResult.data,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});
