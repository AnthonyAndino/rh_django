// Root component — sets up providers, routing, and role-based guards.
//
// Routes:
//   Public  — /login, /registro, /recuperar (wrapped in AuthLayout)
//   Private — / (Dashboard), /asistencia
//   Admin   — /empleados, /agregar, /editar/:idEmpleado, /nominas
//
// RutaPrivada: redirects to /login if not authenticated.
// RutaAdministrador: redirects to / if authenticated but not admin.
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./AuthContext"
import { ThemeProvider } from "./ThemeContext"
import Navegacion from "./Navegacion"

import Dashboard from "./empleados/Dashboard"
import ListadoEmpleados from "./empleados/ListadoEmpleados"
import AgregarEmpleado from "./empleados/AgregarEmpleado"
import EditarEmpleado from "./empleados/EditarEmpleado"
import ControlAsistencia from "./empleados/ControlAsistencias"
import ControlNominas from "./empleados/ControlNominas"

import AuthLayout from "./AuthLayout"
import Login from "./Login"
import Register from "./Register"
import RecuperarPassword from "./RecuperarPassword"


function RutaPrivada({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}


function RutaAdministrador({ children }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return user?.rol === 'admin' ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={isAuthenticated ? "app-wrapper animate-fade-in" : ""}>
      {isAuthenticated && <Navegacion />}
      
      <main className={isAuthenticated ? "main-content" : ""}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/recuperar" element={<RecuperarPassword />} />
          </Route>

          <Route path="/" element={<RutaPrivada><Dashboard /></RutaPrivada>} />
          <Route path="/asistencia" element={<RutaPrivada><ControlAsistencia /></RutaPrivada>} />
          
          <Route path="/empleados" element={<RutaAdministrador><ListadoEmpleados /></RutaAdministrador>} />
          <Route path="/agregar" element={<RutaAdministrador><AgregarEmpleado /></RutaAdministrador>} />
          <Route path="/editar/:idEmpleado" element={<RutaAdministrador><EditarEmpleado /></RutaAdministrador>} />
          <Route path="/nominas" element={<RutaAdministrador><ControlNominas /></RutaAdministrador>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}