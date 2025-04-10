import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Lesliegre9",
  database: "erptrisma"
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: "Se requiere el ID del cliente" },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        id AS id_item,
        name AS nombre_item,
        type AS tipo_item
      FROM (
        SELECT 
          p.idProducts AS id,
          p.nameProducts AS name,
          'product' AS type
        FROM Clients c 
        JOIN Products p ON c.idClients = p.idClients
        WHERE c.idClients = ?
        
        UNION ALL
        
        SELECT 
          m.idMaintenance AS id,
          m.nameMaintenance AS name,
          'maintenance' AS type
        FROM Clients c 
        JOIN Maintenance m ON c.idClients = m.idClients
        WHERE c.idClients = ?
        
        UNION ALL
        
        SELECT 
          d.idDestruction AS id,
          d.nameDestruction AS name,
          'destruction' AS type
        FROM Clients c 
        JOIN Destruction d ON c.idClients = d.idClients
        WHERE c.idClients = ?
      ) AS combined_items
      ORDER BY nombre_item;
    `;

    const [rows] = await db.query(query, [clientId, clientId, clientId]);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error en GET /api/items:", error);
    return NextResponse.json(
      { 
        error: "Error al obtener los items", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}