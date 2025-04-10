"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaTrashAlt, FaPen, FaEye, FaPlusCircle } from "react-icons/fa";
import Image from "next/image";

interface Worker {
    idWorkers: number;
    nameWorkers: string;
    phoneWorkers: string;
    adressWorkers: string;
    positionWorkers: string;
}

export default function Inicio() {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false); 
    const [showEditModal, setShowEditModal] = useState(false); 
    const [editWorkers, setEditWorkers] = useState<Worker | null>(null); 
    const [workersToDelete, setworkersToDelete] = useState<number | null>(null); 
    const [notification, setNotification] = useState<string | null>(null);
    const [newWorkers, setNewWorkers] = useState({ 
        nameWorkers: "", 
        phoneWorkers: "", 
        adressWorkers: "", 
        positionWorkers: "" 
    });
    
    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleLogout = () => {
      console.log("Botón de cerrar sesión presionado.");
  
      localStorage.removeItem("authToken"); 
      sessionStorage.clear(); 
      document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; 
  
      window.location.href = "/";
    };

    const navigateTo = (path: string) => {
        router.push(`/inicio/modulos/${path}`);
    };

    const handleCreate = () => {
        setShowForm(true);
        setShowTable(false);
    };

    const handleRead = () => {
        setShowTable(true);
        setShowForm(false);
    };

    useEffect(() => {
        fetch("/api/workers")
            .then((res) => res.json())
            .then((data) => setWorkers(data))
            .catch((error) => console.error("Error al cargar empleados:", error));
    }, []);

    const addWorkers = async () => {
        try {
            const res = await fetch("/api/workers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newWorkers),
            });

            const data = await res.json();
            if (data?.id) {
                setWorkers([...workers, { idWorkers: data.id, ...newWorkers }]);
                setNewWorkers({ nameWorkers: "", phoneWorkers: "", adressWorkers: "", positionWorkers: "" });
                showNotification("Empleado agregado correctamente");
            } else {
                console.error("Error al agregar empleado:", data.error);
            }
        } catch (error) {
            console.error("Error al agregar empleado:", error);
        }
    };

  const updateWorkers = async () => {
    if (editWorkers) {
      try {
        const res = await fetch("/api/workers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editWorkers),
        });

        const data = await res.json();
        if (data.message) {
          setWorkers(
            workers.map((Worker) =>
              Worker.idWorkers === editWorkers.idWorkers ? editWorkers : Worker
            )
          );
          setShowEditModal(false); 
          setEditWorkers(null); 
          showNotification("Empleado actualizado correctamente");
        } else {
          console.error("Error al actualizar empleado:", data.error);
        }
      } catch (error) {
        console.error("Error al actualizar empleado:", error);
      }
    }
  };
  const deleteWorkers = async () => {
    if (workersToDelete === null) return;

    try {
      const res = await fetch("/api/workers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idWorkers: workersToDelete }),
      });

      const data = await res.json();
      if (data.message) {
        setWorkers(workers.filter((Worker) => Worker.idWorkers !== workersToDelete));
        setShowDeleteModal(false); 
        showNotification("Empleado eliminado correctamente");
      } else {
        console.error("Error al eliminar empleado:", data.error);
      }
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
    }
  };


  const handleEditClick = (product: Worker) => {
    setEditWorkers(product);
    setShowEditModal(true); 
  };

  const handleDeleteClick = (productId: number) => {
    setworkersToDelete(productId);
    setShowDeleteModal(true); 
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setworkersToDelete(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditWorkers(null);
  };
    return (
        <div className="flex h-screen">
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

            <div className="flex-1 ml-64 overflow-y-auto">
                <header className="flex items-center justify-between bg-white shadow-md p-4">
                    <div className="flex items-center">
<Image src="/logotrisma.jpg" alt="Logo Trisma" width={64} height={64} className="h-16 mr-4" />
                        <span className="text-2xl font-bold text-[#92D050]">Trisma ERP</span>
                    </div>
                    <button onClick={handleLogout} className="bg-red-500 text-white font-semibold p-2 rounded-lg hover:bg-red-600 transition duration-300">
                        Cerrar sesión
                    </button>
                </header>

                <div className="p-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Recursos Humanos</h1>
                    
                    <div className="flex justify-center space-x-4">
                        <button onClick={handleCreate}               className="bg-green-500 text-white font-semibold p-3 rounded-lg hover:bg-green-600 transition duration-300 flex items-center gap-2"
                        >
                            <FaPlusCircle/> Agregar Empleado
                        </button>
                        <button onClick={handleRead}               className="bg-yellow-500 text-white font-semibold p-3 rounded-lg hover:bg-yellow-600 transition duration-300 flex items-center gap-2"
                        >
                            <FaEye /> Ver Empleados
                        </button>
                    </div>

                    {showForm && (
                        <form 
                            className="mt-8 space-y-6 max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200"
                            onSubmit={(e) => {
                                e.preventDefault();
                                addWorkers();
                            }}
                        >
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Agregar Nuevo Empleado</h2>
                            <input type="text" placeholder="Nombre completo" value={newWorkers.nameWorkers} onChange={(e) => setNewWorkers({ ...newWorkers, nameWorkers: e.target.value })} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]" required />
                            <input type="text" placeholder="Teléfono" value={newWorkers.phoneWorkers} onChange={(e) => setNewWorkers({ ...newWorkers, phoneWorkers: e.target.value })} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]" required />
                            <input type="text" placeholder="Dirección" value={newWorkers.adressWorkers} onChange={(e) => setNewWorkers({ ...newWorkers, adressWorkers: e.target.value })} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]" required />
                            <input type="text" placeholder="Cargo" value={newWorkers.positionWorkers} onChange={(e) => setNewWorkers({ ...newWorkers, positionWorkers: e.target.value })} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]" required />
                            <button type="submit"               className="bg-blue-500 text-white font-semibold p-3 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center gap-2"
                            >Agregar Empleado   {notification && (
  <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
      bg-gray-100 text-gray-800 p-4 rounded-lg shadow-lg border border-gray-300
      flex items-center gap-3 text-lg font-semibold animate-fadeIn">
    {notification}
  </div>
)}</button>
                        </form>
                    )}

