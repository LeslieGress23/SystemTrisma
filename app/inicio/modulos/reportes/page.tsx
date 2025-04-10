'use client';
import { FaTrashAlt, FaPen} from "react-icons/fa";
import * as XLSX from 'xlsx';
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Image from 'next/image';

interface Client {
  idClients: string;
  nameClients: string;
}

interface Service {
  idService: string;
  nameService: string;
}

interface Item {
  id_item: string;
  nombre_item: string;
  tipo_item: string;
}

interface ResultadoConsulta {
  idSalida: string;
  folioSalida: string;
  nombre_cliente: string;
  tipo_vehiculo: string;
  placa: string;
  tipo_servicio: string;
  id_item: string;
  nombre_item: string;
  cantidad: number;
  tipo_unidad: string;
  nombre_trabajador: string;
  fechaSalida: string;
  fechaEntrada: string;
  fechaServicio: string;
  idProducts?: string;
  idMaintenance?: string;
  idDestruction?: string;
}

export default function Inicio() {
  const router = useRouter();
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaTermino, setFechaTermino] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [newProduct, setNewProduct] = useState({ idClients: "" });
  const [newEmp, setNewEmpr] = useState({ idService: "" });
  const [notification, setNotification] = useState<string | null>(null);
  const [resultados, setResultados] = useState<ResultadoConsulta[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ResultadoConsulta>>({});
  const [apiItems, setApiItems] = useState<Item[]>([]);
  const [editingHeader, setEditingHeader] = useState<string | null>(null); // Cambiado a string | null
  const [headerEditData, setHeaderEditData] = useState({
    folioSalida: '',
    fechaServicio: ''
  });
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteItemModal, setDeleteItemModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{idSalida: string; idItem: string} | null>(null);

  const fetchItems = async (clientId: string) => {
    if (!clientId) {
      setApiItems([]);
      return;
    }

    try {
      const response = await fetch(`/api/items?clientId=${clientId}`);
      if (!response.ok) throw new Error('Error al obtener items');
      const data = await response.json();
      setApiItems(data);
    } catch (error) {
      console.error("Error al obtener los items:", error);
      setNotification("Error al cargar los items");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  useEffect(() => {
    fetchItems(newProduct.idClients);
  }, [newProduct.idClients]);

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((error) => console.error("Error al cargar clientes:", error));
  }, []);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch((error) => console.error("Error al cargar servicios:", error));
  }, []);

  const handleConsulta = async () => {
    if (!newProduct.idClients || !newEmp.idService || !fechaInicio || !fechaTermino) {
      setNotification("Por favor, selecciona una empresa y un rango de fechas.");
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      const params = new URLSearchParams({
        idClients: newProduct.idClients,
        fechaInicio,
        fechaTermino,
        idService: newEmp.idService,
      });

      const response = await fetch(`/api/reports?${params.toString()}`);

      if (!response.ok) {
        setNotification("No hay datos disponibles para estos filtros.");
        setTimeout(() => setNotification(null), 3000);
        setResultados([]);
        return;
      }

      const data = await response.json();

      if (data.length === 0) {
        setNotification("No hay datos disponibles para los filtros seleccionados.");
        setTimeout(() => setNotification(null), 3000);
        setResultados([]);
        return;
      }

      setResultados(data);
      setEditingId(null);
      setEditData({});
      setEditingHeader(null);

    } catch (error) {
      console.error("Error al obtener datos:", error);
      setNotification("Error al conectar con el servidor. Inténtalo más tarde.");
      setTimeout(() => setNotification(null), 3000);
      setResultados([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/";
  };

  const exportToExcel = () => {
    if (resultados.length === 0) {
      setNotification("No hay datos para exportar");
      setTimeout(() => setNotification(null), 3000);
      return;
    }
  
    const cleanQuantity = (quantity: any): number => {
      if (typeof quantity === 'number') return quantity;
      
      const cleaned = String(quantity)
        .replace(/,/g, '') 
        .replace(/[^0-9.]/g, ''); 
      
      const numberValue = parseFloat(cleaned);
      
      return isNaN(numberValue) ? 0 : numberValue;
    };
  
    const groupedByFolio = resultados.reduce((acc: Record<string, ResultadoConsulta[]>, item) => {
      if (!acc[item.folioSalida]) {
        acc[item.folioSalida] = [];
      }
      acc[item.folioSalida].push(item);
      return acc;
    }, {});
  
    const detailData: any[] = [
      ["Folio", "Cliente", "Vehículo", "Servicio", "Item", "Cantidad", "Unidad", "Trabajador"]
    ];
    
    Object.entries(groupedByFolio).forEach(([folio, items]) => {
      const firstItem = items[0];
      
      detailData.push([
        `${folio} ${formatFecha(firstItem.fechaServicio)}`,
        firstItem.nombre_cliente,
        `${firstItem.tipo_vehiculo} (${firstItem.placa})`,
        firstItem.tipo_servicio,
        '', '', '',
        firstItem.nombre_trabajador
      ]);
  
      items.forEach((item) => {
        const cleanQty = cleanQuantity(item.cantidad);
        detailData.push([
          '', '', '', '',
          item.nombre_item,
          cleanQty, 
          item.tipo_unidad,
          ''
        ]);
      });
  
      detailData.push(new Array(8).fill(''));
    });
  
    const summaryData: any[] = [
      ["Item", "Unidad", "Cantidad Total"]
    ];
  
    const summaryMap: Record<string, {
      nombre: string;
      unidad: string;
      cantidad: number;
    }> = {};
  
    resultados.forEach(item => {
      const cleanQty = cleanQuantity(item.cantidad);
      const key = `${item.nombre_item}_${item.tipo_unidad}`;
      
      if (!summaryMap[key]) {
        summaryMap[key] = {
          nombre: item.nombre_item,
          unidad: item.tipo_unidad,
          cantidad: 0
        };
      }
      
      summaryMap[key].cantidad += cleanQty;
    });
  
    const sortedItems = Object.values(summaryMap).sort((a, b) => 
      a.nombre.localeCompare(b.nombre)
    );
  
    sortedItems.forEach(item => {
      summaryData.push([
        item.nombre,
        item.unidad,
        item.cantidad
      ]);
    });
  
    const wb = XLSX.utils.book_new();
    
    const detailWs = XLSX.utils.aoa_to_sheet(detailData);
    XLSX.utils.book_append_sheet(wb, detailWs, "Detalle");
  
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Resumen");
  
    const applyStyles = (ws: any, isDetail: boolean) => {
      const cols = isDetail
        ? [
            {wch: 20}, {wch: 25}, {wch: 30}, {wch: 20},
            {wch: 30}, {wch: 12}, {wch: 8}, {wch: 25}
          ]
        : [
            {wch: 35}, {wch: 10}, {wch: 15}
          ];
      
      ws['!cols'] = cols;
  
      const qtyCol = isDetail ? 5 : 2;
      for (let R = 1; R <= (isDetail ? detailData.length : summaryData.length); R++) {
        const cellRef = XLSX.utils.encode_cell({c: qtyCol, r: R});
        if (ws[cellRef] && ws[cellRef].v !== '') {
          ws[cellRef].t = 'n';
          ws[cellRef].z = '#,##0.00'; 
        }
      }
    };
  
    applyStyles(detailWs, true);
    applyStyles(summaryWs, false);
  
    const fileName = `Reporte_Salidas_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleEdit = (resultado: ResultadoConsulta) => {
    const uniqueId = `${resultado.idSalida}-${resultado.id_item}`;
    setEditingId(uniqueId);
    setEditData({
      cantidad: resultado.cantidad,
      tipo_unidad: resultado.tipo_unidad,
      id_item: resultado.id_item,
      idProducts: resultado.idProducts,
      idMaintenance: resultado.idMaintenance,
      idDestruction: resultado.idDestruction
    });
  };

  const handleSave = async (resultado: ResultadoConsulta) => {
    try {
      let itemType: 'product' | 'maintenance' | 'destruction';
      let originalIdItem: string | undefined;
      
      if (resultado.idProducts) {
        itemType = 'product';
        originalIdItem = resultado.idProducts;
      } else if (resultado.idMaintenance) {
        itemType = 'maintenance';
        originalIdItem = resultado.idMaintenance;
      } else if (resultado.idDestruction) {
        itemType = 'destruction';
        originalIdItem = resultado.idDestruction;
      } else {
        const servicio = resultado.tipo_servicio.toLowerCase();
        if (servicio.includes('mantenimiento')) {
          itemType = 'maintenance';
        } else if (servicio.includes('destrucción') || servicio.includes('destruccion')) {
          itemType = 'destruction';
        } else {
          itemType = 'product';
        }
        originalIdItem = resultado.id_item;
      }

      const tableConfig = {
        product: {
          table: 'departure_products',
          idField: 'idProducts'
        },
        maintenance: {
          table: 'departure_maintenance',
          idField: 'idMaintenance'
        },
        destruction: {
          table: 'departure_destruction',
          idField: 'idDestruction'
        }
      };

      const config = tableConfig[itemType];
      if (!config) {
        throw new Error(`Tipo de item no soportado: ${itemType}`);
      }

      const payload = {
        idSalida: resultado.idSalida,
        originalIdItem: originalIdItem,
        cantidad: editData.cantidad,
        tipo_unidad: editData.tipo_unidad,
        id_item: editData.id_item,
        tableName: config.table,
        idFieldName: config.idField,
        [config.idField]: originalIdItem
      };

      const response = await fetch('/api/updateItem', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar');
      }

      await handleConsulta();

      setEditingId(null);
      setNotification("Registro actualizado correctamente");
      setTimeout(() => setNotification(null), 3000);

    } catch (error: any) {
      console.error("Error al actualizar:", error);
      setNotification(error.message || "Error al actualizar el registro");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: name === 'cantidad' ? Number(value) : value
    }));
  };

  const handleEditHeader = (datosComunes: ResultadoConsulta) => {
    setHeaderEditData({
      folioSalida: datosComunes.folioSalida,
      fechaServicio: datosComunes.fechaServicio ? datosComunes.fechaServicio.split('T')[0] : ''
    });
    setEditingHeader(datosComunes.folioSalida); 
  };

  const handleSaveHeader = async (idSalida: string) => {
    try {
      const response = await fetch('/api/updateFolioAndDate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idSalida,
          folioSalida: headerEditData.folioSalida,
          fechaServicio: headerEditData.fechaServicio
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar');
      }

      await handleConsulta();

      setEditingHeader(null);
      setNotification("Encabezado actualizado correctamente");
      setTimeout(() => setNotification(null), 3000);

    } catch (error) {
      console.error("Error al actualizar:", error);
      setNotification("Error al actualizar el encabezado");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleCancelHeader = () => {
    setEditingHeader(null);
  };

  const handleDeleteClick = (idSalida: string) => {
    setItemToDelete({idSalida, idItem: ''});
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const response = await fetch(`/api/deleteDeparture?idSalida=${itemToDelete.idSalida}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      setResultados(resultados.filter(item => item.idSalida !== itemToDelete.idSalida));
      setNotification("Registro eliminado correctamente");
      setTimeout(() => setNotification(null), 3000);

    } catch (error) {
      console.error("Error al eliminar:", error);
      setNotification("Error al eliminar el registro");
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const formatFechaHora = (fechaString: string) => {
    if (!fechaString) return 'N/A';
    const fecha = new Date(fechaString);
    return fecha.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatFecha = (fechaString: string) => {
    if (!fechaString) return 'N/A';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDeleteItemClick = (idSalida: string, idItem: string) => {
    setItemToDelete({idSalida, idItem});
    setDeleteItemModal(true);
  };
  
  const handleDeleteItemConfirm = async () => {
    if (!itemToDelete) return;
    
    try {
      const {idSalida, idItem} = itemToDelete;
      const response = await fetch(`/api/deleteItem?idSalida=${idSalida}&idItem=${idItem}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      if (!response.ok) {
        throw new Error('Error al eliminar el item');
      }
  
      setResultados(resultados.filter(item => 
        !(item.idSalida === idSalida && item.id_item === idItem)
      ));
      
      setNotification("Item eliminado correctamente");
      setTimeout(() => setNotification(null), 3000);
  
    } catch (error) {
      console.error("Error al eliminar el item:", error);
      setNotification("Error al eliminar el item");
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setDeleteItemModal(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Modal de confirmación de eliminación */}
      {deleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
            <p className="mb-4">¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.</p>
            <div className="mt-4 flex justify-end space-x-4">
              <button 
                onClick={() => setDeleteModal(false)} 
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition duration-200"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-200"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteItemModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
            <p className="mb-4">¿Estás seguro de que deseas eliminar este item específico? Esta acción no se puede deshacer.</p>
            <div className="mt-4 flex justify-end space-x-4">
              <button 
                onClick={() => setDeleteItemModal(false)} 
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition duration-200"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteItemConfirm} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-200"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra lateral */}
      <div className="w-64 bg-gray-800 text-white fixed top-0 bottom-0 left-0">
        <ul className="mt-8">
          <li className="p-4 hover:bg-gray-700 cursor-pointer text-xl" onClick={() => router.push("/inicio/modulos/clientes")}>Clientes</li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer text-xl" onClick={() => router.push("/inicio/modulos/productos")}>Materiales</li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer text-xl" onClick={() => router.push("/inicio/modulos/mantenimiento")}>Servicios de Mantenimiento</li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer text-xl" onClick={() => router.push("/inicio/modulos/destruccion")}>Servicios de Destrucción</li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer text-xl" onClick={() => router.push("/inicio/modulos/vehiculos")}>Vehículos</li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer text-xl" onClick={() => router.push("/inicio/modulos/recursosHumanos")}>Recursos Humanos</li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer text-xl" onClick={() => router.push("/inicio/modulos/reportes")}>Reportes</li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer text-xl" onClick={() => router.push("/inicio/modulos/accesos")}>Accesos</li>
        </ul>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 ml-64 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow-md p-4">
          <div className="flex items-center">
            <Image src="/logotrisma.jpg" alt="Logo Trisma" width={64} height={64} className="h-16 mr-4" />
            <span className="text-2xl font-bold text-[#92D050]">Trisma ERP</span>
          </div>
          <button onClick={handleLogout} className="bg-red-500 text-white font-semibold p-2 rounded-lg hover:bg-red-600 transition duration-300">Cerrar sesión</button>
        </header>

        {/* Formulario de consulta */}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Consulta los Registros de las Salidas</h1>
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-gray-600 font-bold">Empresa:</label>
                <select 
                  value={newProduct.idClients} 
                  onChange={(e) => setNewProduct({ ...newProduct, idClients: e.target.value })} 
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                >
                  <option value="">Selecciona una Empresa</option>
                  {clients.map(client => (
                    <option key={client.idClients} value={client.idClients}>
                      {client.nameClients}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-1/2">
                <label className="block text-gray-600 font-bold">Servicio:</label>
                <select 
                  value={newEmp.idService} 
                  onChange={(e) => setNewEmpr({ ...newEmp, idService: e.target.value })} 
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                >
                  <option value="">Selecciona un Servicio</option>
                  {services.map(service => (
                    <option key={service.idService} value={service.idService}>
                      {service.nameService}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="w-1/2">
                <label className="block text-gray-600 font-bold">Fecha Inicio:</label>
                <input 
                  type="date" 
                  value={fechaInicio} 
                  onChange={(e) => setFechaInicio(e.target.value)} 
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]" 
                />
              </div>
              <div className="w-1/2">
                <label className="block text-gray-600 font-bold">Fecha Término:</label>
                <input 
                  type="date" 
                  value={fechaTermino} 
                  onChange={(e) => setFechaTermino(e.target.value)} 
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92D050]" 
                />
              </div>
            </div>
       
            <div className="flex gap-4 mt-4">
              <button 
                onClick={handleConsulta} 
                className="flex-1 bg-green-600 font-semibold text-white p-3 rounded-lg hover:bg-green-700 transition duration-300"

              >
                Consultar
              </button>
              {resultados.length > 0 && (
                <button 
                  onClick={exportToExcel} 
                  className="flex-1 bg-blue-600 text-white font-semibold p-3 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Exportar a Excel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Resultados */}
        {resultados.length > 0 ? (
          <div className="mt-6 space-y-6 mx-6">
            {Object.entries(
              resultados.reduce((acc: Record<string, ResultadoConsulta[]>, resultado) => {
                if (!acc[resultado.folioSalida]) {
                  acc[resultado.folioSalida] = [];
                }
                acc[resultado.folioSalida].push(resultado);
                return acc;
              }, {})
            ).map(([folio, resultadosPorFolio]) => {
              const datosComunes = resultadosPorFolio[0];
              
              return (
                <div key={folio} className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      {editingHeader === datosComunes.folioSalida ? (
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-bold text-gray-600">Folio:</h4>
                            <input
                              type="text"
                              value={headerEditData.folioSalida}
                              onChange={(e) => setHeaderEditData({...headerEditData, folioSalida: e.target.value})}
                              className="p-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-600">Fecha de Servicio:</h4>
                            <input
                              type="date"
                              value={headerEditData.fechaServicio}
                              onChange={(e) => setHeaderEditData({...headerEditData, fechaServicio: e.target.value})}
                              className="p-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                            />
                          </div>
                          <div className="flex space-x-2 mt-5">
                            <button
                              onClick={() => handleSaveHeader(datosComunes.idSalida)}
                              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={handleCancelHeader}
                              className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-lg font-bold text-gray-800">Folio: {datosComunes.folioSalida}</h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditHeader(datosComunes)}
                              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center gap-2 sm:w-auto w-full"
                              > <FaPen />Editar Encabezado
                            </button>
                            <button
                              onClick={() => handleDeleteClick(datosComunes.idSalida)}
                              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-300 flex items-center gap-2 sm:w-auto w-full"
                              ><FaTrashAlt />
                              Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <h4 className="font-bold text-gray-600">ID Salida:</h4>
                        <p>{datosComunes.idSalida}</p>
                      </div>
                       <div>
                        <h4 className="font-bold text-gray-600">Fecha y Hora Salida:</h4>
                        <p>{formatFechaHora(datosComunes.fechaSalida)}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-600">Fecha y Hora Entrada:</h4>
                        <p>{formatFechaHora(datosComunes.fechaEntrada)}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-600">Fecha de Servicio:</h4>
                        <p>{formatFecha(datosComunes.fechaServicio)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <h4 className="font-bold text-gray-600">Cliente:</h4>
                        <p>{datosComunes.nombre_cliente}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-600">Vehículo:</h4>
                        <p>{datosComunes.tipo_vehiculo} ({datosComunes.placa})</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-600">Servicio:</h4>
                        <p>{datosComunes.tipo_servicio}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-600">Trabajador:</h4>
                        <p>{datosComunes.nombre_trabajador}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-2 border">Item</th>
                          <th className="px-4 py-2 border">Cantidad</th>
                          <th className="px-4 py-2 border">Unidad</th>
                          <th className="px-4 py-2 border">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultadosPorFolio.map((resultado) => {
                          const rowId = `${resultado.idSalida}-${resultado.id_item}`;
                          const isEditing = editingId === rowId;
                          
                          return (
                            <tr key={rowId} className="hover:bg-gray-50">
                              <td className="px-4 py-2 border">
                                {isEditing ? (
                                  <select
                                    name="id_item"
                                    value={editData.id_item || ""}
                                    onChange={handleChange}
                                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                                  >
                                    <option value="">Seleccione un ítem</option>
                                    {apiItems.map((item) => (
                                      <option key={item.id_item} value={item.id_item}>
                                      {item.nombre_item}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  resultado.nombre_item || 'N/A'
                                )}
                              </td>
                                                            
                              <td className="px-4 py-2 border">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    name="cantidad"
                                    value={editData.cantidad || ''}
                                    onChange={handleChange}
                                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                                    step="0.01"
                                  />
                                ) : (
                                  resultado.cantidad
                                )}
                              </td>
                              
                              <td className="px-4 py-2 border">
                                {isEditing ? (
                                  <select
                                    name="tipo_unidad"
                                    value={editData.tipo_unidad || ''}
                                    onChange={handleChange}
                                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                                  >
                                    <option value="KG">KG</option>
                                    <option value="PZ">PZ</option>
                                    <option value="TON">TON</option>
                                    <option value="L">L</option>
                                    <option value="M3">M3</option>
                                  </select>
                                ) : (
                                  resultado.tipo_unidad
                                )}
                              </td>
                              
                              <td className="px-4 py-2 border">
                                {isEditing ? (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleSave(resultado)}
                                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      onClick={handleCancel}
                                      className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEdit(resultado)}
                                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItemClick(resultado.idSalida, resultado.id_item)}
                                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-lg text-center mx-6">
            <p className="text-gray-600">No hay resultados para mostrar. Realiza una consulta.</p>
          </div>
        )}

        {/* Notificación */}
        {notification && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
              bg-gray-100 text-gray-800 p-4 rounded-lg shadow-lg border border-gray-300
              flex items-center gap-3 text-lg font-semibold animate-fadeIn z-50">
            {notification}
          </div>
        )}
      </div>
    </div>
  );
}