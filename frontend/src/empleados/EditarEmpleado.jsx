import { useEffect, useState } from 'react'
import axios from 'axios'
import { NumericFormat } from 'react-number-format'
import { useNavigate, useParams } from 'react-router-dom'
import { urlBase } from '../config'

export default function EditarEmpleado() {
    const { idEmpleado } = useParams()
    const navigate = useNavigate()

    const [nombre, setNombre] = useState('')
    const [departamento, setDepartamento] = useState('')
    const [sueldo, setSueldo] = useState(0)
    const [cargando, setCargando] = useState(true)
    const [enviando, setEnviando] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const cargar = async () => {
            try {
                const { data } = await axios.get(`${urlBase}/${idEmpleado}`)
                setNombre(data?.nombre ?? '')
                setDepartamento(data?.departamento ?? '')
                setSueldo(Number(data?.sueldo) || 0)
            } catch (e) {
                setError('No se pudo cargar el empleado')
            } finally {
                setCargando(false)
            }
        }
        cargar()
    }, [idEmpleado])

    const onSubmit = async (e) => {
        e.preventDefault()
        setError('')

        const nombreOk = nombre.trim()
        const deptoOk = departamento.trim()
        const sueldoOk = Number(sueldo) || 0

        if (!nombreOk || !deptoOk || sueldoOk <= 0) {
            setError('Completa Nombre, departamento y un sueldo mayor a 0.')
            return
        }

        try {
            setEnviando(true)
            await axios.put(`${urlBase}/${idEmpleado}`, {
                nombre: nombreOk,
                departamento: deptoOk,
                sueldo: sueldoOk
            })
            navigate('/')
        } catch (err) {
            setError('No se pudo guardar los cambios del empleado')
        } finally {
            setEnviando(false)
        }
    }

    if (cargando) {
        return <p className="text-secondary">Cargando...</p>
    }

    return (
        <div className="card">
            <div className="card-header">
                <strong>Editar empleado #{idEmpleado}</strong>
            </div>
            <div className="card-body">
                {error && <div className="alert alert-danger mb-3">{error}</div>}

                <form onSubmit={onSubmit} className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">Nombre</label>
                        <input 
                            className="form-control"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Nombre completo"
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Departamento</label>
                        <input 
                            className="form-control"
                            value={departamento}
                            onChange={(e) => setDepartamento(e.target.value)}
                            placeholder="Area o departamento"
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Sueldo</label>
                        <NumericFormat 
                            className="form-control"
                            value={sueldo}
                            thousandSeparator=","
                            decimalSeparator="."
                            decimalScale={2}
                            fixedDecimalScale
                            allowNegative={false}
                            prefix="$"
                            onValueChange={({ floatValue }) => setSueldo(floatValue ?? 0)}
                        />
                    </div>

                    <div className="col-12 d-flex gap-2">
                        <button type="submit" className="btn btn-primary" disabled={enviando}>
                            {enviando ? 'Guardando...' : 'Guardar'} 
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                            Regresar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
