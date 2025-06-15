import request from "supertest";
import app from "../../../index.js";
import { it, expect, describe } from "vitest";

describe("GET /ping", () => {
  it("should return 200 and a JSON message", async () => {
    const res = await request(app).get("/ping");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Server is running!" });
  });
});
