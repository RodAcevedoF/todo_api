import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import cloudinary from "../../../src/config/cloudinary";
import TokenModel from "../../../src/models/Token";
import User from "../../../src/models/User";
import {
  register,
  updateProfile,
  deleteUser,
  getProfile,
  updateSensitiveData,
  uploadProfileImage
} from "../../../src/controllers/user.controller";
import { validationResult } from "express-validator";

vi.mock("../../../src/models/User");
vi.mock("../../../src/models/Token");
vi.mock("../../../src/config/cloudinary", () => ({
  default: {
    uploader: { destroy: vi.fn() }
  }
}));

vi.mock("jsonwebtoken");
vi.mock("express-validator", () => ({ validationResult: vi.fn() }));

describe("UserController", () => {
  let app, res, req;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    // mock res
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    vi.clearAllMocks();
  });

  describe("register", () => {
    beforeEach(() => {
      req = { body: { name: "Alice", email: "A@B.COM", password: "pass1234" } };
    });

    it("should return 400 when validation fails", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: "Bad" }]
      });
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Bad"
      });
    });

    it("should return 400 if email already exists", async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      User.findByEmail.mockResolvedValue({ id: 1 });
      await register(req, res);
      expect(User.findByEmail).toHaveBeenCalledWith("a@b.com");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "The email is already registered. Please use another one."
      });
    });

    it("should create user and tokens on success", async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      User.findByEmail.mockResolvedValue(null);
      const newUser = {
        id: 42,
        name: "Alice",
        email: "a@b.com",
        nickname: "Al"
      };
      User.create.mockResolvedValue(newUser);
      User.generateToken.mockReturnValue("ACCESS");
      jwt.sign.mockReturnValue("REFRESH");
      vi.spyOn(TokenModel, "deleteRefreshTokensByUserId").mockResolvedValue();
      vi.spyOn(TokenModel, "saveRefreshToken").mockResolvedValue();
      vi.spyOn(User, "updateLastLogin").mockResolvedValue();

      await register(req, res);

      expect(User.create).toHaveBeenCalledWith({
        name: "Alice",
        email: "a@b.com",
        password: "pass1234"
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: {
            id: 42,
            name: "Alice",
            email: "a@b.com",
            nickname: "Al"
          },
          accessToken: "ACCESS",
          refreshToken: "REFRESH"
        }
      });
    });

    it("should return 500 on unexpected error", async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      User.findByEmail.mockRejectedValue(new Error("DB error"));
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Something went wrong during registration."
      });
    });
  });

  describe("updateProfile", () => {
    beforeEach(() => {
      req = { user: { id: 10 }, body: { name: "Bob" } };
    });

    it("should return 400 with no valid fields", async () => {
      req.body = { foo: "bar" };
      await updateProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "No valid fields provided for update."
      });
    });

    it("should update and return profile", async () => {
      const updated = { id: 10, name: "Bob" };
      User.update.mockResolvedValue(updated);
      await updateProfile(req, res);
      expect(User.update).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ name: "Bob" })
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { message: "Profile updated successfully", user: updated }
      });
    });

    it("should return 500 on error", async () => {
      User.update.mockRejectedValue(new Error("fail"));
      await updateProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "fail"
      });
    });
  });

  describe("deleteUser", () => {
    beforeEach(() => {
      req = { user: { id: 5 } };
    });

    it("should delete user and return 200", async () => {
      User.deleteUser.mockResolvedValue(true);
      await deleteUser(req, res);
      expect(User.deleteUser).toHaveBeenCalledWith(5);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: "User deleted successfully."
      });
    });

    it("should return 500 if deletion fails", async () => {
      User.deleteUser.mockResolvedValue(false);
      await deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to delete user."
      });
    });

    it("should return 500 on exception", async () => {
      User.deleteUser.mockRejectedValue(new Error("err"));
      await deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to delete user."
      });
    });
  });

  describe("getProfile", () => {
    beforeEach(() => {
      req = { user: { id: 7 } };
    });

    it("should return 404 if not found", async () => {
      User.findById.mockResolvedValue(null);
      await getProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found."
      });
    });

    it("should return user profile", async () => {
      const user = { id: 7, name: "Charlie" };
      User.findById.mockResolvedValue(user);
      await getProfile(req, res);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { user }
      });
    });

    it("should return 500 on exception", async () => {
      User.findById.mockRejectedValue(new Error("oops"));
      await getProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to get profile."
      });
    });
  });

  describe("updateSensitiveData", () => {
    beforeEach(() => {
      req = {
        user: { id: 3 },
        body: {
          currentPassword: "old12345",
          password: "newpass12",
          email: "x@x.com"
        }
      };
      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      validationResult.mockReturnValue({ isEmpty: () => true });

      vi.clearAllMocks();
      User.updateSensitiveData = vi.fn(); // ✅ mock limpio funcional
    });

    it("should update credentials and return user", async () => {
      const updated = { id: 3, email: "x@x.com" };

      User.updateSensitiveData.mockResolvedValue(updated);

      await updateSensitiveData(req, res);

      expect(User.updateSensitiveData).toHaveBeenCalledWith(3, "old12345", {
        newEmail: "x@x.com",
        newPassword: "newpass12"
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          message: "Credentials updated successfully",
          user: updated
        }
      });
    });

    it("should return 400 if no fields to update", async () => {
      req.body = { currentPassword: "old12345" };

      await updateSensitiveData(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "No fields to update."
      });
    });

    it("should return 400 if email is invalid", async () => {
      req.body = { currentPassword: "old12345", email: "invalid" };

      await updateSensitiveData(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid email format."
      });
    });

    it("should return 401 if current password is incorrect", async () => {
      User.updateSensitiveData.mockRejectedValue(
        new Error("Incorrect current password")
      );

      await updateSensitiveData(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Current password is incorrect."
      });
    });

    it("should return 500 on unexpected error", async () => {
      User.updateSensitiveData.mockRejectedValue(new Error("Database error"));

      await updateSensitiveData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to update credentials."
      });
    });

    it("should return 401 if current password is missing", async () => {
      req.body = { email: "x@x.com", password: "newpass12" };

      await updateSensitiveData(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Current password is required."
      });
    });
  });

  describe("uploadProfileImage", () => {
    beforeEach(() => {
      req = { user: { id: 8 }, fileUrl: "url", filePublicId: "pid" };
    });

    it("should return 400 if missing file data", async () => {
      await uploadProfileImage({ ...req, fileUrl: null }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "No image uploaded"
      });
    });

    it("should destroy old image and update new one", async () => {
      const existing = { profile_image_public_id: "oldpid" };
      vi.spyOn(User, "findById").mockResolvedValue(existing);
      vi.spyOn(cloudinary.uploader, "destroy").mockResolvedValue({});
      vi.spyOn(User, "updateProfileImage").mockResolvedValue({ id: 8 });
      await uploadProfileImage(req, res);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("oldpid");
      expect(User.updateProfileImage).toHaveBeenCalledWith(8, {
        url: "url",
        publicId: "pid"
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { message: "Profile image updated", user: { id: 8 } }
      });
    });

    it("should return 500 on exception", async () => {
      vi.spyOn(User, "findById").mockRejectedValue(new Error("boom"));
      await uploadProfileImage(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "boom"
      });
    });
  });
});
