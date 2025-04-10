import mysql from "mysql2/promise";
import { NextResponse } from "next/server";

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Lesliegre9",
    database: "erptrisma",
});

export async function GET(request) {
    try {
        const { pathname } = new URL(request.url);
        
        const routes = {
            "/api/workers": "SELECT idWorkers AS id, nameWorkers FROM workers",
            "/api/unidades": "SELECT idVehicles AS id, nameVehicles FROM vehicles",
            "/api/clients": "SELECT idClients AS id, nameClients FROM clients",
            "/api/products": "SELECT idProducts AS id, nameProducts FROM products",
            "/api/um": "SELECT idUM AS id, descriptionUM FROM um"
        };

        if (routes[pathname]) {
            const [rows] = await db.query(routes[pathname]);
            return NextResponse.json(rows);
        }

        return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });

    } catch (error) {
        console.error("Error en GET /api:", error);
        return NextResponse.json({ error: "Error al obtener los datos", details: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { operador, unidad, empresa, producto, unidadMedida } = await request.json();
        const fechaSalida = new Date().toISOString().slice(0, 19).replace("T", " ");

        await db.query(
            "INSERT INTO departures (idWorkers, idVehicles, idClients, idProducts, idUM, fechaSalida) VALUES (?, ?, ?, ?, ?, ?)",
            [operador, unidad, empresa, producto, unidadMedida, fechaSalida]
        );

        return NextResponse.json({ message: "Salida registrada con éxito" });

    } catch (error) {
        console.error("Error en POST /api:", error);
        return NextResponse.json({ error: "Error al registrar la salida", details: error.message }, { status: 500 });
    }
}
