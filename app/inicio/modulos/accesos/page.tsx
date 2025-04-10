"use client"
import {FaPlusCircle} from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { FiUser, FiLock, FiEye, FiEyeOff, FiLoader, FiTrash2, FiX } from "react-icons/fi";

interface User {
  idUser: number;
  usernameUser: string;
  emailUser: string;
  roleUser: string;
  passwordUser: string;
}

export default function Accesos() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordsInTable, setShowPasswordsInTable] = useState<{[key: number]: boolean}>({});
  const [newUser, setNewUser] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    emailUser: "",
    roleUser: "user"
  });
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [notification, setNotification] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        if (decoded.username === "FTMeza") {
          setCurrentUser({
            idUser: decoded.userId,
            usernameUser: decoded.username,
            emailUser: "",
            roleUser: decoded.role,
            passwordUser: ""
          });
          setAuthenticated(true);
          setShowTable(true);
          fetchUsers();
        } else {
          setAuthenticated(false);
          setCurrentUser(null);
          setShowRestrictedModal(true);
        }
      } catch (err) {
        console.error("Token inválido:", err);
        handleLogout();
      }
    }
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/users2", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        }
      });
      
      if (!response.ok) {
        throw new Error(response.status === 401 ? "No autorizado" : "Error al obtener usuarios");
      }
      
      const data = await response.json();
      setUsers(data);
      const passwordsState: {[key: number]: boolean} = {};
      data.forEach((user: User) => {
        passwordsState[user.idUser] = false;
      });
      setShowPasswordsInTable(passwordsState);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      if (err instanceof Error && err.message === "No autorizado") {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (userId: number) => {
    setShowPasswordsInTable(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const generateUsername = (nombre: string, apellidoP: string, apellidoM: string) => {
    const primeraLetraNombre = nombre.charAt(0).toUpperCase();
    const primeraLetraApellidoP = apellidoP.charAt(0).toUpperCase();
    return `${primeraLetraNombre}${primeraLetraApellidoP}${apellidoM}`;
  };

  const generatePassword = (username: string) => {
    const randomNum = Math.floor(Math.random() * 90) + 10;
    const randomLetter = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    return `${username}${randomNum}${randomLetter}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("authToken", data.token);
        if (data.user.usernameUser === "FTMeza") {
          setCurrentUser(data.user);
          setAuthenticated(true);
          setShowTable(true);
          await fetchUsers();
        } else {
          setShowRestrictedModal(true);
          setAuthenticated(false);
          setCurrentUser(null);
          localStorage.removeItem("authToken");
        }
      } else {
        setError(data.error || "Credenciales inválidas");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/";
  };

  const handleAddUser = async () => {
    if (!newUser.nombre || !newUser.apellidoPaterno || !newUser.apellidoMaterno) {
      setError("Nombre y apellidos son requeridos");
      return;
    }

    setLoading(true);
    setError("");

    const usernameUser = generateUsername(newUser.nombre, newUser.apellidoPaterno, newUser.apellidoMaterno);
    const passwordUser = generatePassword(usernameUser);

    try {
      const response = await fetch("/api/users2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({
          usernameUser,
          passwordUser,
          emailUser: newUser.emailUser,
          roleUser: newUser.roleUser
        })
      });

      if (!response.ok) {
        throw new Error(response.status === 401 ? "No autorizado" : "Error al agregar usuario");
      }

      setShowAddUserForm(false);
      setNewUser({
        nombre: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        emailUser: "",
        roleUser: "user"
      });
      await fetchUsers();
      showNotification("Usuario agregado con éxito");
    } catch (err) {
      console.error("Add user error:", err);
      setError(err instanceof Error ? err.message : "Error al agregar usuario");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteUser = (userId: number) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setLoading(true);
    setError("");
    setShowDeleteModal(false);

    try {
      const response = await fetch(`/api/users2?id=${userToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        }
      });

      if (!response.ok) {
        throw new Error(response.status === 401 ? "No autorizado" : "Error al eliminar usuario");
      }

      await fetchUsers();
      showNotification("Usuario eliminado con éxito");
    } catch (err) {
      console.error("Delete user error:", err);
      setError(err instanceof Error ? err.message : "Error al eliminar usuario");
    } finally {
      setLoading(false);
      setUserToDelete(null);
    }
  };

  const navigateTo = (path: string) => {
    router.push(`/inicio/modulos/${path}`);
  };

  return (
    <div className="flex h-screen">
      {/* Menú lateral */}
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
            Vehículos
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
            className="p-4 hover:bg-gray-700 cursor-pointer text-xl bg-gray-700"
            onClick={() => navigateTo("accesos")}
          >
            Accesos
          </li>
        </ul>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 ml-64 overflow-y-auto">
        {/* Encabezado */}
        <header className="flex items-center justify-between bg-white shadow-md shadow-gray-300 p-4">
          <div className="flex items-center">
            <Image 
              src="/logotrisma.jpg" 
              alt="Logo Trisma" 
              width={64} 
              height={64} 
              className="h-16 mr-4" 
            />
            <span className="text-2xl font-bold text-[#92D050]">Trisma</span>
          </div>
          <div className="flex items-center">
            {currentUser && (
              <span className="mr-4 text-gray-700">
                Bienvenido, {currentUser.usernameUser}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white font-semibold p-2 rounded-lg hover:bg-red-600 transition duration-300"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Contenido principal */}
        {!authenticated ? (
          <div className="flex items-center justify-center h-[85vh]">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Usuarios
                </h2>
                <p className="text-gray-600">
                  Ingresa tus credenciales para administrar los usuarios
                </p>
              </div>
              <form onSubmit={handleLogin}>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2 font-medium" htmlFor="username">
                    Usuario
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92D050] focus:border-transparent"
                      placeholder="Ingresa tu usuario"
                      required
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2 font-medium" htmlFor="password">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92D050] focus:border-transparent"
                      placeholder="Ingresa tu contraseña"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FiEyeOff className="text-gray-400 hover:text-gray-600" />
                      ) : (
                        <FiEye className="text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#92D050] hover:bg-[#7CB342]"
                  } text-white font-semibold py-3 px-4 rounded-lg transition duration-300`}
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Verificando...
                    </>
                  ) : (
                    "Ingresar"
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : showTable ? (
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Administración de Usuarios
              </h2>
              <div className="flex space-x-2">
                {currentUser?.usernameUser === "FTMeza" && (
                  <button
                    onClick={() => setShowAddUserForm(true)}
                    disabled={loading}
                    className="bg-green-500 text-white font-semibold p-3 rounded-lg hover:bg-green-600 transition duration-300 flex items-center gap-2"
                                >
                                  <FaPlusCircle />
                    Agregar Usuario
                  </button>
                )}
              </div>
            </div>
            
            {showAddUserForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Agregar Nuevo Usuario</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Nombre</label>
                    <input
                      type="text"
                      value={newUser.nombre}
                      onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                      placeholder="Nombre"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Apellido Paterno</label>
                    <input
                      type="text"
                      value={newUser.apellidoPaterno}
                      onChange={(e) => setNewUser({...newUser, apellidoPaterno: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                      placeholder="Apellido Paterno"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Apellido Materno</label>
                    <input
                      type="text"
                      value={newUser.apellidoMaterno}
                      onChange={(e) => setNewUser({...newUser, apellidoMaterno: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                      placeholder="Apellido Materno"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newUser.emailUser}
                      onChange={(e) => setNewUser({...newUser, emailUser: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Rol</label>
                    <select
                      value={newUser.roleUser}
                      onChange={(e) => setNewUser({...newUser, roleUser: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92D050]"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={() => setShowAddUserForm(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddUser}
                    disabled={loading}
                    className="bg-[#92D050] text-white px-4 py-2 rounded-lg hover:bg-[#7CB342] transition duration-300"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            )}
            
            {loading && users.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#92D050]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
                <p>{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border">ID</th>
                      <th className="px-4 py-2 border">Usuario</th>
                      <th className="px-4 py-2 border">Email</th>
                      <th className="px-4 py-2 border">Contraseña</th>
                      <th className="px-4 py-2 border">Rol</th>
                      {currentUser?.usernameUser === "FTMeza" && (
                        <th className="px-4 py-2 border">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.idUser} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{user.idUser}</td>
                        <td className="px-4 py-2 border">{user.usernameUser}</td>
                        <td className="px-4 py-2 border">
                          {user.emailUser || <span className="text-gray-400">-</span>}
                        </td>
                        <td className="px-4 py-2 border">
                          <div className="flex items-center">
                            {showPasswordsInTable[user.idUser] ? (
                              <span className="font-mono">{user.passwordUser}</span>
                            ) : (
                              <span className="tracking-widest">••••••••</span>
                            )}
                            <button
                              type="button"
                              className="ml-2 text-gray-500 hover:text-blue-600 transition-colors"
                              onClick={() => togglePasswordVisibility(user.idUser)}
                            >
                              {showPasswordsInTable[user.idUser] ? (
                                <FiEyeOff className="text-sm" />
                              ) : (
                                <FiEye className="text-sm" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-2 border">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded ${
                              user.roleUser === "admin" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-blue-100 text-blue-800"
                            }`}>
                            {user.roleUser}
                          </span>
                        </td>
                        {currentUser?.usernameUser === "FTMeza" && (
                          <td className="px-4 py-2 border">
                            <button
                              onClick={() => confirmDeleteUser(user.idUser)}
                              disabled={loading}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Eliminar usuario"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}

        {/* Modal de acceso restringido */}
        {showRestrictedModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <FiLock className="text-red-500 text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                  Acceso restringido
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  Solo el usuario FTMeza puede acceder a este módulo.
                </p>
                <button
                  onClick={() => {
                    setShowRestrictedModal(false);
                    setAuthenticated(false);
                    setCurrentUser(null);
                    localStorage.removeItem("authToken");
                  }}
                  className="bg-red-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-600 transition duration-300"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación para eliminar usuario */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Confirmar eliminación</h3>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <p className="mb-6 text-gray-600">
                ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 flex items-center"
                >
                  {loading ? (
                    <FiLoader className="animate-spin mr-2" />
                  ) : (
                    <FiTrash2 className="mr-2" />
                  )}
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

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