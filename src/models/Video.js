import db from "../config/db.js";

export default class Video {
  static async exists(userId, video_id) {
    const { rows } = await db.query(
      "SELECT id FROM videos WHERE user_id = $1 AND video_id = $2",
      [userId, video_id]
    );
    return rows.length > 0;
  }

  static async create(
    userId,
    {
      video_id,
      title,
      channel,
      notes,
      thumbnail = null,
      description = null,
      created_at,
      channelId = null,
      views = 0,
      duration_seconds = 0,
      checked = false
    }
  ) {
    if (await this.exists(userId, video_id)) {
      throw new Error("Video is already saved.");
    }
    const { rows } = await db.query(
      `INSERT INTO videos 
        (user_id, video_id, title, channel, notes, thumbnail, description, created_at, channelId, views, duration_seconds, checked) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [
        userId,
        video_id,
        title,
        channel,
        notes,
        thumbnail,
        description,
        created_at,
        channelId,
        views,
        duration_seconds,
        checked
      ]
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

  static async findById(id, userId) {
    const { rows } = await db.query(
      "SELECT * FROM videos WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return rows[0];
  }

  static async delete(id, userId) {
    const { rowCount } = await db.query(
      "DELETE FROM videos WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return rowCount > 0;
  }

  static async update(id, userId, data) {
    const keys = Object.keys(data).filter((key) => key !== "videoId");
    if (!keys.length) throw new Error("No fields to update.");

    const fields = keys.map((key, index) => `${key} = $${index + 1}`);
    const values = keys.map((key) => data[key]);

    values.push(id, userId);

    const query = `
      UPDATE videos
      SET ${fields.join(", ")}
      WHERE id = $${values.length - 1} AND user_id = $${values.length}
      RETURNING *
    `;
    const { rows } = await db.query(query, values);
    return rows[0];
  }
}
