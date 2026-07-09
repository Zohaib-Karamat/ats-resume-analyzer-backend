import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { sendOtpEmail } from "./mail.service.js";
import crypto from "crypto";

const getOtpExpireMinutes = () => Number(process.env.OTP_EXPIRE_MINUTES || 10);

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

const getOtpExpiry = () =>
  new Date(Date.now() + getOtpExpireMinutes() * 60 * 1000);

export const registerUser = async (userData) => {
  const { name, email, password } = userData;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const otp = generateOtp();

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    emailVerificationOtp: hashOtp(otp),
    emailVerificationOtpExpiresAt: getOtpExpiry(),
  });

  await sendOtpEmail({
    to: user.email,
    subject: "Verify your email",
    otp,
    purpose: "email verification",
  });

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

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email before signing in");
  }

  const token = user.generateAuthToken();
  const loggedInUser = await User.findById(user._id).select("-password");

  return { user: loggedInUser, token };
};

export const verifyEmail = async (email, otp) => {
  const user = await User.findOne({ email }).select(
    "+emailVerificationOtp +emailVerificationOtpExpiresAt",
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  const isOtpValid =
    user.emailVerificationOtp === hashOtp(otp) &&
    user.emailVerificationOtpExpiresAt &&
    user.emailVerificationOtpExpiresAt > new Date();

  if (!isOtpValid) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  user.isEmailVerified = true;
  user.emailVerificationOtp = undefined;
  user.emailVerificationOtpExpiresAt = undefined;
  await user.save();

  return await User.findById(user._id).select("-password");
};

export const resendEmailVerificationOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  const otp = generateOtp();
  user.emailVerificationOtp = hashOtp(otp);
  user.emailVerificationOtpExpiresAt = getOtpExpiry();
  await user.save();

  await sendOtpEmail({
    to: user.email,
    subject: "Verify your email",
    otp,
    purpose: "email verification",
  });
};

export const sendForgotPasswordOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    return;
  }

  const otp = generateOtp();
  user.passwordResetOtp = hashOtp(otp);
  user.passwordResetOtpExpiresAt = getOtpExpiry();
  await user.save();

  await sendOtpEmail({
    to: user.email,
    subject: "Reset your password",
    otp,
    purpose: "password reset",
  });
};

export const resetPasswordWithOtp = async (email, otp, newPassword) => {
  const user = await User.findOne({ email }).select(
    "+passwordResetOtp +passwordResetOtpExpiresAt",
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isOtpValid =
    user.passwordResetOtp === hashOtp(otp) &&
    user.passwordResetOtpExpiresAt &&
    user.passwordResetOtpExpiresAt > new Date();

  if (!isOtpValid) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  user.password = newPassword;
  user.passwordResetOtp = undefined;
  user.passwordResetOtpExpiresAt = undefined;
  await user.save();
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
