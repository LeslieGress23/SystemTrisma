import mysql from "mysql2/promise";

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Lesliegre9",
  database: "erptrisma",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

export async function POST(request) {
  let connection;
  try {
    const { idOperador, idUnidad, idEmpresa, fechaSalida, idServicio } = await request.json();

    if (!idOperador || !idUnidad || !idEmpresa || !fechaSalida || !idServicio) {
      return new Response(JSON.stringify({ 
        message: "Todos los campos son requeridos" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    connection = await pool.getConnection();

    const [operador] = await connection.query(
      "SELECT idWorkers FROM workers WHERE idWorkers = ?",
      [idOperador]
    );
    if (operador.length === 0) {
      return new Response(JSON.stringify({ 
        message: "Operador no encontrado" 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const [unidad] = await connection.query(
      "SELECT idVehicles FROM vehicles WHERE idVehicles = ?",
      [idUnidad]
    );
    if (unidad.length === 0) {
      return new Response(JSON.stringify({ 
        message: "Unidad no encontrada" 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const [empresa] = await connection.query(
      "SELECT idClients FROM clients WHERE idClients = ?",
      [idEmpresa]
    );
    if (empresa.length === 0) {
      return new Response(JSON.stringify({ 
        message: "Empresa no encontrada" 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const [servicio] = await connection.query(
      "SELECT idService FROM services WHERE idService = ?",
      [idServicio]
    );
    if (servicio.length === 0) {
      return new Response(JSON.stringify({ 
        message: "Servicio no encontrado" 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    await connection.query(
      "INSERT INTO departures (idWorkers, idVehicles, idClients, fechaSalida, idService) VALUES (?, ?, ?, ?, ?)",
      [idOperador, idUnidad, idEmpresa, fechaSalida, idServicio]
    );

    const [lastInsert] = await connection.query(
      "SELECT idSalida FROM departures ORDER BY idSalida DESC LIMIT 1"
    );

    if (lastInsert.length === 0) {
      throw new Error("No se pudo obtener el ID del registro insertado");
    }

    const idDeparture = lastInsert[0].idDeparture;

    return new Response(JSON.stringify({
      message: "Salida registrada correctamente",
      idDeparture: idDeparture
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error en el servidor:", error);
    return new Response(JSON.stringify({ 
      message: error.message || "Error interno del servidor" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  } finally {
    if (connection) connection.release();
  }
}

export const dynamic = "force-dynamic";