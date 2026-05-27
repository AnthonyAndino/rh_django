// Employee directory (admin-only) — searchable, filterable, sortable, paginated table.
// Features: 3 KPI metric cards, live search (name/puesto/departamento),
// department + status filter dropdowns, Edit/Delete actions, CSV export.
import { useEffect, useState, useMemo, useCallback } from 'react';
import { NumericFormat } from 'react-number-format';
import { Link } from "react-router-dom";
import { eliminarEmpleado } from './empleadosApi';
import { useAuth } from '../AuthContext';
import ScrollableTable from '../components/ScrollableTable';
import ThSortable from '../components/ThSortable';
import Pagination from '../components/Pagination';
import TomSelect from '../components/TomSelect';
import { Users, DollarSign, Activity, Search, UserPlus, Edit3, Trash2, Download } from 'lucide-react';
import empleadosMock from '../mock/empleadosMock';

const POR_PAGINA = 8;

export default function ListadoEmpleados() {
    const { user } = useAuth();
    const [empleados] = useState(empleadosMock);
    const [cargando] = useState(false);
    const [error] = useState('');
    const [eliminandoId, setEliminandoId] = useState(null);

    const [busqueda, setBusqueda] = useState('');
    const [filtroDepto, setFiltroDepto] = useState('');
    const [filtroEstatus, setFiltroEstatus] = useState('');

    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const [paginaActual, setPaginaActual] = useState(1);

    const esAdmin = user?.rol === 'admin';

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPaginaActual(1);
    }, [busqueda, filtroDepto, filtroEstatus]);

    const eliminar = async (idEmpleado) => {
        const ok = window.confirm('¿Seguro que deseas eliminar este empleado?');
        if (!ok) return;
        
        try {
            setEliminandoId(idEmpleado);
            await eliminarEmpleado(idEmpleado);
        } catch (e) {
            console.error("Error al eliminar empleado:", e);
            alert('No se pudo eliminar el empleado.');
        } finally {
            setEliminandoId(null);
        }
    };

    const ordenar = (campo) => {
        if (sortField === campo) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(campo);
            setSortDirection('asc');
        }
        setPaginaActual(1);
    };

    const departamentosUnicos = Array.from(
        new Set(empleados.map((e) => e.departamento).filter(Boolean))
    );
    const deptosOptions = useMemo(() => [
        { value: '', text: 'Todos los Departamentos' },
        ...departamentosUnicos.map((d) => ({ value: d, text: d })),
    ], [departamentosUnicos]);
    const estatusOptions = useMemo(() => [
        { value: '', text: 'Todos los Estatus' },
        { value: 'Activo', text: 'Activo' },
        { value: 'Inactivo', text: 'Inactivo' },
        { value: 'Suspendido', text: 'Suspendido' },
    ], []);

    // KPI metrics
    const totalEmpleados = empleados.filter(e => e.estatus === 'Activo').length;
    const nominaTotal = empleados.reduce((acc, emp) => acc + Number(emp.sueldo), 0);
    const sueldoPromedio = empleados.length > 0 ? (nominaTotal / empleados.length) : 0;

    // Live filtering
    const empleadosFiltrados = empleados.filter((e) => {
        const matchesBusqueda = 
            e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            e.puesto.toLowerCase().includes(busqueda.toLowerCase()) ||
            e.departamento.toLowerCase().includes(busqueda.toLowerCase());
            
        const matchesDepto = filtroDepto ? e.departamento === filtroDepto : true;
        const matchesEstatus = filtroEstatus ? e.estatus === filtroEstatus : true;

        return matchesBusqueda && matchesDepto && matchesEstatus;
    });

    // Sorting
    const empleadosOrdenados = useMemo(() => {
        if (!sortField) return empleadosFiltrados;
        return [...empleadosFiltrados].sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];
            if (sortField === 'sueldo') {
                valA = Number(valA);
                valB = Number(valB);
            } else if (sortField === 'idEmpleado') {
                valA = Number(valA);
                valB = Number(valB);
            } else {
                valA = String(valA || '').toLowerCase();
                valB = String(valB || '').toLowerCase();
            }
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [empleadosFiltrados, sortField, sortDirection]);

    // Pagination
    const totalPaginas = Math.max(1, Math.ceil(empleadosOrdenados.length / POR_PAGINA));
    const paginaSegura = Math.min(paginaActual, totalPaginas);
    const inicio = (paginaSegura - 1) * POR_PAGINA;
    const fin = Math.min(inicio + POR_PAGINA, empleadosOrdenados.length);
    const empleadosPagina = empleadosOrdenados.slice(inicio, fin);

    // CSV export
    const exportarCSV = useCallback(() => {
        const cabeceras = ['ID', 'Nombre', 'Puesto', 'Departamento', 'Sueldo', 'Estatus'];
        const filas = empleadosOrdenados.map(e => [
            e.idEmpleado,
            `"${e.nombre}"`,
            `"${e.puesto}"`,
            `"${e.departamento}"`,
            e.sueldo,
            e.estatus
        ]);
        const csv = [cabeceras.join(','), ...filas.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'empleados.csv';
        a.click();
        URL.revokeObjectURL(url);
    }, [empleadosOrdenados]);

    if (cargando) return <div className="text-center py-5"><p className="text-secondary">Cargando...</p></div>;
    if (error) return <div className="alert alert-danger my-4">{error}</div>;

    return (
        <div className="container-fluid px-0 animate-fade-in">
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                <div>
                    <h1 className="text-dark mb-1">Directorio de Personal</h1>
                    <p className="text-muted mb-0">Administra los perfiles, contratos y roles de tu equipo corporativo.</p>
                </div>
                {esAdmin && (
                    <Link to="/agregar" className="btn btn-primary d-flex align-items-center gap-2">
                        <UserPlus size={18} />
                        Agregar Colaborador
                    </Link>
                )}
            </div>

            {/* KPI cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="metric-card d-flex align-items-center justify-content-between">
                        <div>
                            <div className="metric-title">Empleados Activos</div>
                            <div className="metric-value">{totalEmpleados}</div>
                        </div>
                        <div className="metric-icon-wrapper">
                            <Users size={32} />
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="metric-card d-flex align-items-center justify-content-between">
                        <div>
                            <div className="metric-title">Presupuesto Mensual</div>
                            <div className="metric-value">
                                <NumericFormat
                                    value={nominaTotal}
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
                <div className="col-md-4">
                    <div className="metric-card terracotta d-flex align-items-center justify-content-between">
                        <div>
                            <div className="metric-title">Salario Promedio</div>
                            <div className="metric-value">
                                <NumericFormat
                                    value={sueldoPromedio}
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
                            <Activity size={32} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search + filter bar */}
            <div className="row mb-4 g-3 align-items-center">
                <div className="col-lg-6 col-md-12">
                    <div className="input-search-wrapper">
                        <Search size={18} className="input-search-icon" />
                        <input
                            type="text"
                            className="form-control input-search-field"
                            placeholder="Buscar por nombre, puesto o departamento..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="col-lg-3 col-md-6">
                    <TomSelect
                        value={filtroDepto}
                        onChange={setFiltroDepto}
                        options={deptosOptions}
                        placeholder="Todos los Departamentos"
                    />
                </div>

                <div className="col-lg-3 col-md-6">
                    <TomSelect
                        value={filtroEstatus}
                        onChange={setFiltroEstatus}
                        options={estatusOptions}
                        placeholder="Todos los Estatus"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <span>
                        Listado de Personal{' '}
                        <span className="text-muted fw-normal">
                            ({empleadosOrdenados.length} Total)
                        </span>
                    </span>
                    <button
                        onClick={exportarCSV}
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                        style={{ borderRadius: 'var(--border-radius-md)' }}
                    >
                        <Download size={14} />
                        Exportar
                    </button>
                </div>
                <div className="card-body p-0">
                    {empleadosPagina.length === 0 ? (
                        <div className="p-5 text-center">
                            <p className="mb-0 text-secondary">No se encontraron empleados con las condiciones especificadas.</p>
                        </div>
                    ) : (
                        <>
                        <ScrollableTable>
                            <table className="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <ThSortable campo="idEmpleado" sortField={sortField} sortDirection={sortDirection} onSort={ordenar} style={{ width: 80 }}>ID</ThSortable>
                                        <ThSortable campo="nombre" sortField={sortField} sortDirection={sortDirection} onSort={ordenar}>Empleado</ThSortable>
                                        <ThSortable campo="puesto" sortField={sortField} sortDirection={sortDirection} onSort={ordenar}>Puesto / Área</ThSortable>
                                        <ThSortable campo="sueldo" sortField={sortField} sortDirection={sortDirection} onSort={ordenar}>Sueldo Mensual</ThSortable>
                                        <ThSortable campo="estatus" sortField={sortField} sortDirection={sortDirection} onSort={ordenar}>Estatus</ThSortable>
                                        {esAdmin && <th style={{ width: 180 }} className="text-end">Acciones</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {empleadosPagina.map((e) => (
                                        <tr key={e.idEmpleado}>
                                            <td className="text-secondary font-monospace">#{e.idEmpleado}</td>
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    {e.foto_perfil ? (
                                                        <img 
                                                            src={e.foto_perfil} 
                                                            alt="perfil" 
                                                            className="rounded-circle"
                                                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center fw-bold text-primary" style={{ width: '40px', height: '40px' }}>
                                                            {e.nombre.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="fw-semibold">{e.nombre}</div>
                                                        <div className="small text-secondary">{e.correo_corporativo || 'Sin correo registrado'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="fw-medium">{e.puesto}</div>
                                                    <div className="small text-secondary">{e.departamento}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <strong className="text-info">
                                                    <NumericFormat
                                                        value={e.sueldo}
                                                        displayType="text"
                                                        thousandSeparator=","
                                                        decimalSeparator="."
                                                        prefix="$"
                                                        decimalScale={2}
                                                        fixedDecimalScale
                                                    />
                                                </strong>
                                            </td>
                                            <td>
                                                {e.estatus === 'Activo' && (
                                                    <span className="badge-minimal active">Activo</span>
                                                )}
                                                {e.estatus === 'Inactivo' && (
                                                    <span className="badge-minimal inactive">Inactivo</span>
                                                )}
                                                {e.estatus === 'Suspendido' && (
                                                    <span className="badge-minimal suspended">Suspendido</span>
                                                )}
                                            </td>
                                            {esAdmin && (
                                                <td className="text-end">
                                                    <Link to={`/editar/${e.idEmpleado}`} className="btn btn-sm btn-outline-light border-0 me-2 py-1.5 px-3 d-inline-flex align-items-center gap-1.5">
                                                        <Edit3 size={14} />
                                                        Editar
                                                    </Link>
                                                    <button 
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger border-0 py-1.5 px-3 d-inline-flex align-items-center gap-1.5"
                                                        onClick={() => eliminar(e.idEmpleado)}
                                                        disabled={eliminandoId === e.idEmpleado}
                                                    >
                                                        <Trash2 size={14} />
                                                        {eliminandoId === e.idEmpleado ? 'Eliminando...' : 'Eliminar'}
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </ScrollableTable>

                        <Pagination
                            paginaActual={paginaSegura}
                            totalPaginas={totalPaginas}
                            onPageChange={setPaginaActual}
                            total={empleadosOrdenados.length}
                            inicio={inicio}
                            fin={fin}
                        />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
