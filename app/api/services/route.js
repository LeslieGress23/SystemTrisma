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
    const [rows] = await db.query("SELECT * FROM `services` ORDER BY `nameService` ASC");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    return NextResponse.json(
      { error: "Error al obtener servicios" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { nameService } = await req.json();
    if (!nameService ) {
      return NextResponse.json(
        { error: "Por favor, proporciona nombre." },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      "INSERT INTO services (nameService) VALUES (UPPER(?))",
      [nameService]
    );

    return NextResponse.json({
      message: "Servicio creado exitosamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear servicio:", error);
    return NextResponse.json(
      { error: "Error al crear servicio" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const { idService, nameService } = await req.json();
    
    if (!idService || !nameService ) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    await db.query(
      "UPDATE service SET nameService = UPPER(?) WHERE idService = ?",
      [nameService]
    );

    return NextResponse.json({ message: "Servicio actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    return NextResponse.json(
      { error: "Error al actualizar servicio" },
      { status: 500 }
    );
  }
}


export async function DELETE(req) {
  try {
    const { idService } = await req.json();
    if (!idService) {
      return NextResponse.json(
        { error: "Se requiere el ID del servicio." },
        { status: 400 }
      );
    }

    await db.query("DELETE FROM service WHERE idService = ?", [idService]);
    return NextResponse.json({ message: "Servicio eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    return NextResponse.json(
      { error: "Error al eliminar servicio" },
      { status: 500 }
    );
  }
}