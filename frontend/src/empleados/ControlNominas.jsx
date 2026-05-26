import { useEffect, useState } from 'react'
import { obtenerNominas } from './empleadosApi'
import { NumericFormat } from 'react-number-format'
import { DollarSign, Calendar, TrendingUp } from 'lucide-react'

export default function ControlNominas() {
    const [nominas, setNominas] = useState([])
    const [cargando, setCargando] = useState(true)

    const cargar = async () => {
        try {
            const { data } = await obtenerNominas()
            setNominas(data)
        } catch (e) {
            console.error("Error al cargar nominas", e)
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

    if (cargando) return <div className="text-center py-5"><p className="text-secondary">Cargando libro de nóminas...</p></div>

    return (
        <div className="container-fluid px-0">
            <div className="card">
                <div className="card-header d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                        <DollarSign className="text-success" size={22} />
                        <span>Libro de Salarios y Nómina Corporativa</span>
                    </div>
                    <button 
                        className="btn btn-sm btn-secondary d-flex align-items-center gap-2"
                        onClick={() => alert("¡Excelente! Para generar nuevas nóminas, abre tu MySQL Workbench y ejecuta: CALL GenerarNominaMensual('2026-05-30'); y luego recarga esta página.")}
                    >
                        <Calendar size={14} />
                        ¿Cómo calcular Nómina?
                    </button>
                </div>
                <div className="card-body p-0">
                    {nominas.length === 0 ? (
                        <div className="p-5 text-center">
                            <p className="text-secondary mb-3">No hay registros de nómina calculados.</p>
                            <div className="alert alert-info d-inline-block text-start max-w-lg mb-0" style={{ maxWidth: '600px' }}>
                                <strong>💡 Instrucciones del Stored Procedure:</strong>
                                <p className="small mb-0 mt-1">
                                    Para rellenar esta tabla usando tu procedimiento almacenado de MySQL, abre Workbench y corre:
                                    <br />
                                    <code className="text-warning">CALL GenerarNominaMensual('2026-05-31');</code>
                                    <br />
                                    Esto insertará el sueldo base, restará el 10% de impuestos y sumará el bono de $120.00 de todos tus empleados de forma automática.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>Empleado</th>
                                        <th>Fecha Pago</th>
                                        <th>Sueldo Base</th>
                                        <th className="text-danger">Deducciones (10%)</th>
                                        <th className="text-success">Bono Corp.</th>
                                        <th>Sueldo Neto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nominas.map((nom) => (
                                        <tr key={nom.idNomina}>
                                            <td className="fw-semibold text-light">{nom.nombre_empleado}</td>
                                            <td className="text-secondary">{nom.fecha_pago}</td>
                                            <td>
                                                <NumericFormat
                                                    value={nom.sueldo_base}
                                                    displayType="text"
                                                    thousandSeparator=","
                                                    decimalSeparator="."
                                                    prefix="$"
                                                    decimalScale={2}
                                                    fixedDecimalScale
                                                />
                                            </td>
                                            <td className="text-danger font-monospace">
                                                -<NumericFormat
                                                    value={nom.deducciones}
                                                    displayType="text"
                                                    thousandSeparator=","
                                                    decimalSeparator="."
                                                    prefix="$"
                                                    decimalScale={2}
                                                    fixedDecimalScale
                                                />
                                            </td>
                                            <td className="text-success font-monospace">
                                                +<NumericFormat
                                                    value={nom.bonos}
                                                    displayType="text"
                                                    thousandSeparator=","
                                                    decimalSeparator="."
                                                    prefix="$"
                                                    decimalScale={2}
                                                    fixedDecimalScale
                                                />
                                            </td>
                                            <td>
                                                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded d-inline-flex align-items-center gap-1">
                                                    <TrendingUp size={12} />
                                                    <NumericFormat
                                                        value={nom.sueldo_neto}
                                                        displayType="text"
                                                        thousandSeparator=","
                                                        decimalSeparator="."
                                                        prefix="$"
                                                        decimalScale={2}
                                                        fixedDecimalScale
                                                    />
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}