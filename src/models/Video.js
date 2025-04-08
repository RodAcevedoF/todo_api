import db from "../config/db.js";
export default class Video {
  // Verifica si el video ya existe para un usuario dado
  static async exists(userId, videoId) {
    const { rows } = await db.query(
      "SELECT id FROM videos WHERE user_id = $1 AND video_id = $2",
      [userId, videoId]
    );
    return rows.length > 0;
  }

  // Crea un nuevo video, si no existe previamente
  static async create(
    userId,
    {
      videoId,
      title,
      channel,
      notes,
      thumbnail = null,
      description = null,
      created_at,
      channelId = null // Nuevo campo añadido con valor predeterminado
    }
  ) {
    if (await this.exists(userId, videoId)) {
      throw new Error("El video ya está guardado.");
    }
    const { rows } = await db.query(
      `INSERT INTO videos (user_id, video_id, title, channel, notes, thumbnail, description, created_at, channelId) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        userId,
        videoId,
        title,
        channel,
        notes,
        thumbnail,
        description,
        created_at,
        channelId
      ]
    );
    return rows[0];
  }

  // Obtiene los videos de un usuario con paginación
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

  // Obtiene un video por su ID y usuario
  static async findById(id, userId) {
    const { rows } = await db.query(
      "SELECT * FROM videos WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return rows[0];
  }

  // Elimina un video dado su ID y usuario
  static async delete(id, userId) {
    const { rowCount } = await db.query(
      "DELETE FROM videos WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return rowCount > 0;
  }

  // Actualiza campos del video; se evita actualizar el videoId
  // Si deseas impedir actualizar también channelId, puedes filtrarlo en el array de keys.
  static async update(id, userId, data) {
    const keys = Object.keys(data).filter((key) => key !== "videoId");
    if (!keys.length) throw new Error("No hay campos válidos para actualizar");

    const fields = keys.map((key, index) => `${key} = $${index + 1}`);
    const values = keys.map((key) => data[key]);
    // Agregamos el id y userId al final
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