{showTable && (
        <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Lista de Empleados</h2>
            <table className="min-w-full table-auto">
                <thead>
                    <tr className="border-b">
                        <th className="p-4 text-left text-gray-600">Nombre</th>
                        <th className="p-4 text-left text-gray-600">Teléfono</th>
                        <th className="p-4 text-left text-gray-600">Dirección</th>
                        <th className="p-4 text-left text-gray-600">Cargo</th>
                        <th className="p-4 text-left text-gray-600">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {workers.map((worker, index) => (
                        <tr key={worker.idWorkers || index} className="border-b">
                            <td className="p-3 text-gray-700 border break-words max-w-xs">{worker.nameWorkers}</td>
                            <td className="p-3 text-gray-700 border break-words max-w-xs">{worker.phoneWorkers}</td>
                            <td className="p-3 text-gray-700 border break-words max-w-xs">{worker.adressWorkers}</td>
                            <td className="p-3 text-gray-700 border break-words max-w-xs">{worker.positionWorkers}</td>
                            <td className="p-3">
                                <div className="flex items-center gap-4 mt-2">
                                    <button 
                                        onClick={() => handleEditClick(worker)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center gap-2">
                                        <FaPen /> Actualizar
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(worker.idWorkers)}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 flex items-center gap-2">
                                        <FaTrashAlt /> Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
                        </div>
                        
                    )}
                    
          {/* Modal de actualización */}
          {showEditModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Actualizar Empleado</h2>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={editWorkers?.nameWorkers || ""}
                    onChange={(e) =>
                      setEditWorkers({
                        ...editWorkers!,
                        nameWorkers: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                  />
                  </div>
                  <div className="mb-4">
                <input
                    type="text"
                    placeholder="Teléfono"
                    value={editWorkers?.phoneWorkers || ""}
                    onChange={(e) =>
                      setEditWorkers({
                        ...editWorkers!,
                        phoneWorkers: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                  />
                  </div>
                  <div className="mb-4">
                   <input
                    type="text"
                    placeholder="Dirección"
                    value={editWorkers?.adressWorkers || ""}
                    onChange={(e) =>
                      setEditWorkers({
                        ...editWorkers!,
                        adressWorkers: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                  />
                  </div>
                  <div className="mb-4">
                   <input
                    type="text"
                    placeholder="Cargo"
                    value={editWorkers?.positionWorkers || ""}
                    onChange={(e) =>
                      setEditWorkers({
                        ...editWorkers!,
                        positionWorkers: e.target.value,
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
                    onClick={updateWorkers}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    Actualizar
                    
                  </button>
                </div>
              </div>
            </div>
          )}
                     {/* Modal de confirmación de eliminación */}
          {showDeleteModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  ¿Estás seguro de eliminar este empleado?
                </h2>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={closeDeleteModal}
                    className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={deleteWorkers}
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
                </div>
                
            </div>
        </div>
    );
}
