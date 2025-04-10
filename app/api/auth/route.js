import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Lesliegre9",
  database: process.env.DB_NAME || "erptrisma",
});

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();
    
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE usernameUser = ? AND passwordUser = ?",
      [username, password]
    );
    
    connection.release();

    if (Array.isArray(rows) && rows.length > 0) {
      const user = rows[0];
      const token = jwt.sign(
        { userId: user.idUser, username: user.usernameUser, role: user.roleUser },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1h" }
      );

      // No exponemos la contraseña en la respuesta
      const { passwordUser, ...userWithoutPassword } = user;

      return NextResponse.json({ 
        user: userWithoutPassword,
        token 
      });
    } else {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}