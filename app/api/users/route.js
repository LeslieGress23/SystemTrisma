import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Configuración de la base de datos
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Lesliegre9",
  database: "erptrisma",
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, password } = body;

    if (!name || !password) {
      return NextResponse.json(
        { error: "Por favor, proporciona correo y contraseña." },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      "SELECT idUser, usernameUser, roleUser FROM users WHERE usernameUser = ? AND passwordUser = ?",
      [name, password]
    );

    if (rows.length > 0) {
      const user = rows[0]; 

      const token = jwt.sign({ userId: user.idUser, role: user.roleUser }, 'tu_secreto_secreto', {
        expiresIn: '1d',
      });

      return NextResponse.json({
        message: "Inicio de sesión exitoso",
        role: user.roleUser,
        token: token,
      });
    } else {
      return NextResponse.json(
        { error: "Correo o contraseña incorrectos" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error en la conexión:", error);
    return NextResponse.json(
      { error: "Error en la conexión con la base de datos" },
      { status: 500 }
    );
  }
}