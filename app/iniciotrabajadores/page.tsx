"use client";  

import { useRouter } from "next/navigation";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import Image from "next/image";

export default function Inicio() {
  const router = useRouter(); 
  
  const navigateTo = (path: string) => {
    router.push(`/iniciotrabajadores/modulostra/${path}`);
  };
  

  return (
    <>
      <div className="flex flex-col min-h-screen">
        {/* Contenido principal */}
        <div className="flex-1 flex flex-col">
          {/* Encabezado */}
          <header className="flex items-center justify-between bg-white shadow-md shadow-gray-300 p-4">
            <div className="flex items-center">
<Image src="/logotrisma.jpg" alt="Logo Trisma" width={64} height={64} className="h-16 mr-4" />
              <span className="text-2xl font-bold text-[#92D050]">Trisma</span>
            </div>
          </header>

          {/* Contenido principal */}
          <main className="flex-1 flex justify-center items-center gap-8 p-4">
            <button  onClick={() => navigateTo("salida")}  className="bg-blue-500 text-white font-semibold w-40 h-40 flex flex-col items-center justify-center rounded-lg hover:bg-blue-600 transition duration-300 text-2xl">
            <FaSignOutAlt size={50}  />
              Registrar Salida
            </button>
            <button onClick={() => navigateTo("entrada")} className="bg-green-500 text-white font-semibold w-40 h-40 flex flex-col items-center justify-center rounded-lg hover:bg-green-600 transition duration-300 text-2xl">
            <FaSignInAlt size={50} />
            Registrar Entrada
            </button>
          </main>
        </div>

        {/* Pie de página */}
        <footer className="bg-gray-800 text-white py-4 text-center mt-auto">
          <p className="text-sm">&copy; 2025 Trisma Reciclaje - Todos los derechos reservados</p>
        </footer>
      </div>
    </>
  );
}
