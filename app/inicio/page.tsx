"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Inicio() {
  const router = useRouter();

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

  return (
    <div className="flex h-screen">
      {/* Menú lateral */}
      <div className="w-64 bg-gray-800 text-white">
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

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Encabezado */}
        <header className="flex items-center justify-between bg-white shadow-md shadow-gray-300 p-4">
          <div className="flex items-center">
            <Image src="/logotrisma.jpg" alt="Logo Trisma" width={64} height={64} className="h-16 mr-4" />
            <span className="text-2xl font-bold text-[#92D050]">Trisma</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white font-semibold p-2 rounded-lg hover:bg-red-600 transition duration-300"
          >
            Cerrar sesión
          </button>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 flex items-center justify-center p-6">
          <h1 className="text-3xl font-semibold text-gray-800">
            Bienvenido <span className="text-[#92D050]">Administrador</span>
          </h1>
        </main>
      </div>
    </div>
  );
}