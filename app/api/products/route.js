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
      SELECT p.*, c.nameClients 
      FROM products p
      JOIN clients c ON p.idClients = c.idClients
      ORDER BY p.nameProducts ASC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}

// Crear un nuevo producto
export async function POST(req) {
  try {
    const { nameProducts, idClients } = await req.json();

    // Validación de campos obligatorios
    if (!nameProducts || !idClients) {
      return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
    }

    const [result] = await db.query(
        "INSERT INTO products (nameProducts, idClients) VALUES (UPPER(?), ?)", 
      [nameProducts, idClients]
    );

    return NextResponse.json({ idProducts: result.insertId }); // Cambié 'id' por 'idProducts'
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 });
  }
}

// Actualizar un producto existente
export async function PUT(req) {
  try {
    const { idProducts, nameProducts, idClients } = await req.json();

    // Validación de campos obligatorios
    if (!idProducts || !nameProducts || !idClients) {
      return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
    }

    await db.query(
      "UPDATE products SET nameProducts = UPPER(?), idClients = ? WHERE idProducts = ?",
      [nameProducts, idClients, idProducts]
    );

    return NextResponse.json({ message: "Producto actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 });
  }
}

// Eliminar un producto
export async function DELETE(req) {
  try {
    const { idProducts } = await req.json();

    if (!idProducts) {
      return NextResponse.json({ error: "Se requiere el ID del producto." }, { status: 400 });
    }

    await db.query("DELETE FROM products WHERE idProducts = ?", [idProducts]);

    return NextResponse.json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 });
  }
}
