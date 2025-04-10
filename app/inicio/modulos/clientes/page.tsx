"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaTrashAlt, FaPlusCircle, FaPen, FaSearch } from "react-icons/fa";
import Image from "next/image";

interface Client {
  idClients: number;
  nameClients: string;
  rfcClients: string;
}

export default function Inicio() {
  const router = useRouter();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(""); 
  const [newClient, setNewClient] = useState({ nameClients: "", rfcClients: "" });
  const [editClient, setEditClient] = useState<Client | null>(null); 
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [clientToDelete, setClientToDelete] = useState<number | null>(null); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [notification, setNotification] = useState<string | null>(null);

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

  const filteredClients = clients.filter(client =>
    client.nameClients.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((error) => console.error("Error al cargar clientes:", error));
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const addClient = async () => {
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });

      const data = await res.json();
      if (data.id) {
        setClients([...clients, { idClients: data.id, ...newClient }]);
        setNewClient({ nameClients: "", rfcClients: "" });
        showNotification("Cliente agregado correctamente");

      } else {
        console.error("Error al agregar cliente:", data.error);
      }
    } catch (error) {
      console.error("Error al agregar cliente:", error);
    }
  };

  const deleteClient = async () => {
    if (clientToDelete === null) return;

    try {
      const res = await fetch("/api/clients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idClients: clientToDelete }),
      });

      const data = await res.json();
      if (data.message) {
        setClients(clients.filter((client) => client.idClients !== clientToDelete));
        setShowDeleteModal(false); 
        showNotification("Cliente eliminado correctamente");
      } else {
        console.error("Error al eliminar cliente:", data.error);
      }
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
    }
  };

  const updateClient = async () => {
    if (editClient) {
      try {
        const res = await fetch("/api/clients", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editClient),
        });

        const data = await res.json();
        if (data.message) {
          setClients(
            clients.map((client) =>
              client.idClients === editClient.idClients ? editClient : client
            )
          );
          setShowEditModal(false); 
          setEditClient(null); 
          showNotification("Cliente actualizado correctamente");

        } else {
          console.error("Error al actualizar cliente:", data.error);
        }
      } catch (error) {
        console.error("Error al actualizar cliente:", error);
      }
    }
  };
  
  const handleEditClick = (client: Client) => {
    setEditClient(client);
    setShowEditModal(true); 
  };

  const handleDeleteClick = (clientId: number) => {
    setClientToDelete(clientId);
    setShowDeleteModal(true); 
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setClientToDelete(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditClient(null);
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
          
        </ul>
      </div>

      {/* Contenido principal*/}
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

        {/* Contenido de clientes */}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Clientes</h1>

          {/* Formulario Agregar Cliente */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Agregar Cliente</h2>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Nombre del Cliente"
                required
                value={newClient.nameClients}
                onChange={(e) =>
                  setNewClient({ ...newClient, nameClients: e.target.value })
                }
                className="w-1/2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
              />
              <input
                type="text"
                placeholder="RFC del Cliente"
                required
                value={newClient.rfcClients}
                onChange={(e) =>
                  setNewClient({ ...newClient, rfcClients: e.target.value })
                }
                className="w-1/2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
              />
            </div>
            <button
              onClick={addClient}
              className="bg-green-500 text-white font-semibold p-3 rounded-lg hover:bg-green-600 transition duration-300 flex items-center gap-2"
            >
              <FaPlusCircle /> Agregar Cliente
               
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
              placeholder="Buscar cliente por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-500" />
          </div>

           {/* Tabla de Clientes */}
           <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Lista de Clientes</h2>
            <table className="min-w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left text-gray-600">Nombre</th>
                  <th className="p-3 text-left text-gray-600">RFC</th>
                  <th className="p-3 text-left text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
  {filteredClients.map((client) => (
    <tr key={client.idClients}>
      <td className="p-3 text-gray-700 border break-words max-w-xs">{client.nameClients}</td>
      <td className="p-3 text-gray-700 border break-words max-w-xs">{client.rfcClients}</td>
      <td className="p-3 border">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleEditClick(client)}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center gap-2"
          >
            <FaPen /> Actualizar
          </button>
          <button
            onClick={() => handleDeleteClick(client.idClients)}
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
                  ¿Estás seguro de eliminar este cliente?
                </h2>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={closeDeleteModal}
                    className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={deleteClient}
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
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Actualizar Cliente</h2>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Nombre del Cliente"
                    value={editClient?.nameClients || ""}
                    onChange={(e) =>
                      setEditClient({
                        ...editClient!,
                        nameClients: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="RFC del Cliente"
                    value={editClient?.rfcClients || ""}
                    onChange={(e) =>
                      setEditClient({
                        ...editClient!,
                        rfcClients: e.target.value,
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
                    onClick={updateClient}
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
