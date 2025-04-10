import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Lesliegre9",
  database: process.env.DB_NAME || "erptrisma",
});

export async function GET(request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    
    if (decoded.username !== "FTMeza") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM users");
    connection.release();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Error al obtener los usuarios" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    
    if (decoded.username !== "FTMeza") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const { usernameUser, emailUser, passwordUser, roleUser } = await request.json();
    
    if (!usernameUser || !passwordUser) {
      return NextResponse.json(
        { error: "Usuario y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();
    
    // Verificar si el usuario ya existe
    const [existingUsers] = await connection.query(
      "SELECT * FROM users WHERE usernameUser = ?",
      [usernameUser]
    );
    
    if (existingUsers.length > 0) {
      connection.release();
      return NextResponse.json(
        { error: "El nombre de usuario ya existe" },
        { status: 400 }
      );
    }

    // Insertar nuevo usuario
    await connection.query(
      "INSERT INTO users (usernameUser, emailUser, passwordUser, roleUser) VALUES (?, ?, ?, ?)",
      [usernameUser, emailUser, passwordUser, roleUser]
    );
    
    connection.release();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    
    if (decoded.username !== "FTMeza") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();
    
    const [existingUsers] = await connection.query(
      "SELECT * FROM users WHERE idUser = ?",
      [id]
    );
    
    if (existingUsers.length === 0) {
      connection.release();
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (existingUsers[0].usernameUser === "FTMeza") {
      connection.release();
      return NextResponse.json(
        { error: "No se puede eliminar al usuario FTMeza" },
        { status: 403 }
      );
    }

    await connection.query(
      "DELETE FROM users WHERE idUser = ?",
      [id]
    );
    
    connection.release();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Error al eliminar el usuario" },
      { status: 500 }
    );
  }
}