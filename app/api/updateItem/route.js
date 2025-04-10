import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Lesliegre9',
  database: process.env.DB_NAME || 'erptrisma',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function PUT(request) {
  try {
    const body = await request.json();
        const { 
      idSalida,
      originalIdItem,
      cantidad,
      tipo_unidad,
      id_item,
      idProducts = null,
      idMaintenance = null,
      idDestruction = null
    } = body;

    if (!idSalida || !originalIdItem || cantidad === undefined || !tipo_unidad || !id_item) {
      return NextResponse.json({
        success: false,
        error: 'Datos incompletos',
        message: 'Faltan campos requeridos para la actualización',
        required_fields: {
          idSalida: 'string',
          originalIdItem: 'string | number',
          cantidad: 'number',
          tipo_unidad: 'string',
          id_item: 'string | number'
        }
      }, { status: 400 });
    }

    let tableName, idFieldName;
    if (idProducts !== null) {
      tableName = 'departure_products';
      idFieldName = 'idProducts';
    } else if (idMaintenance !== null) {
      tableName = 'departure_maintenance';
      idFieldName = 'idMaintenance';
    } else if (idDestruction !== null) {
      tableName = 'departure_destruction';
      idFieldName = 'idDestruction';
    } else {
      return NextResponse.json({
        success: false,
        error: 'Tipo de item no reconocido',
        message: 'No se pudo determinar el tipo de item (producto, mantenimiento o destrucción)'
      }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      const [checkResults] = await connection.query(
        `SELECT * FROM ${tableName} 
         WHERE idSalida = ? AND ${idFieldName} = ?`,
        [idSalida, originalIdItem]
      );

      if (checkResults.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Registro no encontrado',
          message: `No se encontró el registro con ${idFieldName}: ${originalIdItem} en idSalida: ${idSalida}`
        }, { status: 404 });
      }

      const [updateResults] = await connection.query(
        `UPDATE ${tableName} 
         SET CantidadSalida = ?, tipoUnidad = ?, ${idFieldName} = ?
         WHERE idSalida = ? AND ${idFieldName} = ?`,
        [cantidad, tipo_unidad, id_item, idSalida, originalIdItem]
      );

      if (updateResults.affectedRows === 0) {
        return NextResponse.json({
          success: false,
          error: 'Nada que actualizar',
          message: 'Los datos proporcionados son iguales a los existentes o no se pudo actualizar'
        }, { status: 200 }); 
      }

      const [updatedRecord] = await connection.query(
        `SELECT * FROM ${tableName} 
         WHERE idSalida = ? AND ${idFieldName} = ?`,
        [idSalida, id_item]
      );

      return NextResponse.json({
        success: true,
        message: 'Registro actualizado exitosamente',
        table: tableName,
        updatedFields: {
          cantidad,
          tipo_unidad,
          id_item
        },
        record: updatedRecord[0] || null
      });

    } catch (error) {
      console.error('Error durante la operación de base de datos:', error);
      return NextResponse.json({
        success: false,
        error: 'Error en la base de datos',
        message: error.message,
        sqlError: error.code || 'UNKNOWN_ERROR'
      }, { status: 500 });
    } finally {
      if (connection) connection.release();
    }

  } catch (error) {
    console.error('Error general en API updateItem:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}