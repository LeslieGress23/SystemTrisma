"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Entrada() {
  const router = useRouter();

  const obtenerFechaHoraLocal = () => {
    const now = new Date();
    const año = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    const día = String(now.getDate()).padStart(2, "0");
    const horas = String(now.getHours()).padStart(2, "0");
    const minutos = String(now.getMinutes()).padStart(2, "0");
    const segundos = String(now.getSeconds()).padStart(2, "0");
    return `${año}-${mes}-${día} ${horas}:${minutos}:${segundos}`;
  };

  const obtenerFechaActual = () => {
    const now = new Date();
    const año = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    const día = String(now.getDate()).padStart(2, "0");
    return `${año}-${mes}-${día}`;
  };

  const [formData, setFormData] = useState({
    idSalida: "",
    folio: "",
    fechaEntrada: obtenerFechaHoraLocal(),
    fechaServicio: obtenerFechaActual(),
    productos: [],
    servicios: [],
    destrucciones: [],
    unidades: [],
    cantidades: [],
  });

  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [destruccionesDisponibles, setDestruccionesDisponibles] = useState([]);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [nameService, setNameService] = useState("No asignado");
  const [idClients, setIdClients] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!formData.idSalida) return;
    fetch(`/api/entradas?idSalida=${formData.idSalida}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIdClients(data.idClients);
          setNameService(data.nameService);
        } else {
          setNameService("No asignado");
        }
      });
  }, [formData.idSalida]);

  useEffect(() => {
    if (!idClients) return;
    fetch(`/api/entradas?productos=true&idClients=${idClients}`)
      .then((res) => res.json())
      .then((data) => {
        const productosOrdenados = (data.productos || []).sort((a, b) =>
          a.nameProducts.localeCompare(b.nameProducts)
        );
        setProductosDisponibles(productosOrdenados);
      });
  }, [idClients]);

  useEffect(() => {
    if (!idClients) return;
    fetch(`/api/entradas?servicios=true&idClients=${idClients}`)
      .then((res) => res.json())
      .then((data) => setServiciosDisponibles(data.servicios || []));
  }, [idClients]);
  
  useEffect(() => {
    if (!idClients) return;
    fetch(`/api/entradas?destrucciones=true&idClients=${idClients}`)
      .then((res) => res.json())
      .then((data) => setDestruccionesDisponibles(data.destrucciones || []));
  }, [idClients]);

  const handleServicioSeleccionado = (servicio) => {
    setFormData((prevData) => {
      const serviciosSeleccionados = prevData.servicios.some((s) => s.idMaintenance === servicio.idMaintenance)
        ? prevData.servicios.filter((s) => s.idMaintenance !== servicio.idMaintenance)
        : [...prevData.servicios, servicio];
  
      return { ...prevData, servicios: serviciosSeleccionados };
    });
  };
  
  const handleProductoSeleccionado = (producto) => {
    setFormData((prevData) => {
      const productosSeleccionados = prevData.productos.some((p) => p.idProducts === producto.idProducts)
        ? prevData.productos.filter((p) => p.idProducts !== producto.idProducts)
        : [...prevData.productos, producto];

      if (!prevData.productos.some(p => p.idProducts === producto.idProducts)) {
        return {
          ...prevData,
          productos: [...prevData.productos, producto],
          cantidades: [...prevData.cantidades, ""],
          unidades: [...prevData.unidades, ""]
        };
      } else {
        const index = prevData.productos.findIndex(p => p.idProducts === producto.idProducts);
        const nuevasCantidades = [...prevData.cantidades];
        const nuevasUnidades = [...prevData.unidades];
        nuevasCantidades.splice(index, 1);
        nuevasUnidades.splice(index, 1);
        
        return {
          ...prevData,
          productos: prevData.productos.filter(p => p.idProducts !== producto.idProducts),
          cantidades: nuevasCantidades,
          unidades: nuevasUnidades
        };
      }
    });
  };

  const handleDestruccionSeleccionado = (destruccion) => {
    setFormData((prevData) => {
      const destruccionesSeleccionados = prevData.destrucciones.some((p) => p.idDestruction === destruccion.idDestruction)
        ? prevData.destrucciones.filter((p) => p.idDestruction !== destruccion.idDestruction)
        : [...prevData.destrucciones, destruccion];

      return { ...prevData, destrucciones: destruccionesSeleccionados };
    });
  };

  const handleSubmitSalida = async (e) => {
    e.preventDefault();
  
    const productosSalida = formData.productos.map((producto, index) => {
      let cantidad = formData.cantidades[index] ?? 0;
      const unidad = formData.unidades[index] ?? null;
    
      cantidad = parseFloat(cantidad);
    
      if (!producto.idProducts || isNaN(cantidad) || cantidad <= 0 || !unidad) {
        return null;
      }
    
      return {
        idProducts: producto.idProducts,
        CantidadSalida: cantidad,
        UnidadSalida: unidad,
      };
    }).filter((producto) => producto !== null);
    
    const serviciosSalida = formData.servicios.map((servicio, index) => {
      let cantidad = formData.cantidades[index] ?? 0;
      const unidad = formData.unidades[index] ?? null;
    
      cantidad = parseFloat(cantidad);
    
      if (!servicio.idMaintenance || isNaN(cantidad) || cantidad <= 0 || !unidad) {
        return null;
      }
    
      return {
        idMaintenance: servicio.idMaintenance,
        CantidadSalida: cantidad,
        UnidadSalida: unidad,
      };
    }).filter((servicio) => servicio !== null);

    const destruccionesSalida = formData.destrucciones.map((destruccion, index) => {
      let cantidad = formData.cantidades[index] ?? 0;
      const unidad = formData.unidades[index] ?? null;
    
      cantidad = parseFloat(cantidad);
    
      if (!destruccion.idDestruction || isNaN(cantidad) || cantidad <= 0 || !unidad) {
        return null;
      }
    
      return {
        idDestruction: destruccion.idDestruction,
        CantidadSalida: cantidad,
        UnidadSalida: unidad,
      };
    }).filter((destruccion) => destruccion !== null);
    
    if (nameService === "RECOLECCION" && productosSalida.length === 0) {
      alert("No hay productos válidos para registrar.");
      return;
    }
    
    if (nameService === "MANTENIMIENTO" && serviciosSalida.length === 0) {
      alert("No hay servicios válidos para registrar.");
      return;
    }
    
    if (nameService === "DESTRUCCION" && destruccionesSalida.length === 0) {
      alert("No hay destrucciones válidas para registrar.");
      return;
    }

    if (!formData.fechaServicio) {
      alert("La fecha de servicio es requerida.");
      return;
    }

    const payload = {
      idSalida: formData.idSalida,
      folioSalida: formData.folio,
      fechaEntrada: formData.fechaEntrada,
      fechaServicio: formData.fechaServicio,
      productos: nameService === "RECOLECCION" ? productosSalida : [],
      servicios: nameService === "MANTENIMIENTO" ? serviciosSalida : [],
      destrucciones: nameService === "DESTRUCCION" ? destruccionesSalida : [],
    };
    
    try {
      const response = await fetch("/api/entradas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
      console.log("Respuesta del servidor:", result);

      if (result.success) {
        setShowModal(true);
        setFormData({
          idSalida: "",
          folio: "",
          fechaEntrada: obtenerFechaHoraLocal(),
          fechaServicio: obtenerFechaActual(),
          productos: [],
          servicios: [],
          unidades: [],
          cantidades: [],
          destrucciones: [],
        });
      } else {
        alert(result.message || "Error al registrar la salida.");
      }
    } catch (error) {
      console.error("Error al registrar la salida:", error);
      alert("Hubo un error en el registro.");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between bg-white shadow-md p-4 sticky top-0 z-10">
        <div className="flex items-center">
          <Image src="/logotrisma.jpg" alt="Logo Trisma" width={64} height={64} className="h-16 mr-4" />
          <span className="text-2xl font-bold text-[#92D050]">Trisma</span>
        </div>
        <button 
          onClick={() => window.history.back()} 
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Regresar a Inicio
        </button>
      </header>

      <main className="flex-1 overflow-hidden">
  <div className="max-w-none mx-auto p-4 h-full flex flex-col">
    <div className="bg-white rounded-lg shadow-xl overflow-hidden flex-1 flex flex-col mx-0">
       <div className="p-6 flex-1 flex flex-col">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Registro de Entrada</h1>
              
              <form onSubmit={handleSubmitSalida} className="flex-1 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Salida</label>
                    <input
                      type="text"
                      name="idSalida"
                      placeholder="Id Salida"
                      required
                      value={formData.idSalida}
                      onChange={(e) => setFormData({ ...formData, idSalida: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Folio</label>
                    <input
                      type="text"
                      name="folio"
                      required
                      placeholder="Folio de la salida"
                      value={formData.folio}
                      onChange={(e) => setFormData({ ...formData, folio: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Servicio</label>
                    <input
                      type="date"
                      name="fechaServicio"
                      required
                      value={formData.fechaServicio}
                      onChange={(e) => setFormData({ ...formData, fechaServicio: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-lg font-semibold text-gray-700">Tipo de Servicio: <span className="text-[#92D050]">{nameService}</span></p>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {nameService === "MANTENIMIENTO" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                      <div className="border rounded-lg shadow-md flex flex-col h-[300px]">
                        <div className="bg-gray-50 p-4 border-b">
                          <h2 className="font-semibold text-gray-700">Servicios seleccionados</h2>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                          <div className="grid grid-cols-3 gap-4 items-center text-gray-700 mb-2">
                            <span className="font-semibold">Servicio</span>
                            <span className="font-semibold">Cantidad</span>
                            <span className="font-semibold">UM</span>
                          </div>
                          <div className="space-y-4">
                            {formData.servicios.map((servicio, index) => (
                              <div key={index} className="grid grid-cols-3 gap-4 items-center">
                                <span className="text-gray-800">{servicio.nameMaintenance}</span>
                                <input
                                  type="number"
                                  placeholder="Cantidad"
                                  required
                                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                                  value={formData.cantidades[index] || ""}
                                  onChange={(e) => {
                                    const nuevasCantidades = [...formData.cantidades];
                                    nuevasCantidades[index] = e.target.value.replace(/^0+/, "");
                                    setFormData({ ...formData, cantidades: nuevasCantidades });
                                  }}
                                />
                                <select
                                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                                  value={formData.unidades[index] || ""}
                                  onChange={(e) => {
                                    const nuevasUnidades = [...formData.unidades];
                                    nuevasUnidades[index] = e.target.value;
                                    setFormData({ ...formData, unidades: nuevasUnidades });
                                  }}
                                >
                                  <option value="">Selecciona</option>
                                  <option value="PZ">PZ</option>
                                  <option value="KG">KG</option>
                                  <option value="TON">TON</option>
                                  <option value="m³">m³</option>
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg shadow-md flex flex-col h-[300px]">
                        <div className="bg-gray-50 p-4 border-b">
                          <h2 className="font-semibold text-gray-700">Lista de servicios</h2>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                          <div className="space-y-2">
                            {serviciosDisponibles.map((servicio, index) => (
                              <label key={index} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  value={servicio.nameMaintenance}
                                  checked={formData.servicios.some(m => m.idMaintenance === servicio.idMaintenance)}
                                  onChange={() => handleServicioSeleccionado(servicio)}
                                  className="accent-[#92D050] w-4 h-4"
                                />
                                <span className="text-gray-800">{servicio.nameMaintenance}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {nameService === "RECOLECCION" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                      <div className="border rounded-lg shadow-md flex flex-col h-[300px]">
                        <div className="bg-gray-50 p-4 border-b">
                          <h2 className="font-semibold text-gray-700">Materiales seleccionados</h2>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                          <div className="grid grid-cols-3 gap-4 items-center text-gray-700 mb-2">
                            <span className="font-semibold">Material</span>
                            <span className="font-semibold">Cantidad</span>
                            <span className="font-semibold">UM</span>
                          </div>
                          <div className="space-y-4">
                            {formData.productos.map((producto, index) => (
                              <div key={index} className="grid grid-cols-3 gap-4 items-center">
                                <span className="text-gray-800">{producto.nameProducts}</span>
                                <input
                                  type="number"
                                  placeholder="Cantidad"
                                  required
                                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                                  value={formData.cantidades[index] || ""}
                                  onChange={(e) => {
                                    const nuevasCantidades = [...formData.cantidades];
                                    nuevasCantidades[index] = e.target.value.replace(/^0+/, "");
                                    setFormData({ ...formData, cantidades: nuevasCantidades });
                                  }}
                                />
                                <select
                                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                                  value={formData.unidades[index] || ""}
                                  onChange={(e) => {
                                    const nuevasUnidades = [...formData.unidades];
                                    nuevasUnidades[index] = e.target.value;
                                    setFormData({ ...formData, unidades: nuevasUnidades });
                                  }}
                                >
                                  <option value="">Selecciona</option>
                                  <option value="PZ">PZ</option>
                                  <option value="KG">KG</option>
                                  <option value="TON">TON</option>
                                  <option value="m³">m³</option>
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg shadow-md flex flex-col h-[300px]">
                        <div className="bg-gray-50 p-4 border-b">
                          <h2 className="font-semibold text-gray-700">Lista de materiales</h2>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                          <div className="space-y-2">
                            {productosDisponibles.map((producto, index) => (
                              <label key={index} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  value={producto.nameProducts}
                                  checked={formData.productos.some(p => p.idProducts === producto.idProducts)}
                                  onChange={() => handleProductoSeleccionado(producto)}
                                  className="accent-[#92D050] w-4 h-4"
                                />
                                <span className="text-gray-800">{producto.nameProducts}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {nameService === "DESTRUCCION" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                      <div className="border rounded-lg shadow-md flex flex-col h-[300px]">
                        <div className="bg-gray-50 p-4 border-b">
                          <h2 className="font-semibold text-gray-700">Tipo de Destrucción seleccionados</h2>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                          <div className="grid grid-cols-3 gap-4 items-center text-gray-700 mb-2">
                            <span className="font-semibold">Material</span>
                            <span className="font-semibold">Cantidad</span>
                            <span className="font-semibold">UM</span>
                          </div>
                          <div className="space-y-4">
                            {formData.destrucciones.map((destruccion, index) => (
                              <div key={index} className="grid grid-cols-3 gap-4 items-center">
                                <span className="text-gray-800">{destruccion.nameDestruction}</span>
                                <input
                                  type="number"
                                  placeholder="Cantidad"
                                  required
                                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                                  value={formData.cantidades[index] || ""}
                                  onChange={(e) => {
                                    const nuevasCantidades = [...formData.cantidades];
                                    nuevasCantidades[index] = e.target.value.replace(/^0+/, "");
                                    setFormData({ ...formData, cantidades: nuevasCantidades });
                                  }}
                                />
                                <select
                                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                                  value={formData.unidades[index] || ""}
                                  onChange={(e) => {
                                    const nuevasUnidades = [...formData.unidades];
                                    nuevasUnidades[index] = e.target.value;
                                    setFormData({ ...formData, unidades: nuevasUnidades });
                                  }}
                                >
                                  <option value="">Selecciona</option>
                                  <option value="PZ">PZ</option>
                                  <option value="KG">KG</option>
                                  <option value="TON">TON</option>
                                  <option value="m³">m³</option>
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg shadow-md flex flex-col h-[300px]">
                        <div className="bg-gray-50 p-4 border-b">
                          <h2 className="font-semibold text-gray-700">Lista de Servicios de Destrucción</h2>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                          <div className="space-y-2">
                            {destruccionesDisponibles.map((destruccion, index) => (
                              <label key={index} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  value={destruccion.nameDestruction}
                                  checked={formData.destrucciones.some(d => d.idDestruction === destruccion.idDestruction)}
                                  onChange={() => handleDestruccionSeleccionado(destruccion)}
                                  className="accent-[#92D050] w-4 h-4"
                                />
                                <span className="text-gray-800">{destruccion.nameDestruction}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="sticky bottom-0 bg-white py-4 border-t mt-auto">
                  <div className="flex justify-center">
                    <button 
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300"
                      type="submit"
                    >
                      Registrar Salida
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold text-green-600 mb-2">Éxito</h2>
            <p className="text-gray-700 mb-4">Entrada registrada con éxito.</p>
            <div className="flex justify-end">
              <button 
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded transition"
                onClick={() => {
                  setShowModal(false);
                  router.back();
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}