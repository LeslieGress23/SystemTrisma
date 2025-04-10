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
    const [rows] = await db.query("SELECT * FROM `vehicles` ORDER BY `nameVehicles` ASC");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    return NextResponse.json(
      { error: "Error al obtener vehículos" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { nameVehicles, numberPlate } = await req.json();
    if (!nameVehicles || !numberPlate) {
      return NextResponse.json(
        { error: "Por favor, proporciona nombre y placa." },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      "INSERT INTO vehicles (nameVehicles, numberPlate) VALUES (UPPER(?), UPPER(?))",
      [nameVehicles, numberPlate]
    );

    return NextResponse.json({
      message: "Vehículo creado exitosamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear vehículo:", error);
    return NextResponse.json(
      { error: "Error al crear vehículo" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const { idVehicles, nameVehicles, numberPlate } = await req.json();
    
    if (!idVehicles || !nameVehicles || !numberPlate) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    await db.query(
      "UPDATE vehicles SET nameVehicles = UPPER(?), numberPlate = UPPER(?) WHERE idVehicles = ?",
      [nameVehicles, numberPlate, idVehicles]
    );

    return NextResponse.json({ message: "Vehículo actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar vehículo:", error);
    return NextResponse.json(
      { error: "Error al actualizar vehículo" },
      { status: 500 }
    );
  }
}


// Eliminar un vehiculo (DELETE)
export async function DELETE(req) {
  try {
    const { idVehicles } = await req.json();
    if (!idVehicles) {
      return NextResponse.json(
        { error: "Se requiere el ID del cliente." },
        { status: 400 }
      );
    }

    await db.query("DELETE FROM vehicles WHERE idVehicles = ?", [idVehicles]);
    return NextResponse.json({ message: "Vehículo eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar vehículo:", error);
    return NextResponse.json(
      { error: "Error al eliminar vehículo" },
      { status: 500 }
    );
  }
}