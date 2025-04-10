"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaTrashAlt, FaPlusCircle, FaPen, FaSearch } from "react-icons/fa";
import Image from "next/image";

interface Vehicle {
  idVehicles: number;
  nameVehicles: string;
  numberPlate: string;
}

export default function Inicio() {
  const router = useRouter();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(""); // Estado para búsqueda
  const [newVehicle, setNewVehicle] = useState({ nameVehicles: "", numberPlate: "" });
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null); // Para el cliente que se está editando
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Estado para controlar la visibilidad del modal de eliminación
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null); // Para saber qué cliente eliminar
  const [showEditModal, setShowEditModal] = useState(false); // Estado para controlar la visibilidad del modal de edición
  const [notification, setNotification] = useState<string | null>(null);

  const handleLogout = () => {
    console.log("Botón de cerrar sesión presionado.");

    localStorage.removeItem("authToken"); 
    sessionStorage.clear(); 
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // Borrar una cookie si la estás utilizando

    window.location.href = "/";
  };

  const navigateTo = (path: string) => {
    router.push(`/inicio/modulos/${path}`);
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.nameVehicles.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetch("/api/vehicles")
      .then((res) => res.json())
      .then((data) => setVehicles(data))
      .catch((error) => console.error("Error al cargar vehículo:", error));
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Agregar un nuevo cliente
  const addVehicle = async () => {
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVehicle),
      });

      const data = await res.json();
      if (data.id) {
        setVehicles([...vehicles, { idVehicles: data.id, ...newVehicle }]);
        setNewVehicle({ nameVehicles: "", numberPlate: "" });
        showNotification("Vehículo agregado correctamente");

      } else {
        console.error("Error al agregar vehículo:", data.error);
      }
    } catch (error) {
      console.error("Error al agregar vehículo:", error);
    }
  };

  // Eliminar un vehículo
  const deleteVehicle = async () => {
    if (vehicleToDelete === null) return;

    try {
      const res = await fetch("/api/vehicles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idVehicles: vehicleToDelete }),
      });

      const data = await res.json();
      if (data.message) {
        setVehicles(vehicles.filter((vehicle) => vehicle.idVehicles !== vehicleToDelete));
        setShowDeleteModal(false); 
        showNotification("Vehículo eliminado correctamente");
      } else {
        console.error("Error al eliminar vehículo:", data.error);
      }
    } catch (error) {
      console.error("Error al eliminar vehícle:", error);
    }
  };

  const updateVehicle = async () => {
    if (editVehicle) {
      try {
        const res = await fetch("/api/vehicles", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editVehicle),
        });

        const data = await res.json();
        if (data.message) {
          setVehicles(
            vehicles.map((vehicle) =>
              vehicle.idVehicles === editVehicle.idVehicles ? editVehicle : vehicle
            )
          );
          setShowEditModal(false); 
          setEditVehicle(null); 
          showNotification("Vehículo actualizado correctamente");

        } else {
          console.error("Error al actualizar vehículo:", data.error);
        }
      } catch (error) {
        console.error("Error al actualizar vehículo:", error);
      }
    }
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setEditVehicle(vehicle);
    setShowEditModal(true); 
  };

  const handleDeleteClick = (vehicleId: number) => {
    setVehicleToDelete(vehicleId);
    setShowDeleteModal(true); 
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setVehicleToDelete(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditVehicle(null);
  };

  return (
    <div className="flex h-screen">
      {/* Menú lateral - Estático */}
      <div className="w-64 bg-gray-800 text-white fixed top-0 bottom-0 left-0">
        <ul className="mt-8">
          
          <li
            className="p-4 hover:bg-gray-700 cursor-pointer text-xl" 
            onClick={() => navigateTo("clientes")}
          >
            Clientes
          </li>
          <li
            className="p-4 hover:bg-gray-700 cursor-pointer text-xl"
            onClick={() => navigateTo("productos")}
          >
            Materiales
          </li>
          <li
            className="p-4 hover:bg-gray-700 cursor-pointer text-xl"
            onClick={() => navigateTo("mantenimiento")}
          >
            Servicios de Mantenimiento
          </li>
          <li
            className="p-4 hover:bg-gray-700 cursor-pointer text-xl"
            onClick={() => navigateTo("destruccion")}
          >
            Servicios de Destrucción
          </li>
          <li
            className="p-4 hover:bg-gray-700 cursor-pointer text-xl"
            onClick={() => navigateTo("vehiculos")}
          >
            Vehiculos
          </li>
        
          <li
            className="p-4 hover:bg-gray-700 cursor-pointer text-xl"
            onClick={() => navigateTo("recursosHumanos")}
          >
            Recursos Humanos
          </li>
          <li
            className="p-4 hover:bg-gray-700 cursor-pointer text-xl"
            onClick={() => navigateTo("reportes")}
          >
            Reportes
          </li>
          <li
            className="p-4 hover:bg-gray-700 cursor-pointer text-xl"
            onClick={() => navigateTo("accesos")}
          >
            Accesos
          </li>
          
        </ul>
      </div>

      {/* Contenido principal - Se ajusta a la derecha del menú lateral */}
      <div className="flex-1 ml-64 overflow-y-auto">
        {/* Encabezado */}
        <header className="flex items-center justify-between bg-white shadow-md p-4">
          <div className="flex items-center">
<Image src="/logotrisma.jpg" alt="Logo Trisma" width={64} height={64} className="h-16 mr-4" />
            <span className="text-2xl font-bold text-[#92D050]">Trisma ERP</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white font-semibold p-2 rounded-lg hover:bg-red-600 transition duration-300"
          >
            Cerrar sesión
          </button>
        </header>

        {/* Contenido de vehiculos */}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Vehículos</h1>

          {/* Formulario Agregar vehiculo */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Agregar Vehículo</h2>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Nombre del vehículo"
                value={newVehicle.nameVehicles}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, nameVehicles: e.target.value })
                }
                className="w-1/2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
              />
              <input
                type="text"
                placeholder="Placa"
                value={newVehicle.numberPlate}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, numberPlate: e.target.value })
                }
                className="w-1/2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
              />
            </div>
            <button
              onClick={addVehicle}
              className="bg-green-500 text-white font-semibold p-3 rounded-lg hover:bg-green-600 transition duration-300 flex items-center gap-2"
            >
              <FaPlusCircle /> Agregar Vehículo
               
        {notification && (
  <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
      bg-gray-100 text-gray-800 p-4 rounded-lg shadow-lg border border-gray-300
      flex items-center gap-3 text-lg font-semibold animate-fadeIn">
    {notification}
  </div>
)}

            </button>
          </div>
          {/* Barra de Búsqueda */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Buscar vehículo por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-500" />
          </div>

           {/* Tabla de Clientes */}
           <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Lista de Vehículos</h2>
            <table className="min-w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left text-gray-600">Nombre</th>
                  <th className="p-3 text-left text-gray-600">Placa</th>
                  <th className="p-3 text-left text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
  {filteredVehicles.map((vehicle) => (
    <tr key={vehicle.idVehicles}>
      <td className="p-3 text-gray-700 border break-words max-w-xs">{vehicle.nameVehicles}</td>
      <td className="p-3 text-gray-700 border break-words max-w-xs">{vehicle.numberPlate}</td>
      <td className="p-3 border">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleEditClick(vehicle)}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center gap-2"
          >
            <FaPen /> Actualizar
          </button>
          <button
            onClick={() => handleDeleteClick(vehicle.idVehicles)}
            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-300 flex items-center gap-2 sm:w-auto w-full"
            >
            <FaTrashAlt /> Eliminar
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

            </table>
          </div>

          {/* Modal de confirmación de eliminación */}
          {showDeleteModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  ¿Estás seguro de eliminar este vehículo?
                </h2>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={closeDeleteModal}
                    className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={deleteVehicle}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-300"
                  >
                    Eliminar
                    {notification && (
  <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
      bg-gray-100 text-gray-800 p-4 rounded-lg shadow-lg border border-gray-300
      flex items-center gap-3 text-lg font-semibold animate-fadeIn">
    {notification}
  </div>
)}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de actualización */}
          {showEditModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Actualizar Vehículo</h2>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Nombre del Vehículo"
                    value={editVehicle?.nameVehicles || ""}
                    onChange={(e) =>
                      setEditVehicle({
                        ...editVehicle!,
                        nameVehicles: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Placa"
                    value={editVehicle?.numberPlate || ""}
                    onChange={(e) =>
                      setEditVehicle({
                        ...editVehicle!,
                        numberPlate: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={closeEditModal}
                    className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={updateVehicle}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    Actualizar
                    {notification && (
  <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
      bg-gray-100 text-gray-800 p-4 rounded-lg shadow-lg border border-gray-300
      flex items-center gap-3 text-lg font-semibold animate-fadeIn">
    {notification}
  </div>
)}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
