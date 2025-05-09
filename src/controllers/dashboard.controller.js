import db from "../config/db.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

export const getDashboardInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      {
        rows: [lastTodo]
      },
      {
        rows: [lastBook]
      },
      {
        rows: [lastVideo]
      },
      {
        rows: [userInfo]
      },
      {
        rows: [todoCount]
      },
      {
        rows: [bookCount]
      },
      {
        rows: [videoCount]
      }
    ] = await Promise.all([
      db.query(
        `SELECT created_at FROM todos WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [userId]
      ),
      db.query(
        `SELECT created_at FROM books WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [userId]
      ),
      db.query(
        `SELECT created_at FROM videos WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [userId]
      ),
      db.query(`SELECT last_login FROM users WHERE id = $1`, [userId]),
      db.query(`SELECT COUNT(*) FROM todos WHERE user_id = $1`, [userId]),
      db.query(`SELECT COUNT(*) FROM books WHERE user_id = $1`, [userId]),
      db.query(`SELECT COUNT(*) FROM videos WHERE user_id = $1`, [userId])
    ]);

    return successResponse(res, {
      lastTodoActivity: lastTodo?.created_at || null,
      lastBookActivity: lastBook?.created_at || null,
      lastVideoActivity: lastVideo?.created_at || null,
      lastLogin: userInfo?.last_login || null,
      counts: {
        todos: parseInt(todoCount?.count) || 0,
        books: parseInt(bookCount?.count) || 0,
        videos: parseInt(videoCount?.count) || 0
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard info:", error);
    return errorResponse(res, "Failed to load dashboard info", 500);
  }
};
