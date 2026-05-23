import { useEffect, useState } from "react"
import axios from 'axios'
import { NumericFormat } from 'react-number-format'
import { urlBase } from "../config"
import { Link } from "react-router-dom"

export default function ListadoEmpleados() {
    const [empleados, setEmpleados] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [eliminandoId, setEliminandoId] = useState(null)

    const cargar = async () => {
        try {
            const { data } = await axios.get(urlBase)
            setEmpleados(Array.isArray(data) ? data : [])
        } catch (e) {
            setError('No se pudo cargar el listado de empleados')
        }
    }

    useEffect(() => {
        const boot = async () => {
            setCargando(true)
            await cargar()
            setCargando(false)
        }
        boot()
    }, [])


    const eliminar = async (idEmpleado) => {
        const ok = window.confirm('Seguro que deseas eliminar este empleado?')
        if (!ok) return
        
        try {
            setEliminandoId(idEmpleado)
            await axios.delete(`${urlBase}/${idEmpleado}`)
            await cargar()
        } catch (e) {
            alert('No se pudo eliminar el empleado.')
        } finally {
            setEliminandoId(null)
        }
    }

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
                                            <Link to={`/editar/${e.idEmpleado}`} className="btn btn-sm btn-primary me-2">
                                                Editar
                                            </Link>
                                            <button 
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => eliminar(e.idEmpleado)}
                                                disabled={eliminandoId === e.idEmpleado}
                                            >
                                                {eliminandoId === e.idEmpleado ? 'Eliminando...' : 'Eliminar'}
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
