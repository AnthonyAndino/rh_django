// Payroll control page — admin sees two config cards (deduction % + fixed bonus,
// payroll generation with date picker calling a stored procedure) plus a
// sortable/paginated payroll history table with CSV export.
// Employees see only their own payroll history.
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { generarNominaMensual, guardarConfiguracionNomina } from './empleadosApi';
import ScrollableTable from '../components/ScrollableTable';
import ThSortable from '../components/ThSortable';
import Pagination from '../components/Pagination';
import { NumericFormat } from 'react-number-format';
import DatePicker from '../components/DatePicker';
import { DollarSign, TrendingUp, Settings, AlertCircle, Download } from 'lucide-react';
import nominasMock from '../mock/nominasMock';

const POR_PAGINA = 8;

export default function ControlNominas() {
    const { user } = useAuth();
    const [nominas, setNominas] = useState(nominasMock);
    const [cargando] = useState(false);
    const [config, setConfig] = useState(null);

    const [deduccionVal, setDeduccionVal] = useState('10.00');
    const [bonoVal, setBonoVal] = useState('120.00');
    const [guardandoConfig, setGuardandoConfig] = useState(false);

    const hoy = new Date().toISOString().split('T')[0];
    const [fechaPago, setFechaPago] = useState(hoy);
    const [generandoNomina, setGenerandoNomina] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [paginaActual, setPaginaActual] = useState(1);

    const esAdmin = user?.rol === 'admin';

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPaginaActual(1);
    }, [sortField, sortDirection]);

    const cargarDatos = () => {
        setNominas(nominasMock);
    };

    const handleGuardarConfig = async (e) => {
        e.preventDefault();
        try {
            setGuardandoConfig(true);
            setMensaje({ texto: '', tipo: '' });

            const res = await guardarConfiguracionNomina({
                porcentaje_deduccion: parseFloat(deduccionVal),
                bono_fijo: parseFloat(bonoVal)
            });

            setConfig(res.data);
            setMensaje({ texto: '¡Configuración de nómina actualizada con éxito!', tipo: 'success' });
            await cargarDatos();
        } catch (err) {
            console.error("Error al guardar configuración:", err);
            setMensaje({ texto: 'No se pudo guardar la configuración.', tipo: 'danger' });
        } finally {
            setGuardandoConfig(false);
        }
    };

    const handleGenerarNomina = async (e) => {
        e.preventDefault();
        if (!fechaPago) {
            setMensaje({ texto: 'Por favor selecciona la fecha de pago', tipo: 'danger' });
            return;
        }

        try {
            setGenerandoNomina(true);
            setMensaje({ texto: '', tipo: '' });

            const res = await generarNominaMensual(fechaPago);

            setMensaje({ texto: res.data.message, tipo: 'success' });
            await cargarDatos();
        } catch (err) {
            setMensaje({ 
                texto: err.response?.data?.error || 'Error al generar la nómina. Valida que existan empleados activos.', 
                tipo: 'danger' 
            });
        } finally {
            setGenerandoNomina(false);
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

    const nominasOrdenadas = useMemo(() => {
        if (!sortField) return nominas;
        return [...nominas].sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];
            if (['sueldo_base', 'deducciones', 'bonos', 'sueldo_neto'].includes(sortField)) {
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
    }, [nominas, sortField, sortDirection]);

    const totalPaginas = Math.max(1, Math.ceil(nominasOrdenadas.length / POR_PAGINA));
    const paginaSegura = Math.min(paginaActual, totalPaginas);
    const inicio = (paginaSegura - 1) * POR_PAGINA;
    const fin = Math.min(inicio + POR_PAGINA, nominasOrdenadas.length);
    const nominasPagina = nominasOrdenadas.slice(inicio, fin);

    const exportarCSV = useCallback(() => {
        if (nominasOrdenadas.length === 0) return;
        const cabeceras = ['Empleado', 'Fecha Pago', 'Sueldo Base', 'Deducciones', 'Bonos', 'Sueldo Neto'];
        const filas = nominasOrdenadas.map(n => [
            `"${n.nombre_empleado}"`,
            n.fecha_pago,
            n.sueldo_base,
            n.deducciones,
            n.bonos,
            n.sueldo_neto
        ]);
        const csv = [cabeceras.join(','), ...filas.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nominas.csv';
        a.click();
        URL.revokeObjectURL(url);
    }, [nominasOrdenadas]);

    if (cargando) return <div className="text-center py-5"><p className="text-secondary">Cargando libro de nóminas...</p></div>;

    return (
        <div className="container-fluid px-0 animate-fade-in">
            <div className="mb-4">
                <h1 className="text-dark mb-1">Nómina Corporativa</h1>
                <p className="text-muted mb-0">Gestión financiera, retenciones, bonificaciones y libro de salarios.</p>
            </div>

            {esAdmin && (
                <div className="row g-4 mb-4">
                    {/* Config card */}
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-header d-flex align-items-center gap-2">
                                <Settings className="text-primary" size={18} />
                                <span>Configuración de Nómina Vigente</span>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleGuardarConfig}>
                                    <div className="row g-3 mb-3">
                                        <div className="col-6">
                                            <label className="form-label">Deducciones (%)</label>
                                            <input 
                                                type="number"
                                                step="0.01"
                                                className="form-control"
                                                value={deduccionVal}
                                                onChange={(e) => setDeduccionVal(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label">Bono Fijo ($)</label>
                                            <input 
                                                type="number"
                                                step="0.01"
                                                className="form-control"
                                                value={bonoVal}
                                                onChange={(e) => setBonoVal(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="btn btn-secondary py-2.5 px-3 w-100"
                                        disabled={guardandoConfig}
                                    >
                                        {guardandoConfig ? 'Actualizando...' : 'Actualizar Parámetros'}
                                    </button>
                                </form>
                                {config && (
                                    <div className="mt-3 text-secondary small text-center">
                                        Vigente desde el {config.fecha_vigencia} (Deducción: <strong>{config.porcentaje_deduccion}%</strong> | Bono: <strong>${config.bono_fijo}</strong>)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Generate payroll card */}
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-header d-flex align-items-center gap-2">
                                <TrendingUp className="text-primary" size={18} />
                                <span>Generar Nómina del Mes</span>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleGenerarNomina}>
                                    <div className="mb-3">
                                        <DatePicker
                                            label="Fecha de Pago"
                                            value={fechaPago}
                                            onChange={setFechaPago}
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary py-2.5 px-3 w-100 d-flex align-items-center justify-content-center gap-2"
                                        disabled={generandoNomina}
                                    >
                                        <DollarSign size={18} />
                                        {generandoNomina ? 'Generando Nóminas...' : 'Calcular Nómina de Empleados'}
                                    </button>
                                </form>
                                <div className="mt-3 text-secondary small text-center">
                                    Se calcularán automáticamente los sueldos, deducciones y bonos de todos los empleados activos para el periodo seleccionado.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {mensaje.texto && (
                <div className={`alert alert-${mensaje.tipo} mb-4 rounded-3 d-flex align-items-center gap-2 small`} role="alert">
                    <AlertCircle size={16} />
                    <span>{mensaje.texto}</span>
                </div>
            )}

            {/* Payroll history table */}
            <div className="card">
                <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <span>
                        {esAdmin ? 'Historial General de Nóminas Pagadas' : 'Mi Historial de Nóminas y Recibos'}
                        <span className="text-muted fw-normal ms-1">({nominasOrdenadas.length} Total)</span>
                    </span>
                    {nominasOrdenadas.length > 0 && (
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
                    {nominasPagina.length === 0 ? (
                        <div className="p-5 text-center">
                            <p className="text-secondary mb-0">No se han encontrado registros de nómina calculados.</p>
                        </div>
                    ) : (
                        <>
                        <ScrollableTable>
                            <table className="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <ThSortable campo="nombre_empleado" sortField={sortField} sortDirection={sortDirection} onSort={ordenar}>Empleado</ThSortable>
                                        <ThSortable campo="fecha_pago" sortField={sortField} sortDirection={sortDirection} onSort={ordenar}>Fecha Pago</ThSortable>
                                        <ThSortable campo="sueldo_base" sortField={sortField} sortDirection={sortDirection} onSort={ordenar}>Sueldo Base</ThSortable>
                                        <ThSortable campo="deducciones" sortField={sortField} sortDirection={sortDirection} onSort={ordenar} className="text-danger">Deducciones</ThSortable>
                                        <ThSortable campo="bonos" sortField={sortField} sortDirection={sortDirection} onSort={ordenar} className="text-success">Bonos</ThSortable>
                                        <ThSortable campo="sueldo_neto" sortField={sortField} sortDirection={sortDirection} onSort={ordenar}>Sueldo Neto</ThSortable>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nominasPagina.map((nom) => (
                                        <tr key={nom.idNomina}>
                                            <td className="fw-semibold">{nom.nombre_empleado}</td>
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
                                                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1">
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
                        </ScrollableTable>

                        <Pagination
                            paginaActual={paginaSegura}
                            totalPaginas={totalPaginas}
                            onPageChange={setPaginaActual}
                            total={nominasOrdenadas.length}
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
