import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { obtenerDashboard } from './empleadosApi';
import { Users, Clock, AlertCircle, DollarSign, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';

export default function Dashboard() {
    const { user } = useAuth();
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    const cargarDashboard = async () => {
        try {
            setCargando(true);
            const { data } = await obtenerDashboard();
            setDatos(data);
        } catch (e) {
            console.error('Error al cargar dashboard:', e?.response?.data || e.message || e);
            setError(e?.response?.data?.error || 'No se pudieron obtener las estadisticas del Dashboard.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDashboard();
    }, []);

    if (cargando) return <div className="text-center py-5"><p className="text-secondary">Cargando panel de control...</p></div>;
    if (error) return <div className="alert alert-danger my-4">{error}</div>;

    const esEmpleado = datos?.es_empleado;

    return (
        <div className="container-fluid px-0 animate-fade-in">
            {/* Cabecera de bienvenida */}
            <div className="mb-4">
                <h1 className="text-dark mb-1">Bienvenido, {user?.username}</h1>
                <p className="text-muted mb-0">
                    {esEmpleado 
                        ? 'Este es tu resumen personal de asistencia y nómina para el mes actual.' 
                        : 'Bienvenido al panel general de Recursos Humanos de la organización.'
                    }
                </p>
            </div>

            {/* Indicadores clave (KPIs) */}
            <div className="row g-4 mb-5">
                {esEmpleado ? (
                    <>
                        {/* KPI Empleado 1 */}
                        <div className="col-md-4">
                            <div className="metric-card d-flex align-items-center justify-content-between">
                                <div>
                                    <div className="metric-title">Jornadas Asistidas</div>
                                    <div className="metric-value">{datos.total_asistencias}</div>
                                </div>
                                <div className="metric-icon-wrapper">
                                    <CheckCircle size={36} />
                                </div>
                            </div>
                        </div>
                        {/* KPI Empleado 2 */}
                        <div className="col-md-4">
                            <div className="metric-card d-flex align-items-center justify-content-between">
                                <div>
                                    <div className="metric-title">Retardos Acumulados</div>
                                    <div className="metric-value">{datos.retardos_acumulados}</div>
                                </div>
                                <div className="metric-icon-wrapper text-warning">
                                    <AlertTriangle size={36} />
                                </div>
                            </div>
                        </div>
                        {/* KPI Empleado 3 */}
                        <div className="col-md-4">
                            <div className="metric-card terracotta d-flex align-items-center justify-content-between">
                                <div>
                                    <div className="metric-title">Nómina Recibida (Mes)</div>
                                    <div className="metric-value">
                                        <NumericFormat
                                            value={datos.nomina_pagada_mes}
                                            displayType="text"
                                            thousandSeparator=","
                                            decimalSeparator="."
                                            prefix="$"
                                            decimalScale={2}
                                            fixedDecimalScale
                                        />
                                    </div>
                                </div>
                                <div className="metric-icon-wrapper">
                                    <DollarSign size={36} />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* KPI Admin 1 */}
                        <div className="col-md-3">
                            <div className="metric-card d-flex align-items-center justify-content-between">
                                <div>
                                    <div className="metric-title">Personal Activo</div>
                                    <div className="metric-value">{datos.total_empleados}</div>
                                </div>
                                <div className="metric-icon-wrapper">
                                    <Users size={32} />
                                </div>
                            </div>
                        </div>
                        {/* KPI Admin 2 */}
                        <div className="col-md-3">
                            <div className="metric-card d-flex align-items-center justify-content-between">
                                <div>
                                    <div className="metric-title">Asistencias Hoy</div>
                                    <div className="metric-value">{datos.asistencias_hoy}</div>
                                </div>
                                <div className="metric-icon-wrapper">
                                    <Clock size={32} />
                                </div>
                            </div>
                        </div>
                        {/* KPI Admin 3 */}
                        <div className="col-md-3">
                            <div className="metric-card d-flex align-items-center justify-content-between">
                                <div>
                                    <div className="metric-title">Retardos Hoy</div>
                                    <div className="metric-value">{datos.retardos_hoy}</div>
                                </div>
                                <div className="metric-icon-wrapper text-warning">
                                    <AlertCircle size={32} />
                                </div>
                            </div>
                        </div>
                        {/* KPI Admin 4 */}
                        <div className="col-md-3">
                            <div className="metric-card terracotta d-flex align-items-center justify-content-between">
                                <div>
                                    <div className="metric-title">Nómina Pagada (Mes)</div>
                                    <div className="metric-value">
                                        <NumericFormat
                                            value={datos.nomina_pagada_mes}
                                            displayType="text"
                                            thousandSeparator=","
                                            decimalSeparator="."
                                            prefix="$"
                                            decimalScale={2}
                                            fixedDecimalScale
                                        />
                                    </div>
                                </div>
                                <div className="metric-icon-wrapper">
                                    <DollarSign size={32} />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Seccion central: ultimas actividades */}
            <div className="row g-4">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <span className="text-dark fw-bold">
                                {esEmpleado ? 'Mi Historial de Asistencia Reciente' : 'Actividad del Checador de Hoy'}
                            </span>
                            <Link to="/asistencia" className="btn btn-secondary py-2 px-3 d-flex align-items-center gap-1.5" style={{ fontSize: '0.85rem' }}>
                                <span>Ver todo</span>
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="card-body p-0">
                            {datos.ultimas_asistencias.length === 0 ? (
                                <div className="p-5 text-center">
                                    <p className="mb-0 text-secondary">No se han registrado asistencias el día de hoy.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <th>Empleado</th>
                                                <th>Fecha</th>
                                                <th>Hora Entrada</th>
                                                <th>Hora Salida</th>
                                                <th>Estado (MySQL Trigger)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {datos.ultimas_asistencias.map((asist) => (
                                                <tr key={asist.idAsistencia}>
                                                    <td className="fw-semibold">{asist.nombre_empleado}</td>
                                                    <td className="text-secondary">{asist.fecha}</td>
                                                    <td className="font-monospace text-info">{asist.hora_entrada}</td>
                                                    <td className="font-monospace text-secondary">
                                                        {asist.hora_salida || '--:--:--'}
                                                    </td>
                                                    <td>
                                                        {asist.estado.includes('A Tiempo') ? (
                                                            <span className="badge-minimal active">
                                                                {asist.estado}
                                                            </span>
                                                        ) : (
                                                            <span className="badge-minimal inactive">
                                                                {asist.estado}
                                                            </span>
                                                        )}
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
            </div>
        </div>
    );
}
