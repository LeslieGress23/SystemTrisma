import mysql from "mysql2/promise";
import { NextResponse } from "next/server";

// Configuración de la base de datos
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Lesliegre9",
    database: "erptrisma",
});

export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM `workers` ORDER BY `nameWorkers` ASC");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    return NextResponse.json({ error: "Error al obtener los datos:" }, { status: 500 });
  }
}

// Crear un nuevo empleado
export async function POST(req) {
    try {
        const { nameWorkers, phoneWorkers, adressWorkers, positionWorkers } = await req.json();

        if (!nameWorkers || !phoneWorkers || !adressWorkers || !positionWorkers) {
            return NextResponse.json({ error: "Por favor, proporciona todos los datos del empleado." }, { status: 400 });
        }

        const [result] = await db.query(
            "INSERT INTO workers (nameWorkers, phoneWorkers, adressWorkers, positionWorkers) VALUES (UPPER(?), ?, UPPER(?), UPPER(?))",
            [nameWorkers, phoneWorkers, adressWorkers, positionWorkers]
        );

        return NextResponse.json({
            message: "Empleado registrado exitosamente",
            id: result.insertId,
        });
    } catch (error) {
        console.error("Error al crear empleado:", error);
        return NextResponse.json({ error: "Error al crear empleado" }, { status: 500 });
    }
}

// Actualizar 
export async function PUT(req) {
  try {
    const { idWorkers, nameWorkers, phoneWorkers, adressWorkers, positionWorkers } = await req.json();

    // Validación de campos obligatorios
    if (!idWorkers || !nameWorkers || !phoneWorkers || !adressWorkers || !positionWorkers) {
      return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
    }

    await db.query(
        "UPDATE workers SET nameWorkers = UPPER(?), phoneWorkers = ?, adressWorkers = UPPER(?), positionWorkers = UPPER(?) WHERE idWorkers = ?",
        [nameWorkers, phoneWorkers, adressWorkers, positionWorkers, idWorkers]
      );
      

    return NextResponse.json({ message: "Empleado actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
    return NextResponse.json({ error: "Error al actualizar empleado" }, { status: 500 });
  }
}

// Eliminar 
export async function DELETE(req) {
  try {
    const { idWorkers } = await req.json();

    if (!idWorkers) {
      return NextResponse.json({ error: "Se requiere el ID del empleado." }, { status: 400 });
    }

    await db.query("DELETE FROM workers WHERE idWorkers = ?", [idWorkers]);

    return NextResponse.json({ message: "Empleado eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
    return NextResponse.json({ error: "Error al eliminar empleado" }, { status: 500 });
  }
}
