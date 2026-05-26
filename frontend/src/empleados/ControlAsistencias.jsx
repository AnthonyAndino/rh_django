import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { obtenerEmpleados, obtenerAsistencias, registrarEntrada, registrarSalida } from './empleadosApi';
import ScrollableTable from '../components/ScrollableTable';
import TomSelect from '../components/TomSelect';
import DatePicker from '../components/DatePicker';
import { Clock, UserCheck, Download } from 'lucide-react';

export default function ControlAsistencias() {
    const { user } = useAuth();
    const [empleados, setEmpleados] = useState([]);
    const [asistencias, setAsistencias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    // Selección de empleado para registrar asistencia
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

    // Filtros de Reporte (Para administradores)
    const [filtroEmpleado, setFiltroEmpleado] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    const esEmpleado = user?.rol === 'empleado';

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

    const cargarDatos = async () => {
        try {
            // Cargar empleados para los selectores (Solo administradores)
            if (!esEmpleado) {
                const resEmp = await obtenerEmpleados();
                setEmpleados(resEmp.data);
            }

            // Usar el helper con parámetros de filtro
            const resAsist = await obtenerAsistencias(
                !esEmpleado
                    ? { empleado_id: filtroEmpleado, fecha_inicio: fechaInicio, fecha_fin: fechaFin }
                    : {}
            );
            setAsistencias(resAsist.data);
        } catch (e) {
            console.error("Error al cargar datos", e);
        }
    };

    useEffect(() => {
        const boot = async () => {
            setCargando(true);
            await cargarDatos();
            setCargando(false);
        };
        boot();
    }, [filtroEmpleado, fechaInicio, fechaFin]);

    // Verificar si el empleado seleccionado ya checó hoy y no ha salido
    const obtenerAsistenciaAbiertaDeHoy = () => {
        const hoy = new Date().toISOString().split('T')[0];
        const empId = esEmpleado ? user?.idEmpleado : Number(empleadoSeleccionado);
        if (!empId) return null;

        // Buscamos un registro de hoy para este empleado que NO tenga hora_salida
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

    // --- LECCIÓN DE JS: CALCULAR HORAS LABORADAS ---
    const calcularHorasTrabajadas = (entrada, salida) => {
        if (!entrada || !salida) return null;
        const [h1, m1, s1] = entrada.split(':').map(Number);
        const [h2, m2, s2] = salida.split(':').map(Number);
        const d1 = new Date(2000, 0, 1, h1, m1, s1);
        const d2 = new Date(2000, 0, 1, h2, m2, s2);
        const diffMs = d2 - d1;
        if (diffMs < 0) return 0;
        return diffMs / (1000 * 60 * 60); // Retorna horas en número decimal
    };

    // --- CÁLCULO DE RESUMEN PARA EL REPORTE ---
    const totalJornadas = asistencias.length;
    const totalRetardos = asistencias.filter(a => a.estado.includes('Retardo')).length;
    
    const totalHorasLaboradas = asistencias.reduce((acc, asist) => {
        const horas = calcularHorasTrabajadas(asist.hora_entrada, asist.hora_salida);
        return acc + (horas || 0);
    }, 0);

    // --- EXPORTACIÓN DE REPORTES A CSV (Sin librerías externas) ---
    const exportarCSV = () => {
        if (asistencias.length === 0) return;

        // Cabeceras del CSV
        let contenidoCSV = "ID Asistencia,Empleado,Fecha,Hora Entrada,Hora Salida,Horas Trabajadas,Estado\n";

        asistencias.forEach(a => {
            const horas = calcularHorasTrabajadas(a.hora_entrada, a.hora_salida);
            const horasTexto = horas ? `${horas.toFixed(1)} hrs` : '--';
            const salida = a.hora_salida || 'Sin registrar';
            contenidoCSV += `${a.idAsistencia},"${a.nombre_empleado}",${a.fecha},${a.hora_entrada},${salida},${horasTexto},"${a.estado}"\n`;
        });

        // Crear elemento invisible para descargar
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
            {/* Cabecera y botón exportar */}
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                <div>
                    <h1 className="text-dark mb-1">Registro de Asistencia</h1>
                    <p className="text-muted mb-0">Monitorea y checa las horas de entrada y salida del personal.</p>
                </div>
                {asistencias.length > 0 && (
                    <button 
                        onClick={exportarCSV} 
                        className="btn btn-secondary py-2 px-3 d-flex align-items-center gap-2"
                        style={{ fontSize: '0.9rem' }}
                    >
                        <Download size={16} />
                        Exportar CSV
                    </button>
                )}
            </div>

            {/* SECCIÓN DE RESUMEN (DASHBOARD REPORT CARDS) */}
            <div className="row g-4 mb-4">
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
                {/* Panel del checador */}
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

                            {/* Selector de empleado (Solo para Administrador) */}
                            {!esEmpleado && (
                                <div className="mb-4">
                                    <label className="form-label">Colaborador</label>
                                    <TomSelect
                                        value={empleadoSeleccionado}
                                        onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
                                        options={empleadosOptions}
                                        placeholder="-- Selecciona --"
                                    />
                                </div>
                            )}

                            {/* Botones de Entrada / Salida dinámicos */}
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

                {/* Listado e historial de asistencias */}
                <div className="col-lg-8 col-md-12">
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <span className="fw-bold">Historial de Registros</span>
                            
                            {/* FILTROS EN CABECERA (Solo administradores) */}
                            {!esEmpleado && (
                                <div className="d-flex align-items-center gap-2 flex-wrap" style={{ fontSize: '0.8rem' }}>
                                    <div style={{ minWidth: '140px' }}>
                                        <TomSelect
                                            value={filtroEmpleado}
                                            onChange={(e) => setFiltroEmpleado(e.target.value)}
                                            options={filtroEmpleadosOptions}
                                            placeholder="Filtrar Empleado"
                                        />
                                    </div>
                                    
                                    <div className="datepicker-compact">
                                        <DatePicker
                                            value={fechaInicio}
                                            onChange={(e) => setFechaInicio(e.target.value)}
                                            placeholder="Fecha inicio"
                                        />
                                    </div>
                                    <div className="datepicker-compact">
                                        <DatePicker
                                            value={fechaFin}
                                            onChange={(e) => setFechaFin(e.target.value)}
                                            placeholder="Fecha fin"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="card-body p-0">
                            {asistencias.length === 0 ? (
                                <div className="p-5 text-center">
                                    <p className="mb-0 text-secondary">No se encontraron asistencias en el rango de búsqueda.</p>
                                </div>
                            ) : (
                                <ScrollableTable>
                                    <table className="table table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <th>Empleado</th>
                                                <th>Fecha</th>
                                                <th>Entrada</th>
                                                <th>Salida</th>
                                                <th>Horas</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {asistencias.map((asist) => {
                                                const horas = calcularHorasTrabajadas(asist.hora_entrada, asist.hora_salida);
                                                return (
                                                    <tr key={asist.idAsistencia}>
                                                        <td className="fw-semibold">{asist.nombre_empleado}</td>
                                                        <td className="text-secondary">{asist.fecha}</td>
                                                        <td className="font-monospace text-info">{asist.hora_entrada}</td>
                                                        <td className="font-monospace text-secondary">
                                                            {asist.hora_salida || '--:--:--'}
                                                        </td>
                                                        <td className="fw-bold">
                                                            {horas ? `${horas.toFixed(1)} hrs` : '--'}
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
                                                );
                                            })}
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