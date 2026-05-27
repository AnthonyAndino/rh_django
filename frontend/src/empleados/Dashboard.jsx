// Dashboard page — admin sees 4 KPI cards, a department bar chart (Recharts),
// and a sortable/paginated attendance table with CSV export.
// Employee sees personal stats (attendance count, lates, monthly pay).
// Currently uses mock data.
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import ScrollableTable from '../components/ScrollableTable';
import ThSortable from '../components/ThSortable';
import Pagination from '../components/Pagination';
import { Users, Clock, AlertCircle, DollarSign, ArrowRight, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import asistenciasMock from '../mock/asistenciasMock';

const POR_PAGINA = 8;

const datosMock = {
  es_empleado: false,
  total_empleados: 50,
  asistencias_hoy: 38,
  retardos_hoy: 5,
  nomina_pagada_mes: 1850000,
  total_asistencias: 150,
  retardos_acumulados: 22,
  empleados_por_departamento: [
    { departamento: 'Tecnología', cantidad: 15 },
    { departamento: 'Ventas', cantidad: 10 },
    { departamento: 'Contabilidad', cantidad: 8 },
    { departamento: 'Recursos Humanos', cantidad: 6 },
    { departamento: 'Mercadotecnia', cantidad: 5 },
    { departamento: 'Operaciones', cantidad: 4 },
    { departamento: 'Legal', cantidad: 2 },
  ],
  ultimas_asistencias: asistenciasMock,
};

export default function Dashboard() {
    const { user } = useAuth();
    const { tema } = useTheme();
    const [datos] = useState(datosMock);
    const [cargando] = useState(false);
    const [error] = useState('');
    const [chartHeight, setChartHeight] = useState(Math.min(300, window.innerHeight * 0.35));

    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [paginaActual, setPaginaActual] = useState(1);

    useEffect(() => {
        const handleResize = () => setChartHeight(Math.min(300, window.innerHeight * 0.35));
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPaginaActual(1);
    }, [sortField, sortDirection, datos?.ultimas_asistencias]);

    const ordenar = (campo) => {
        if (sortField === campo) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(campo);
            setSortDirection('asc');
        }
        setPaginaActual(1);
    };

    const asistencias = datos?.ultimas_asistencias || [];

    const asistenciasOrdenadas = (() => {
        if (!sortField) return asistencias;
        return [...asistencias].sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];
            valA = String(valA || '').toLowerCase();
            valB = String(valB || '').toLowerCase();
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    })();

    const totalPaginas = Math.max(1, Math.ceil(asistenciasOrdenadas.length / POR_PAGINA));
    const paginaSegura = Math.min(paginaActual, totalPaginas);
    const inicio = (paginaSegura - 1) * POR_PAGINA;
    const fin = Math.min(inicio + POR_PAGINA, asistenciasOrdenadas.length);
    const asistenciasPagina = asistenciasOrdenadas.slice(inicio, fin);

    const exportarCSV = () => {
        if (asistenciasOrdenadas.length === 0) return;
        const cabeceras = ['Empleado', 'Fecha', 'Hora Entrada', 'Hora Salida', 'Estado'];
        const filas = asistenciasOrdenadas.map(a => [
            `"${a.nombre_empleado}"`,
            a.fecha,
            a.hora_entrada,
            a.hora_salida || '--:--:--',
            `"${a.estado}"`
        ]);
        const csv = [cabeceras.join(','), ...filas.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asistencias_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (cargando) return <div className="text-center py-5"><p className="text-secondary">Cargando panel de control...</p></div>;
    if (error) return <div className="alert alert-danger my-4">{error}</div>;
    if (!datos) return <div className="text-center py-5"><p className="text-secondary">No hay datos disponibles en el panel.</p></div>;

    const esEmpleado = datos?.es_empleado;

    return (
        <div className="container-fluid px-0 animate-fade-in">
            <div className="mb-4">
                <h1 className="text-dark mb-1">Bienvenido, {user?.username}</h1>
                <p className="text-muted mb-0">
                    {esEmpleado 
                        ? 'Este es tu resumen personal de asistencia y nómina para el mes actual.' 
                        : 'Bienvenido al panel general de Recursos Humanos de la organización.'
                    }
                </p>
            </div>

            {/* KPI cards — different sets for admin vs employee */}
            <div className="row g-4 mb-5">
                {esEmpleado ? (
                    <>
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

            {/* Department chart (admin only) */}
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

            {/* Recent attendance table */}
            <div className="row g-4">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <span className="text-dark fw-bold">
                                {esEmpleado ? 'Mi Historial de Asistencia Reciente' : 'Actividad del Checador de Hoy'}
                                <span className="text-muted fw-normal ms-1">({asistenciasOrdenadas.length} Total)</span>
                            </span>
                            <div className="d-flex align-items-center gap-2">
                                {asistenciasOrdenadas.length > 0 && (
                                    <button
                                        onClick={exportarCSV}
                                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                                        style={{ borderRadius: 'var(--border-radius-md)' }}
                                    >
                                        <Download size={14} />
                                        Exportar
                                    </button>
                                )}
                                <Link to="/asistencia" className="btn btn-secondary py-2 px-3 d-flex align-items-center gap-1.5" style={{ fontSize: '0.85rem' }}>
                                    <span>Ver todo</span>
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            {asistenciasPagina.length === 0 ? (
                                <div className="p-5 text-center">
                                    <p className="mb-0 text-secondary">No se han registrado asistencias el día de hoy.</p>
                                </div>
                            ) : (
                            <>
                            <ScrollableTable>
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <ThSortable campo="nombre_empleado" sortField={sortField} sortDirection={sortDirection} onSort={ordenar}>Empleado</ThSortable>
                                            <ThSortable campo="fecha" sortField={sortField} sortDirection={sortDirection} onSort={ordenar}>Fecha</ThSortable>
                                            <ThSortable campo="hora_entrada" sortField={sortField} sortDirection={sortDirection} onSort={ordenar}>Hora Entrada</ThSortable>
                                            <ThSortable campo="hora_salida" sortField={sortField} sortDirection={sortDirection} onSort={ordenar}>Hora Salida</ThSortable>
                                            <ThSortable campo="estado" sortField={sortField} sortDirection={sortDirection} onSort={ordenar}>Estado</ThSortable>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {asistenciasPagina.map((asist) => (
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

                            <Pagination
                                paginaActual={paginaSegura}
                                totalPaginas={totalPaginas}
                                onPageChange={setPaginaActual}
                                total={asistenciasOrdenadas.length}
                                inicio={inicio}
                                fin={fin}
                            />
                            </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
