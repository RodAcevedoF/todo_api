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

  static async delete(userId, videoId) {
    const { rowCount } = await db.query(
      `DELETE FROM videos 
       WHERE user_id = $1 AND id = $2 
       RETURNING id`,
      [userId, videoId]
    );
    return rowCount > 0;
  }

  static async update(id, userId, { videoId, title, channel, notes }) {
    const { rows } = await db.query(
      `UPDATE videos 
       SET video_id = $1, title = $2, channel = $3, notes = $4 
       WHERE id = $5 AND user_id = $6 
       RETURNING *`,
      [videoId, title, channel, notes, id, userId]
    );
    return rows[0];
  }
}
