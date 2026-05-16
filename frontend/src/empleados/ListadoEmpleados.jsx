import { useEffect, useState } from "react"
import axios from 'axios'
import { NumericFormat } from 'react-number-format'
import { urlBase } from "../config"

export default function ListadoEmpleados() {
    const [empleados, setEmpleados] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const cargar = async () => {
            try {
                const { data } = await axios.get(urlBase)
                
                setEmpleados(Array.isArray(data) ? data : [])
            } catch (error) {
                setError('No se puede cargar el listado de empleados')
            } finally {
                setCargando(false)
            }
        }

        cargar()

    }, [])

    if (cargando) return <p className="text-secondary">Cargando...</p>

    if (error) {
        return <div className="alert alert-danger" role="alert">{error}</div>
    }

    return (
        <div className="card">
            <div className="card-header">
                <strong>Empleados</strong>
            </div>
            <div className="card-body">
                {empleados.length === 0 ? (
                    <p className="mb-0 text-secondary">No hay empleados registrados</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-sm table-hover align-middle">
                            <thead>
                                <tr>
                                    <th style={{ width: 120 }}>ID Empleado</th>
                                    <th>Nombre</th>
                                    <th>Departamento</th>
                                    <th style={{ width: 160 }}>Sueldo</th>
                                    <th style={{ width: 170 }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {empleados.map((e) => (
                                    <tr key={e.idEmpleado}>
                                        <td>{e.idEmpleado}</td>
                                        <td>{e.nombre}</td>
                                        <td>{e.departamento}</td>
                                        <td>
                                            <NumericFormat
                                                value={e.sueldo}
                                                displayType="text"
                                                thousandSeparator=","
                                                decimalSeparator="."
                                                prefix="$"
                                                decimalScale={2}
                                                fixedDecimalScale
                                            />
                                        </td>
                                        <td>
                                            <button type="button" className="btn btn-sm btn-primary me-2" disabled>
                                                Editar
                                            </button>
                                            <button type="button" className="btn btn-sm btn-outline-danger">
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

