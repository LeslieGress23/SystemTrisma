import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Lesliegre9',
  database: process.env.DB_NAME || 'erptrisma'
});

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idSalida = searchParams.get('idSalida');
    const idItem = searchParams.get('idItem');

    if (!idSalida || !idItem) {
      return NextResponse.json(
        { error: 'Se requieren ambos parámetros: idSalida e idItem' },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();

    try {
      const [checkResults] = await connection.query(
        `SELECT 
          dp.idProducts IS NOT NULL AS isProduct,
          dm.idMaintenance IS NOT NULL AS isMaintenance,
          dd.idDestruction IS NOT NULL AS isDestruction
        FROM 
          departures d
        LEFT JOIN departure_products dp ON d.idSalida = dp.idSalida AND dp.idProducts = ?
        LEFT JOIN departure_maintenance dm ON d.idSalida = dm.idSalida AND dm.idMaintenance = ?
        LEFT JOIN departure_destruction dd ON d.idSalida = dd.idSalida AND dd.idDestruction = ?
        WHERE d.idSalida = ?`,
        [idItem, idItem, idItem, idSalida]
      );

      if (checkResults.length === 0) {
        return NextResponse.json(
          { error: 'No se encontró el registro especificado' },
          { status: 404 }
        );
      }

      const { isProduct, isMaintenance, isDestruction } = checkResults[0];
      let tableName, idField, query;

      if (isProduct) {
        tableName = 'departure_products';
        idField = 'idProducts';
      } else if (isMaintenance) {
        tableName = 'departure_maintenance';
        idField = 'idMaintenance';
      } else if (isDestruction) {
        tableName = 'departure_destruction';
        idField = 'idDestruction';
      } else {
        return NextResponse.json(
          { error: 'Tipo de item no reconocido' },
          { status: 400 }
        );
      }

      const [result] = await connection.query(
        `DELETE FROM ${tableName} WHERE idSalida = ? AND ${idField} = ?`,
        [idSalida, idItem]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { error: 'No se encontró el item para eliminar' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, message: 'Item eliminado correctamente' },
        { status: 200 }
      );

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error al eliminar el item:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}