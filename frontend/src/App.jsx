import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navegacion from "./Navegacion"
import ListadoEmpleados from "./empleados/ListadoEmpleados"
import AgregarEmpleado from "./empleados/AgregarEmpleado"
import EditarEmpleado from "./empleados/EditarEmpleado"
import ControlAsistencia from "./empleados/ControlAsistencias"
import ControlNominas from "./empleados/ControlNominas"

export default function App() {
  return (
    <BrowserRouter>
      <Navegacion />
      <div className="container pb-5">
        <Routes>
          <Route path="/" element={<ListadoEmpleados />} />
          <Route path="/agregar" element={<AgregarEmpleado />} />
          <Route path="/editar/:idEmpleado" element={<EditarEmpleado />} />
          <Route path="/asistencia" element={<ControlAsistencia />} />
          <Route path="/nominas" element={<ControlNominas />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}