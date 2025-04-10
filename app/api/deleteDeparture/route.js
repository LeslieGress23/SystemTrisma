import mysql from "mysql2/promise";
import { NextResponse } from "next/server";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Lesliegre9",
  database: "erptrisma",
});

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idSalida = searchParams.get("idSalida");

    if (!idSalida) {
      return NextResponse.json(
        { error: "El parámetro idSalida es requerido" },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();

    try {
      // Verificar si el registro existe antes de eliminarlo
      const [checkResult] = await connection.query(
        "SELECT * FROM departures WHERE idSalida = ?",
        [idSalida]
      );

      if (checkResult.length === 0) {
        return NextResponse.json(
          { error: "El registro no existe" },
          { status: 404 }
        );
      }

      // Eliminar el registro
      const [result] = await connection.query(
        "DELETE FROM departures WHERE idSalida = ?",
        [idSalida]
      );

      // Verificar si se eliminó correctamente
      if (result.affectedRows === 0) {
        return NextResponse.json(
          { error: "No se pudo eliminar el registro" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, message: "Registro eliminado correctamente" },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al eliminar el registro:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}