import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDashboardInfo } from "../../../src/controllers/dashboard.controller.js";
import db from "../../../src/config/db.js";
import {
  successResponse,
  errorResponse
} from "../../../src/utils/apiResponse.js";

vi.mock("../../../src/config/db.js");
vi.mock("../../../src/utils/apiResponse.js");

describe("getDashboardInfo", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: 1 } };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    vi.clearAllMocks();
  });

  it("should return dashboard info successfully", async () => {
    const now = new Date().toISOString();

    db.query
      .mockResolvedValueOnce({
        rows: [{ created_at: now, title: "Last Todo" }]
      }) // lastTodo
      .mockResolvedValueOnce({
        rows: [{ created_at: now, title: "Last Book" }]
      }) // lastBook
      .mockResolvedValueOnce({
        rows: [{ created_at: now, title: "Last Video" }]
      }) // lastVideo
      .mockResolvedValueOnce({ rows: [{ last_login: now }] }) // userInfo
      .mockResolvedValueOnce({ rows: [{ count: "5" }] }) // todoCount
      .mockResolvedValueOnce({ rows: [{ count: "3" }] }) // bookCount
      .mockResolvedValueOnce({ rows: [{ count: "7" }] }); // videoCount

    await getDashboardInfo(req, res);

    expect(successResponse).toHaveBeenCalledWith(res, {
      todo: {
        lastTodoActivity: now,
        lastTodoTitle: "Last Todo"
      },
      book: {
        lastBookActivity: now,
        lastBookTitle: "Last Book"
      },
      video: {
        lastVideoActivity: now,
        lastVideoTitle: "Last Video"
      },
      lastLogin: now,
      counts: {
        todos: 5,
        books: 3,
        videos: 7
      }
    });
  });

  it("should return 500 on query error", async () => {
    db.query.mockRejectedValue(new Error("DB failure"));

    await getDashboardInfo(req, res);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Failed to load dashboard info",
      500
    );
  });
});
