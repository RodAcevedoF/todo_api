import { validationResult } from "express-validator";
import User from "../models/User.js";
import db from "../config/db.js"; 
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      errors.array().map((err) => err.msg),
      400
    );
  }

  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return errorResponse(res, "Email already registered", 400);
    }

    const user = await User.create({ name, email, password });
    const token = User.generateToken({ id: user.id }); 

    successResponse(
      res,
      { user: { id: user.id, name: user.name, email: user.email }, token },
      201
    );
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      errors.array().map((err) => err.msg),
      400
    );
  }

  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    if (!user || !(await User.comparePassword(password, user.password))) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const token = User.generateToken({ id: user.id });

    successResponse(res, {
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return errorResponse(res, "Token missing", 400);
    }

    await db.query("INSERT INTO blacklisted_tokens (token) VALUES ($1)", [
      token
    ]);

    successResponse(res, "Successfully logged out");
  } catch (error) {
    errorResponse(res, "Logout failed", 500);
  }
};
