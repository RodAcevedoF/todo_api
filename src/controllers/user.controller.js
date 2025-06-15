import { validationResult } from "express-validator";
import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import Token from "../models/Token.js";
import { normalizeUserUpdate } from "../utils/normalizeUserUpdates.js";

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      errors
        .array()
        .map((err) => err.msg)
        .join("; "),
      400
    );
  }

  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findByEmail(normalizedEmail);
    if (existingUser) {
      return errorResponse(
        res,
        "The email is already registered. Please use another one.",
        400
      );
    }

    const user = await User.create({ name, email: normalizedEmail, password });

    const accessToken = User.generateToken(user);
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES || "7d" }
    );

    await Token.deleteRefreshTokensByUserId(user.id);
    await Token.saveRefreshToken(refreshToken, user.id);
    await User.updateLastLogin(user.id);

    return successResponse(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          nickname: user.nickname
        },
        accessToken,
        refreshToken
      },
      201
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return errorResponse(res, "Something went wrong during registration.", 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      "name",
      "email",
      "description",
      "profile_image",
      "phone",
      "website",
      "github_url",
      "birth_date",
      "hobbies",
      "location",
      "nickname",
      "profile_image_public_id",
      "is_verified",
      "linkedin_url",
      "instagram_url"
    ];

    const validUpdates = Object.keys(updates).filter((key) =>
      allowedUpdates.includes(key)
    );

    if (validUpdates.length === 0) {
      return errorResponse(res, "No valid fields provided for update.", 400);
    }

    const sanitizedUpdates = normalizeUserUpdate(updates);

    const updatedUser = await User.update(req.user.id, sanitizedUpdates);

    return successResponse(res, {
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return errorResponse(
      res,
      error.message || "Failed to update profile.",
      500
    );
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Eliminar el usuario
    const result = await User.deleteUser(userId);

    if (!result) {
      return errorResponse(res, "Failed to delete user.", 500);
    }

    return successResponse(res, "User deleted successfully.", 200);
  } catch (error) {
    console.error("Error during user deletion:", error);
    return errorResponse(res, "Failed to delete user.", 500);
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, "User not found.", 404);
    }

    return successResponse(res, { user }, 200);
  } catch (error) {
    console.error("Error getting profile:", error);
    return errorResponse(res, "Failed to get profile.", 500);
  }
};

export const updateSensitiveData = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      errors
        .array()
        .map((err) => err.msg)
        .join("; "),
      400
    );
  }

  const { email, password, currentPassword } = req.body;

  // Validaciones básicas
  if (!email && !password) {
    return errorResponse(res, "No fields to update.", 400);
  }

  if (!currentPassword) {
    return errorResponse(res, "Current password is required.", 401);
  }

  if (password && password.length < 8) {
    return errorResponse(res, "Password must be at least 8 characters.", 400);
  }

  if (email && !/\S+@\S+\.\S+/.test(email)) {
    return errorResponse(res, "Invalid email format.", 400);
  }

  try {
    const updatedUser = await User.updateSensitiveData(
      req.user.id,
      currentPassword,
      { newEmail: email, newPassword: password }
    );

    return successResponse(res, {
      message: "Credentials updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating sensitive data:", error);
    const message = String(error?.message || "").toLowerCase();
    if (message.includes("incorrect current password")) {
      return errorResponse(res, "Current password is incorrect.", 401);
    }
    return errorResponse(res, "Failed to update credentials.", 500);
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    // Verificamos que el middleware haya asignado ambos datos.
    if (!req.fileUrl || !req.filePublicId) {
      return errorResponse(res, "No image uploaded", 400);
    }

    const userId = req.user.id;

    // Obtenemos el usuario y, si ya tiene una imagen, eliminamos la anterior en Cloudinary.
    const existingUser = await User.findById(userId);
    if (existingUser && existingUser.profile_image_public_id) {
      await cloudinary.uploader.destroy(existingUser.profile_image_public_id);
    }

    // Actualizamos la imagen de perfil del usuario en la DB utilizando el método del modelo.
    const updatedUser = await User.updateProfileImage(userId, {
      url: req.fileUrl,
      publicId: req.filePublicId
    });

    return successResponse(res, {
      message: "Profile image updated",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return errorResponse(
      res,
      error.message || "Failed to update profile image",
      500
    );
  }
};
