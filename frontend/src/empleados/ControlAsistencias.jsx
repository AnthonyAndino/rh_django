// Attendance control page — two-panel layout.
// Left: "Checador" panel — employee selector (admin) or auto-assign (employee),
// Mark Entry / Mark Exit buttons (detects open attendance).
// Right: sortable/paginated attendance table with date range filters (admin),
// computed hours worked, and CSV export.
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { registrarEntrada, registrarSalida } from './empleadosApi';
import ScrollableTable from '../components/ScrollableTable';
import ThSortable from '../components/ThSortable';
import Pagination from '../components/Pagination';
import TomSelect from '../components/TomSelect';
import DatePicker from '../components/DatePicker';
import { Clock, UserCheck, Download } from 'lucide-react';
import asistenciasMock from '../mock/asistenciasMock';
import empleadosMock from '../mock/empleadosMock';

const POR_PAGINA = 8;

export default function ControlAsistencias() {
    const { user } = useAuth();
    const [empleados] = useState(empleadosMock);
    const [asistencias] = useState(asistenciasMock);
    const [cargando] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

    // Filters default to today's date to show current data
    const [filtroEmpleado, setFiltroEmpleado] = useState('');
    const hoy = new Date().toISOString().split('T')[0];
    const [fechaInicio, setFechaInicio] = useState(hoy);
    const [fechaFin, setFechaFin] = useState(hoy);

    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [paginaActual, setPaginaActual] = useState(1);

    const esEmpleado = user?.rol === 'empleado';

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPaginaActual(1);
    }, [filtroEmpleado, fechaInicio, fechaFin, sortField, sortDirection]);

    const empleadosOptions = useMemo(() => [
        { value: '', text: '-- Selecciona --' },
        ...empleados.map((emp) => ({
            value: String(emp.idEmpleado),
            text: `${emp.nombre} (${emp.puesto})`,
        })),
    ], [empleados]);

    const filtroEmpleadosOptions = useMemo(() => [
        { value: '', text: 'Filtrar Empleado' },
        ...empleados.map((emp) => ({
            value: String(emp.idEmpleado),
            text: emp.nombre,
        })),
    ], [empleados]);

    const cargarDatos = () => {};

    const obtenerAsistenciaAbiertaDeHoy = () => {
        const hoy = new Date().toISOString().split('T')[0];
        const empId = esEmpleado ? user?.idEmpleado : Number(empleadoSeleccionado);
        if (!empId) return null;

        return asistencias.find(
            (asist) => 
                asist.empleado === empId && 
                asist.fecha === hoy && 
                !asist.hora_salida
        );
    };

    const asistenciaAbierta = obtenerAsistenciaAbiertaDeHoy();

    const handleChecar = async (tipo) => {
        const empId = esEmpleado ? user?.idEmpleado : Number(empleadoSeleccionado);
        if (!empId && !esEmpleado) {
            setMensaje({ texto: 'Por favor selecciona un colaborador', tipo: 'danger' });
            return;
        }

        try {
            setGuardando(true);
            setMensaje({ texto: '', tipo: '' });

            const ahora = new Date();
            const fecha = ahora.toISOString().split('T')[0];
            const hora = ahora.toTimeString().split(' ')[0];

            if (tipo === 'entrada') {
                await registrarEntrada({
                    empleado: empId,
                    fecha: fecha,
                    hora_entrada: hora
                });
                setMensaje({
                    texto: '¡Entrada registrada con éxito! El sistema evaluó tu estado.',
                    tipo: 'success'
                });
            } else if (tipo === 'salida') {
                if (!asistenciaAbierta) {
                    setMensaje({ texto: 'No se encontró un registro de entrada abierto para hoy.', tipo: 'danger' });
                    return;
                }
                
                await registrarSalida(asistenciaAbierta.idAsistencia, hora);
                setMensaje({
                    texto: '¡Salida registrada con éxito! La jornada del día de hoy ha sido completada.',
                    tipo: 'success'
                });
            }

            setEmpleadoSeleccionado('');
            await cargarDatos();
        } catch (err) {
            setMensaje({
                texto: err.response?.data?.error || 'No se pudo realizar el marcaje. ¿Ya completaste tu jornada hoy?',
                tipo: 'danger'
            });
        } finally {
            setGuardando(false);
        }
    };

    const calcularHorasTrabajadas = (entrada, salida) => {
        if (!entrada || !salida) return null;
        const [h1, m1, s1] = entrada.split(':').map(Number);
        const [h2, m2, s2] = salida.split(':').map(Number);
        const d1 = new Date(2000, 0, 1, h1, m1, s1);
        const d2 = new Date(2000, 0, 1, h2, m2, s2);
        const diffMs = d2 - d1;
        if (diffMs < 0) return 0;
        return diffMs / (1000 * 60 * 60);
    };

    const totalJornadas = asistencias.length;
    const totalRetardos = asistencias.filter(a => a.estado.includes('Retardo')).length;
    
    const totalHorasLaboradas = asistencias.reduce((acc, asist) => {
        const horas = calcularHorasTrabajadas(asist.hora_entrada, asist.hora_salida);
        return acc + (horas || 0);
    }, 0);

    const ordenar = (campo) => {
        if (sortField === campo) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(campo);
            setSortDirection('asc');
        }
        setPaginaActual(1);
    };

    const asistenciasConHoras = useMemo(() =>
        asistencias.map(a => ({
            ...a,
            _horas: calcularHorasTrabajadas(a.hora_entrada, a.hora_salida)
        })),
    [asistencias]);

    const asistenciasOrdenadas = useMemo(() => {
        if (!sortField) return asistenciasConHoras;
        return [...asistenciasConHoras].sort((a, b) => {
            let valA, valB;
            if (sortField === '_horas') {
                valA = a._horas ?? -1;
                valB = b._horas ?? -1;
            } else {
                valA = a[sortField];
                valB = b[sortField];
                valA = String(valA || '').toLowerCase();
                valB = String(valB || '').toLowerCase();
            }
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [asistenciasConHoras, sortField, sortDirection]);

    const totalPaginas = Math.max(1, Math.ceil(asistenciasOrdenadas.length / POR_PAGINA));
    const paginaSegura = Math.min(paginaActual, totalPaginas);
    const inicio = (paginaSegura - 1) * POR_PAGINA;
    const fin = Math.min(inicio + POR_PAGINA, asistenciasOrdenadas.length);
    const asistenciasPagina = asistenciasOrdenadas.slice(inicio, fin);

    const exportarCSV = () => {
        if (asistenciasOrdenadas.length === 0) return;

        let contenidoCSV = "ID Asistencia,Empleado,Fecha,Hora Entrada,Hora Salida,Horas Trabajadas,Estado\n";

        asistenciasOrdenadas.forEach(a => {
            const horasTexto = a._horas ? `${a._horas.toFixed(1)} hrs` : '--';
            const salida = a.hora_salida || 'Sin registrar';
            contenidoCSV += `${a.idAsistencia},"${a.nombre_empleado}",${a.fecha},${a.hora_entrada},${salida},${horasTexto},"${a.estado}"\n`;
        });

        const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Reporte_Asistencias_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (cargando) return <div className="text-center py-5"><p className="text-secondary">Cargando módulo de asistencia...</p></div>;

    return (
        <div className="container-fluid px-0 animate-fade-in">
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                <div>
                    <h1 className="text-dark mb-1">Registro de Asistencia</h1>
                    <p className="text-muted mb-0">Monitorea y checa las horas de entrada y salida del personal.</p>
                </div>
            </div>

            <div className="row g-4 mb-4">
                {/* KPI cards */}
                <div className="col-md-4">
                    <div className="metric-card">
                        <div className="metric-title">Jornadas Evaluadas</div>
                        <div className="metric-value">{totalJornadas} días</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="metric-card">
                        <div className="metric-title">Total de Retardos</div>
                        <div className="metric-value text-danger">{totalRetardos}</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="metric-card terracotta">
                        <div className="metric-title">Horas Trabajadas Sumadas</div>
                        <div className="metric-value">{totalHorasLaboradas.toFixed(1)} hrs</div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Checador Panel */}
                <div className="col-lg-4 col-md-12">
                    <div className="card">
                        <div className="card-header d-flex align-items-center gap-2">
                            <Clock className="text-primary" size={20} />
                            <span>Checador Corporativo</span>
                        </div>
                        <div className="card-body">
                            <p className="text-secondary small mb-4">
                                {esEmpleado 
                                    ? 'Hola. Aquí puedes registrar tu entrada diaria y marcar la salida al culminar tus labores.'
                                    : 'Selecciona al empleado y realiza el marcaje de entrada o salida correspondiente para su registro.'
                                }
                            </p>

                            {mensaje.texto && (
                                <div className={`alert alert-${mensaje.tipo} mb-3`} role="alert">
                                    {mensaje.texto}
                                </div>
                            )}

                            {!esEmpleado && (
                                <div className="mb-4">
                                    <label className="form-label">Colaborador</label>
                                    <TomSelect
                                        value={empleadoSeleccionado}
                                        onChange={setEmpleadoSeleccionado}
                                        options={empleadosOptions}
                                        placeholder="-- Selecciona --"
                                    />
                                </div>
                            )}

                            <div className="d-flex flex-column gap-3">
                                {asistenciaAbierta ? (
                                    <button 
                                        type="button" 
                                        className="btn btn-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                                        style={{ backgroundColor: '#D55734' }}
                                        onClick={() => handleChecar('salida')}
                                        disabled={guardando}
                                    >
                                        <Clock size={20} />
                                        {guardando ? 'Registrando...' : 'Marcar Hora de Salida'}
                                    </button>
                                ) : (
                                    <button 
                                        type="button" 
                                        className="btn btn-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                                        onClick={() => handleChecar('entrada')}
                                        disabled={guardando || (esEmpleado && !user?.idEmpleado)}
                                    >
                                        <UserCheck size={20} />
                                        {guardando ? 'Registrando...' : 'Marcar Hora de Entrada'}
                                    </button>
                                )}

                                {esEmpleado && !user?.idEmpleado && (
                                    <div className="alert alert-warning small rounded-3 py-2 mt-2">
                                        Tu cuenta no está asociada a ningún empleado. Pide a un Administrador que te asocie.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendance Table Panel */}
                <div className="col-lg-8 col-md-12">
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <span className="fw-bold">
                                    Historial de Registros
                                    <span className="text-muted fw-normal ms-1">({asistenciasOrdenadas.length} Total)</span>
                                </span>
                                
                                {!esEmpleado && (
                                    <>
                                        <div style={{ minWidth: '140px' }}>
                                            <TomSelect
                                                value={filtroEmpleado}
                                                onChange={setFiltroEmpleado}
                                                options={filtroEmpleadosOptions}
                                                placeholder="Filtrar Empleado"
                                            />
                                        </div>
                                        
                                        <div style={{ width: '152px' }}>
                                            <DatePicker
                                                value={fechaInicio}
                                                onChange={setFechaInicio}
                                                placeholder="Fecha inicio"
                                                compact
                                            />
                                        </div>
                                        <div style={{ width: '152px' }}>
                                            <DatePicker
                                                value={fechaFin}
                                                onChange={setFechaFin}
                                                placeholder="Fecha fin"
                                                compact
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            
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
                        </div>
                        
                        <div className="card-body p-0">
                            {asistenciasPagina.length === 0 ? (
                                <div className="p-5 text-center">
                                    <p className="mb-0 text-secondary">No se encontraron asistencias en el rango de búsqueda.</p>
                                </div>
                            ) : (
                                <>
                                <ScrollableTable>
                                    <table className="table table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <ThSortable campo="nombre_empleado" sortField={sortField} sortDirection={sortDirection} onSort={ordenar}>Empleado</ThSortable>
                                                <ThSortable campo="fecha" sortField={sortField} sortDirection={sortDirection} onSort={ordenar}>Fecha</ThSortable>
                                                <ThSortable campo="hora_entrada" sortField={sortField} sortDirection={sortDirection} onSort={ordenar}>Entrada</ThSortable>
                                                <ThSortable campo="hora_salida" sortField={sortField} sortDirection={sortDirection} onSort={ordenar}>Salida</ThSortable>
                                                <ThSortable campo="_horas" sortField={sortField} sortDirection={sortDirection} onSort={ordenar}>Horas</ThSortable>
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
                                                    <td className="fw-bold">
                                                        {asist._horas ? `${asist._horas.toFixed(1)} hrs` : '--'}
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
