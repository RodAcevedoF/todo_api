import db from "../config/db.js";
export default class Todo {
  static async create(
    userId,
    { title, description, deadline, priority, checked = false }
  ) {
    const { rows } = await db.query(
      `INSERT INTO todos (user_id, title, description, deadline, priority, checked) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
      [userId, title, description, deadline, priority, checked]
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
    if ("checked" in updates) {
      updates.checked = updates.checked === "true" || updates.checked === true;
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

  static async delete(id, userId) {
    const { rowCount } = await db.query(
      `DELETE FROM todos WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return rowCount > 0;
  }
}
