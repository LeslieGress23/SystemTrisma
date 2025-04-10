import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Lesliegre9", 
  database: "erptrisma",
});

export async function POST(request) {
  try {
    const { idSalida, folioSalida, fechaServicio } = await request.json();

    if (!idSalida || !folioSalida || !fechaServicio) {
      return NextResponse.json(
        {
          message:
            "Faltan campos obligatorios: idSalida, folioSalida o fechaServicio",
        },
        { status: 400 }
      );
    }

    const query = `
      UPDATE departures
      SET folioSalida = ?, fechaServicio = ?
      WHERE idSalida = ?
    `;

    const [result] = await db.execute(query, [
      folioSalida,
      fechaServicio,
      idSalida,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "No se encontró el registro con el idSalida especificado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Folio y fecha de servicio actualizados correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar la base de datos:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}