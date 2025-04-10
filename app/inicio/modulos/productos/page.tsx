"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaTrashAlt, FaPlusCircle, FaPen, FaSearch } from "react-icons/fa";
import Image from "next/image";

interface Product {
  idProducts: number;
  nameProducts: string;
  idClients: number; 
}

interface Client {
  idClients: number;
  nameClients: string;
}

export default function Inicio() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>(""); 
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]); 
  const [newProduct, setNewProduct] = useState({ nameProducts: "", idClients: 0 }); 
  const [editProduct, setEditProduct] = useState<Product | null>(null); 
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [productToDelete, setProductToDelete] = useState<number | null>(null); 
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

  const filteredProducts = products.filter(product =>
    product.nameProducts.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error al cargar productos:", error));

    fetch("/api/clients")  
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((error) => console.error("Error al cargar clientes:", error));
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const addProduct = async () => {
    try {
      console.log("Enviando datos:", newProduct); 

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      console.log("Respuesta recibida:", res); 

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const data = await res.json(); 

      console.log("Datos recibidos del servidor:", data);

      if (data.idProducts) {
        setProducts([...products, { idProducts: data.idProducts, ...newProduct }]);
        setNewProduct({ nameProducts: "", idClients: 0 }); 
        showNotification("Material agregado correctamente");
      } else {
        console.error("Error al agregar material: No se recibió idProducts");
        showNotification("Hubo un error al agregar el material");
      }
    } catch (error) {
      console.error("Error al agregar material:", error);
      showNotification("Error al agregar el material");
    }
  };

  const deleteProduct = async () => {
    if (productToDelete === null) return;

    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idProducts: productToDelete }),
      });

      const data = await res.json();
      if (data.message) {
        setProducts(products.filter((product) => product.idProducts !== productToDelete));
        setShowDeleteModal(false); 
        showNotification("Material eliminado correctamente");
      } else {
        console.error("Error al eliminar material:", data.error);
      }
    } catch (error) {
      console.error("Error al eliminar material:", error);
    }
  };

  const updateProduct = async () => {
    if (editProduct) {
      try {
        const res = await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editProduct),
        });

        const data = await res.json();
        if (data.message) {
          setProducts(
            products.map((product) =>
              product.idProducts === editProduct.idProducts ? editProduct : product
            )
          );
          setShowEditModal(false); 
          setEditProduct(null); 
          showNotification("Material actualizado correctamente");
        } else {
          console.error("Error al actualizar material:", data.error);
        }
      } catch (error) {
        console.error("Error al actualizar material:", error);
      }
    }
  };

  const handleEditClick = (product: Product) => {
    setEditProduct(product);
    setShowEditModal(true); 
  };

  const handleDeleteClick = (productId: number) => {
    setProductToDelete(productId);
    setShowDeleteModal(true); 
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditProduct(null);
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

        {/* Contenido de productos */}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Materiales de Recolección</h1>

          {/* Formulario Agregar Producto */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Agregar Material</h2>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Nombre del Material"
                value={newProduct.nameProducts}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, nameProducts: e.target.value })
                }
                className="w-1/2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
              />
              <select
                value={newProduct.idClients}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, idClients: Number(e.target.value) })
                }
                className="w-1/2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
              >
                <option value="0">Seleccionar Empresa</option>
                {clients.map((client) => (
                  <option key={client.idClients} value={client.idClients}>
                    {client.nameClients}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={addProduct}
              className="bg-green-500 text-white font-semibold p-3 rounded-lg hover:bg-green-600 transition duration-300 flex items-center gap-2"
            >
              <FaPlusCircle /> Agregar Material
            </button>
          </div>

          {/* Barra de Búsqueda */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Buscar material por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-500" />
          </div>

          {/* Tabla de Productos */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Lista de Materiales</h2>
            <table className="min-w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left text-gray-600">Nombre</th>
                  <th className="p-3 text-left text-gray-600">Empresa</th>
                  <th className="p-3 text-left text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.idProducts} className="border-b hover:bg-gray-100">
                    <td className="p-3 text-gray-700 border break-words max-w-xs">{product.nameProducts}</td>
                    <td className="p-3 text-gray-700 border break-words max-w-xs">{clients.find(client => client.idClients === product.idClients)?.nameClients}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center gap-2"
                        >
                          <FaPen /> Actualizar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product.idProducts)}
                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-300 flex items-center gap-2"
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
                  ¿Estás seguro de eliminar este material?
                </h2>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={closeDeleteModal}
                    className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={deleteProduct}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-300"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de actualización */}
          {showEditModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Actualizar Material</h2>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Nombre del Material"
                    value={editProduct?.nameProducts || ""}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct!,
                        nameProducts: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                  />
                </div>
                <div className="mb-4">
                  <select
                    value={editProduct?.idClients || 0}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct!,
                        idClients: Number(e.target.value),
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                  >
                    <option value="0">Seleccionar Empresa</option>
                    {clients.map((client) => (
                      <option key={client.idClients} value={client.idClients}>
                        {client.nameClients}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={closeEditModal}
                    className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={updateProduct}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    Actualizar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notificación */}
          {notification && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                bg-gray-100 text-gray-800 p-4 rounded-lg shadow-lg border border-gray-300
                flex items-center gap-3 text-lg font-semibold animate-fadeIn">
              {notification}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
