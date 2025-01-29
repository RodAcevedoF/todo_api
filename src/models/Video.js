import db from "../config/db.js";

export default class Video {
  static async create(userId, { videoId, title, channel, notes }) {
    const { rows } = await db.query(
      `INSERT INTO videos (user_id, video_id, title, channel, notes) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [userId, videoId, title, channel, notes]
    );
    return rows[0];
  }

  static async findByUser(userId, limit = 10, offset = 0) {
    const { rows } = await db.query(
      `SELECT * FROM videos 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return rows;
  }
}
