"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Salida() {
  const router = useRouter();

  const obtenerFechaLocal = () => {
    const now = new Date();
    const año = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    const día = String(now.getDate()).padStart(2, "0");
    const horas = String(now.getHours()).padStart(2, "0");
    const minutos = String(now.getMinutes()).padStart(2, "0");
    const segundos = String(now.getSeconds()).padStart(2, "0");
    return `${año}-${mes}-${día} ${horas}:${minutos}:${segundos}`;
  };

  const [formData, setFormData] = useState({
    idOperador: "",
    idUnidad: "",
    idEmpresa: "",
    fechaSalida: obtenerFechaLocal(),
    idServicio: "",
  });
  const [idDeparture, setIdDeparture] = useState(null); 
  const [operadores, setOperadores] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [operadoresRes, unidadesRes, empresasRes, serviciosRes] = await Promise.all([
          fetch("/api/workers").then(res => res.json()),
          fetch("/api/vehicles").then(res => res.json()),
          fetch("/api/clients").then(res => res.json()),
          fetch("/api/services").then(res => res.json())
        ]);

        setOperadores(operadoresRes);
        setUnidades(unidadesRes);
        setEmpresas(empresasRes);
        setServicios(serviciosRes);
      } catch (err) {
        setError("Error al cargar los datos iniciales");
        console.error("Error cargando datos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.idOperador || !formData.idUnidad || !formData.idEmpresa || !formData.idServicio) {
      setError("Todos los campos son requeridos");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/salidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idOperador: Number(formData.idOperador),
          idUnidad: Number(formData.idUnidad),
          idEmpresa: Number(formData.idEmpresa),
          fechaSalida: formData.fechaSalida,
          idServicio: Number(formData.idServicio)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar la salida");
      }

      setIdDeparture(data.idDeparture); 
      setModalVisible(true);
      setFormData({
        idOperador: "",
        idUnidad: "",
        idEmpresa: "",
        fechaSalida: obtenerFechaLocal(),
        idServicio: "",
      });
    } catch (err) {
      setError(err.message || "Error desconocido");
      console.error("Error al registrar salida:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between bg-white shadow-md p-4">
        <div className="flex items-center">
          <img src="/logotrisma.jpg" alt="Logo Trisma" className="h-16 mr-4" />
          <span className="text-2xl font-bold text-[#92D050]">Trisma</span>
        </div>
        <button 
          onClick={() => router.push("/iniciotrabajadores")} 
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Regresar a Inicio
        </button>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="p-6 bg-white shadow-md rounded-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Registro de Salidas</h1>
          <p className="text-lg text-gray-600 mb-4">
            Ingresa los siguientes datos para el registro de la salida
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <select
              name="idOperador"
              value={formData.idOperador}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050] disabled:opacity-50"
            >
              <option value="">Seleccione un operador</option>
              {operadores.map((op) => (
                <option key={op.idWorkers} value={op.idWorkers}>
                  {op.nameWorkers}
                </option>
              ))}
            </select>

            <select
              name="idUnidad"
              value={formData.idUnidad}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050] disabled:opacity-50"
            >
              <option value="">Seleccione una unidad</option>
              {unidades.map((uni) => (
                <option key={uni.idVehicles} value={uni.idVehicles}>
                  {uni.nameVehicles} - {uni.numberPlate}
                </option>
              ))}
            </select>

            <select
              name="idEmpresa"
              value={formData.idEmpresa}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050] disabled:opacity-50"
            >
              <option value="">Seleccione una empresa</option>
              {empresas.map((emp) => (
                <option key={emp.idClients} value={emp.idClients}>
                  {emp.nameClients}
                </option>
              ))}
            </select>

            <select
              name="idServicio"
              value={formData.idServicio}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050] disabled:opacity-50"
            >
              <option value="">Seleccione el tipo de servicio</option>
              {servicios.map((ser) => (
                <option key={ser.idService} value={ser.idService}>
                  {ser.nameService}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
            >
              {isLoading ? (
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              ) : (
                "Registrar Salida"
              )}
            </button>
          </form>
        </div>
      </main>

      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Salida Registrada</h2>
            <p className="text-gray-600">El registro se ha creado correctamente.</p>
            <p className="text-gray-700 font-semibold mt-2">ID de Salida: {idDeparture}</p>
            <div className="mt-4 flex justify-center gap-4">
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-800 text-white py-4 text-center mt-auto">
        <p className="text-sm">&copy; 2025 Trisma Reciclaje - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}