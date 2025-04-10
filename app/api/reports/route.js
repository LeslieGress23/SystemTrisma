import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Lesliegre9",
  database: "erptrisma",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function GET(req) {
  try {
    const url = new URL(req.url, `http://${req.headers.get("host")}`);
    const idClients = url.searchParams.get("idClients");
    const fechaInicio = url.searchParams.get("fechaInicio");
    const fechaTermino = url.searchParams.get("fechaTermino");
    const idService = url.searchParams.get("idService");

    if (!idClients || !fechaInicio || !fechaTermino || !idService) {
      return NextResponse.json(
        { error: "Faltan parámetros en la consulta" },
        { status: 400 }
      );
    }

    if (isNaN(idClients) || isNaN(idService)) {
      return NextResponse.json(
        { error: "Parámetros inválidos" },
        { status: 400 }
      );
    }

const [rows] = await db.execute(
  `SELECT 
    d.idSalida,
    d.folioSalida,
    c.nameClients AS nombre_cliente,
    v.nameVehicles AS tipo_vehiculo,
    v.numberPlate AS placa,
    s.nameService AS tipo_servicio,
    s.idService AS id_tipo_servicio,
    COALESCE(p.nameProducts, m.nameMaintenance, des.nameDestruction) AS nombre_item,
    COALESCE(p.idProducts, m.idMaintenance, des.idDestruction) AS id_item,
    COALESCE(dp.CantidadSalida, dm.CantidadSalida, dd.CantidadSalida) AS cantidad,
    COALESCE(dp.tipoUnidad, dm.tipoUnidad, dd.tipoUnidad) AS tipo_unidad,
    w.nameWorkers AS nombre_trabajador,
    d.fechaEntrada,
    d.fechaSalida,
    d.fechaServicio,
    CASE
      WHEN dp.idSalida IS NOT NULL THEN 'product'
      WHEN dm.idSalida IS NOT NULL THEN 'maintenance'
      WHEN dd.idSalida IS NOT NULL THEN 'destruction'
    END AS item_type
  FROM departures d
  JOIN clients c ON d.idClients = c.idClients
  JOIN vehicles v ON d.idVehicles = v.idVehicles
  JOIN workers w ON d.idWorkers = w.idWorkers
  JOIN services s ON d.idService = s.idService
  LEFT JOIN departure_products dp ON d.idSalida = dp.idSalida
  LEFT JOIN products p ON dp.idProducts = p.idProducts
  LEFT JOIN departure_maintenance dm ON d.idSalida = dm.idSalida
  LEFT JOIN maintenance m ON dm.idMaintenance = m.idMaintenance
  LEFT JOIN departure_destruction dd ON d.idSalida = dd.idSalida
  LEFT JOIN destruction des ON dd.idDestruction = des.idDestruction
  WHERE d.idClients = ? AND s.idService = ?
  AND DATE(d.fechaSalida) BETWEEN ? AND ?`,
  [idClients, idService, fechaInicio, fechaTermino]
);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron registros para los filtros seleccionados" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows);

  } catch (error) {
    console.error("Error en la consulta:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
