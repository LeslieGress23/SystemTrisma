import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Lesliegre9",
  database: "erptrisma",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function getConnection() {
  return pool.getConnection();
}

export async function GET(req) {
  const url = new URL(req.url);
  const idSalida = url.searchParams.get("idSalida");
  const idClients = url.searchParams.get("idClients");
  const productosQuery = url.searchParams.get("productos");
  const serviciosQuery = url.searchParams.get("servicios");
  const destruccionesQuery = url.searchParams.get("destrucciones");

  try {
    const connection = await getConnection();

    if (idSalida) {
      const [clientResult] = await connection.execute(
        "SELECT idClients FROM departures WHERE idSalida = ?",
        [idSalida]
      );

      if (clientResult.length === 0) {
        connection.release();
        return new Response(
          JSON.stringify({ success: false, message: "No se encontró el idSalida" }),
          { status: 404 }
        );
      }

      const { idClients } = clientResult[0];

      const [serviceResult] = await connection.execute(
        `SELECT COALESCE(s.nameService, 'No asignado') AS nameService 
         FROM departures d 
         LEFT JOIN services s ON d.idService = s.idService 
         WHERE d.idSalida = ?`,
        [idSalida]
      );

      const nameService = serviceResult.length > 0 ? serviceResult[0].nameService : 'No asignado';

      connection.release();
      return new Response(
        JSON.stringify({ success: true, idClients, nameService }),
        { status: 200 }
      );
    }

    if (productosQuery && idClients) {
      const [productos] = await connection.execute(
        "SELECT idProducts, nameProducts FROM products WHERE idClients = ?",
        [idClients]
      );
      connection.release();
      return new Response(
        JSON.stringify({ success: true, productos }),
        { status: 200 }
      );
    }

    if (serviciosQuery && idClients) {
      const [servicios] = await connection.execute(
        "SELECT idMaintenance, nameMaintenance FROM maintenance WHERE idClients = ?",
        [idClients]
      );
      connection.release();
      return new Response(
        JSON.stringify({ success: true, servicios }),
        { status: 200 }
      );
    }

    if (destruccionesQuery && idClients) {
      const [destrucciones] = await connection.execute(
        "SELECT idDestruction, nameDestruction FROM destruction WHERE idClients = ?",
        [idClients]
      );
      connection.release();
      return new Response(
        JSON.stringify({ success: true, destrucciones }),
        { status: 200 }
      );
    }
    
    connection.release();
    return new Response(
      JSON.stringify({ success: false, message: "Parámetros inválidos" }),
      { status: 400 }
    );
  } catch (error) {
    console.error("Error en la API:", error.message);
    return new Response(
      JSON.stringify({ success: false, message: "Error en la API" }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  let connection;
  try {
    const body = await req.json();
    console.log("Datos recibidos en el POST:", body);

    const { idSalida, folioSalida, fechaEntrada, fechaServicio, productos, servicios: mantenimientos, destrucciones } = body;

    if (!idSalida || !folioSalida || !fechaEntrada || !fechaServicio) {
      return new Response(
        JSON.stringify({ success: false, message: "Datos incompletos" }),
        { status: 400 }
      );
    }

    connection = await getConnection();
    await connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
    await connection.execute("SET innodb_lock_wait_timeout = 50");
    await connection.beginTransaction();

    const [existingSalida] = await connection.execute(
      "SELECT idSalida FROM departures WHERE idSalida = ? FOR UPDATE", 
      [idSalida]
    );
    
    if (existingSalida.length === 0) {
      await connection.rollback();
      connection.release();
      return new Response(
        JSON.stringify({ success: false, message: "No se encontró el idSalida" }),
        { status: 404 }
      );
    }

    await connection.execute(
      "UPDATE departures SET folioSalida = ?, fechaEntrada = ?, fechaServicio = ? WHERE idSalida = ?",
      [folioSalida, fechaEntrada, fechaServicio, idSalida]
    );

    let productosRegistrados = 0;
    let mantenimientosRegistrados = 0;
    let destruccionesRegistrados = 0;

    if (Array.isArray(productos) && productos.length > 0) {
      for (const producto of productos) {
        const { idProducts, CantidadSalida, UnidadSalida } = producto;

        if (!idProducts || !CantidadSalida || !UnidadSalida) {
          console.warn(`Producto con datos incompletos:`, producto);
          continue;
        }

        await connection.execute(
          "INSERT INTO departure_products (idSalida, idProducts, CantidadSalida, tipoUnidad) VALUES (?, ?, ?, ?)",
          [idSalida, idProducts, CantidadSalida, UnidadSalida]
        );
        productosRegistrados++;
      }
    }

    if (Array.isArray(mantenimientos) && mantenimientos.length > 0) {
      for (const mantenimiento of mantenimientos) {
        const { idMaintenance, CantidadSalida, UnidadSalida } = mantenimiento;

        if (!idMaintenance) {
          console.warn(`Mantenimiento con datos incompletos:`, mantenimiento);
          continue;
        }

        await connection.execute(
          "INSERT INTO departure_maintenance (idSalida, idMaintenance, CantidadSalida, tipoUnidad) VALUES (?, ?, ?, ?)",
          [idSalida, idMaintenance, CantidadSalida, UnidadSalida || "Sin detalles"]
        );
        mantenimientosRegistrados++;
      }
    }

    if (Array.isArray(destrucciones) && destrucciones.length > 0) {
      for (const destruccion of destrucciones) {
        const { idDestruction, CantidadSalida, UnidadSalida } = destruccion;

        if (!idDestruction || !CantidadSalida || !UnidadSalida) {
          console.warn(`Destrucción con datos incompletos:`, destruccion);
          continue;
        }

        await connection.execute(
          "INSERT INTO departure_destruction (idSalida, idDestruction, CantidadSalida, tipoUnidad) VALUES (?, ?, ?, ?)",
          [idSalida, idDestruction, CantidadSalida, UnidadSalida]
        );
        destruccionesRegistrados++;
      }
    }

    if (productosRegistrados === 0 && mantenimientosRegistrados === 0 && destruccionesRegistrados === 0) {
      await connection.rollback();
      connection.release();
      return new Response(
        JSON.stringify({ success: false, message: "No hay datos válidos para registrar." }),
        { status: 400 }
      );
    }

    await connection.commit();
    connection.release();
    return new Response(
      JSON.stringify({
        success: true,
        message: `Entrada registrada correctamente. Productos: ${productosRegistrados}, Servicios: ${mantenimientosRegistrados}, Destrucciones: ${destruccionesRegistrados}`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en la API:", error.message);
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    return new Response(
      JSON.stringify({ success: false, message: "Error en la API" }),
      { status: 500 }
    );
  }
}