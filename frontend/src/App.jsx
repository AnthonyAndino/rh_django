import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navegacion from "./Navegacion"
import ListadoEmpleados from "./empleados/ListadoEmpleados"
import AgregarEmpleado from "./empleados/AgregarEmpleado"

export default function App() {
  return (
    <BrowserRouter>
      <Navegacion />
      <div className="container pb-4">
        <Routes>
          <Route path="/" element={<ListadoEmpleados />} />
          <Route path="/agregar" element={<AgregarEmpleado />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}