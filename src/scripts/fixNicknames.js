// fixNicknames.js
import db from "../config/db.js";

const fixNicknames = async () => {
  try {
    const { rows } = await db.query(
      "SELECT id, name FROM users WHERE nickname IS NULL"
    );

    for (const user of rows) {
      let isUnique = false;
      let nickname;
      const base = user.name.trim().toLowerCase().replace(/\s+/g, "");

      while (!isUnique) {
        const random = Math.floor(100000 + Math.random() * 900000);
        nickname = `@${base}${random}`;
        const check = await db.query(
          "SELECT 1 FROM users WHERE nickname = $1",
          [nickname]
        );
        isUnique = check.rowCount === 0;
      }

      await db.query("UPDATE users SET nickname = $1 WHERE id = $2", [
        nickname,
        user.id
      ]);
      console.log(`✔ Usuario ${user.id} actualizado con nickname ${nickname}`);
    }

    console.log("✅ Todos los nicknames faltantes fueron asignados.");
  } catch (err) {
    console.error("❌ Error al asignar nicknames:", err);
  } finally {
    db.end(); // Cierra la conexión
  }
};

fixNicknames();
