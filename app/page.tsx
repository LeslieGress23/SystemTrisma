"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { setCookie } from "cookies-next";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, password }),
      });

      const result = await response.json();

      if (response.ok) {
        setCookie('authToken', result.token, { maxAge: 60 * 60 * 24 }); // 1 día de duración

        if (result.role === "admin") {
          router.push("/inicio");
        } else {
          console.error("Rol desconocido:", result.role);
          alert("Error: Rol no reconocido");
        }
      } else {
        alert(result.error || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error al realizar el login:", error);
      alert("Ocurrió un error en la autenticación");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center flex-1 bg-gradient-to-r from-gray-200 to-gray-300">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Inicia sesión en <span className="text-[#92D050]">Trisma</span>
          </h1>
          <Image
            src="/logotrisma.jpg"
            alt="Logo Trisma"
            width={80}
            height={80}
            className="h-20 w-20 mx-auto mb-4 rounded-full shadow-md"
          />
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg w-96">
          <div>
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-lg p-4 w-full focus:ring-2 focus:ring-[#92D050] focus:outline-none mb-4"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-lg p-4 w-full focus:ring-2 focus:ring-[#92D050] focus:outline-none mb-4"
            />
            <button
              onClick={handleLogin}
              className="bg-[#92D050] text-white font-semibold p-4 rounded-lg w-full hover:bg-[#82C144] transition duration-300"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>

      <footer className="bg-gray-800 text-white py-4 text-center">
        <p className="text-sm">&copy; 2025 Trisma Reciclaje - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}