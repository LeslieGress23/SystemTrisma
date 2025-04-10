import mysql from "mysql2/promise";
import { NextResponse } from "next/server";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Lesliegre9",
  database: "erptrisma",
});

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT d.*, c.nameClients 
      FROM destruction d
      JOIN clients c ON d.idClients = c.idClients
      ORDER BY d.nameDestruction ASC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    return NextResponse.json({ error: "Error al obtener servicios" }, { status: 500 });
  }
}

// Crear un nuevo servicio
export async function POST(req) {
  try {
    const { nameDestruction, idClients } = await req.json();

    // Validación de campos obligatorios
    if (!nameDestruction || !idClients) {
      return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
    }

    const [result] = await db.query(
        "INSERT INTO destruction (nameDestruction, idClients) VALUES (UPPER(?), ?)", 
      [nameDestruction, idClients]
    );

    return NextResponse.json({ idDestruction: result.insertId }); // Cambié 'id' por 'idProducts'
  } catch (error) {
    console.error("Error al crear servicio:", error);
    return NextResponse.json({ error: "Error al crear servicio" }, { status: 500 });
  }
}

// Actualizar un servicio existente
export async function PUT(req) {
  try {
    const { idDestruction, nameDestruction, idClients } = await req.json();

    // Validación de campos obligatorios
    if (!idDestruction || !nameDestruction || !idClients) {
      return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
    }

    await db.query(
      "UPDATE destruction SET nameDestruction = UPPER(?), idClients = ? WHERE idDestruction = ?",
      [nameDestruction, idClients, idDestruction]
    );

    return NextResponse.json({ message: "Servicio actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    return NextResponse.json({ error: "Error al actualizar servicio" }, { status: 500 });
  }
}

// Eliminar un servicio
export async function DELETE(req) {
  try {
    const { idDestruction } = await req.json();

    if (!idDestruction) {
      return NextResponse.json({ error: "Se requiere el ID del servicio." }, { status: 400 });
    }

    await db.query("DELETE FROM destruction WHERE idDestruction = ?", [idDestruction]);

    return NextResponse.json({ message: "Servicio eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    return NextResponse.json({ error: "Error al eliminar servicio" }, { status: 500 });
  }
}
