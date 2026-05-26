import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { obtenerDashboard } from './empleadosApi';
import ScrollableTable from '../components/ScrollableTable';
import { Users, Clock, AlertCircle, DollarSign, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const { user } = useAuth();
    const { tema } = useTheme();
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [chartHeight, setChartHeight] = useState(Math.min(300, window.innerHeight * 0.35));

    const cargarDashboard = async () => {
        try {
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarDashboard();
    }, []);

    useEffect(() => {
        const handleResize = () => setChartHeight(Math.min(300, window.innerHeight * 0.35));
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (cargando) return <div className="text-center py-5"><p className="text-secondary">Cargando panel de control...</p></div>;
    if (error) return <div className="alert alert-danger my-4">{error}</div>;
    if (!datos) return <div className="text-center py-5"><p className="text-secondary">No hay datos disponibles en el panel.</p></div>;

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

            {/* Grafico de empleados por departamento (solo admin) */}
            {!esEmpleado && datos?.empleados_por_departamento?.length > 0 && (
                <div className="row g-4 mb-5">
                    <div className="col-12">
                        <div className="card chart-card">
                            <div className="card-header">
                                <span className="text-dark fw-bold">Empleados por Departamento</span>
                            </div>
                            <div className="card-body">
                                <ResponsiveContainer width="100%" height={chartHeight}>
                                    <BarChart data={datos.empleados_por_departamento} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                        <XAxis
                                            dataKey="departamento"
                                            tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}
                                            axisLine={{ stroke: 'var(--border-color)' }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                background: tema === 'dark' ? '#252322' : '#FFFFFF',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: 10,
                                                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: 'var(--text-dark)',
                                            }}
                                            cursor={{ fill: tema === 'dark' ? 'rgba(233,105,68,0.08)' : 'rgba(233,105,68,0.04)' }}
                                        />
                                        <Bar
                                            dataKey="cantidad"
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={48}
                                            fill="var(--primary-terracotta)"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                            {(datos.ultimas_asistencias || []).length === 0 ? (
                                <div className="p-5 text-center">
                                    <p className="mb-0 text-secondary">No se han registrado asistencias el día de hoy.</p>
                                </div>
                            ) : (
                            <ScrollableTable>
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Empleado</th>
                                            <th>Fecha</th>
                                            <th>Hora Entrada</th>
                                            <th>Hora Salida</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(datos?.ultimas_asistencias || []).map((asist) => (
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
                            </ScrollableTable>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
