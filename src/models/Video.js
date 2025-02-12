import db from "../config/db.js";
export default class Video {
  static async create(
    userId,
    { videoId, title, channel, notes, thumbnail = null }
  ) {
    const { rows } = await db.query(
      `INSERT INTO videos (user_id, video_id, title, channel, notes, thumbnail) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, videoId, title, channel, notes, thumbnail]
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
      `SELECT * FROM videos WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return rows[0];
  }

  static async delete(userId, id) {
    const { rowCount } = await db.query(
      `DELETE FROM videos 
       WHERE user_id = $1 AND id = $2`,
      [userId, id]
    );
    return rowCount > 0;
  }

  static async update(id, userId, data) {
    const fields = [];
    const values = [];
    let index = 1;

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (key === 'videoId') continue;

        fields.push(`${key} = $${index}`);
        values.push(data[key]);
        index++;
      }
    }

    if (fields.length === 0) {
      throw new Error("No hay campos válidos para actualizar");
    }

    values.push(id);
    values.push(userId);

    const query = `
      UPDATE videos
      SET ${fields.join(', ')}
      WHERE id = $${index} AND user_id = $${index + 1}
      RETURNING *
    `;

    const { rows } = await db.query(query, values);
    return rows[0];
  }
}
