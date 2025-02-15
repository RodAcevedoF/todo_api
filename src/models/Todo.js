import db from "../config/db.js";
export default class Todo {
  static async create(
    userId,
    { title, description, deadline, fileUrl, priority }
  ) {
    const { rows } = await db.query(
      `INSERT INTO todos (user_id, title, description, deadline, file_url, priority) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, title, description, deadline, fileUrl, priority]
    );
    return rows[0];
  }

  static async findByUser(userId, limit = 10, offset = 0) {
    const { rows } = await db.query(
      `SELECT * FROM todos 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return rows;
  }

  static async update(id, userId, updates) {
    if (updates.fileUrl !== undefined) {
      updates.file_url = updates.fileUrl;
      delete updates.fileUrl;
    }
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 3}`)
      .join(", ");
    const { rows } = await db.query(
      `UPDATE todos 
       SET ${setClause} 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [id, userId, ...Object.values(updates)]
    );
    return rows[0];
  }
}
