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
      SELECT m.*, c.nameClients 
      FROM maintenance m
      JOIN clients c ON m.idClients = c.idClients
      ORDER BY m.nameMaintenance ASC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    return NextResponse.json({ error: "Error al obtener servicios" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { nameMaintenance, idClients } = await req.json();

    if (!nameMaintenance || !idClients) {
      return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
    }

    const [result] = await db.query(
        "INSERT INTO maintenance (nameMaintenance, idClients) VALUES (UPPER(?), ?)", 
      [nameMaintenance, idClients]
    );

    return NextResponse.json({ idMaintenance: result.insertId }); 
  } catch (error) {
    console.error("Error al crear servicio:", error);
    return NextResponse.json({ error: "Error al crear servicio" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { idMaintenance, nameMaintenance, idClients } = await req.json();

    if (!idMaintenance || !nameMaintenance || !idClients) {
      return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
    }

    await db.query(
      "UPDATE maintenance SET nameMaintenance = UPPER(?), idClients = ? WHERE idMaintenance = ?",
      [nameMaintenance, idClients, idMaintenance]
    );

    return NextResponse.json({ message: "Servicio actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    return NextResponse.json({ error: "Error al actualizar servicio" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { idMaintenance } = await req.json();

    if (!idMaintenance) {
      return NextResponse.json({ error: "Se requiere el ID del servicio." }, { status: 400 });
    }

    await db.query("DELETE FROM maintenance WHERE idMaintenance = ?", [idMaintenance]);

    return NextResponse.json({ message: "Servicio eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    return NextResponse.json({ error: "Error al eliminar servicio" }, { status: 500 });
  }
}
