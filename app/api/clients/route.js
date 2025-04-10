import mysql from "mysql2/promise";
import { NextResponse } from "next/server";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Lesliegre9",
  database: "erptrisma",
});

// Obtener todos los clientes (GET)
export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM `clients` ORDER BY `nameClients` ASC");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return NextResponse.json(
      { error: "Error al obtener clientes" },
      { status: 500 }
    );
  }
}

// Crear un nuevo cliente (POST)
export async function POST(req) {
  try {
    const { nameClients, rfcClients } = await req.json();
    if (!nameClients || !rfcClients) {
      return NextResponse.json(
        { error: "Por favor, proporciona nombre y RFC." },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      "INSERT INTO clients (nameClients, rfcClients) VALUES (UPPER(?), UPPER(?))",
      [nameClients, rfcClients]
    );

    return NextResponse.json({
      message: "Cliente creado exitosamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return NextResponse.json(
      { error: "Error al crear cliente" },
      { status: 500 }
    );
  }
}

// Actualizar un cliente (PUT)
export async function PUT(req) {
  try {
    const { idClients, nameClients, rfcClients } = await req.json();
    
    if (!idClients || !nameClients || !rfcClients) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    await db.query(
      "UPDATE clients SET nameClients = UPPER(?), rfcClients = UPPER(?) WHERE idClients = ?",
      [nameClients, rfcClients, idClients]
    );

    return NextResponse.json({ message: "Cliente actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return NextResponse.json(
      { error: "Error al actualizar cliente" },
      { status: 500 }
    );
  }
}


// Eliminar un cliente (DELETE)
export async function DELETE(req) {
  try {
    const { idClients } = await req.json();
    if (!idClients) {
      return NextResponse.json(
        { error: "Se requiere el ID del cliente." },
        { status: 400 }
      );
    }

    await db.query("DELETE FROM clients WHERE idClients = ?", [idClients]);
    return NextResponse.json({ message: "Cliente eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    return NextResponse.json(
      { error: "Error al eliminar cliente" },
      { status: 500 }
    );
  }
}