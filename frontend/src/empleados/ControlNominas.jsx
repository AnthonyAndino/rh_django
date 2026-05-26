import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { obtenerNominas, generarNominaMensual, obtenerConfiguracionNomina, guardarConfiguracionNomina } from './empleadosApi';
import ScrollableTable from '../components/ScrollableTable';
import { NumericFormat } from 'react-number-format';
import DatePicker from '../components/DatePicker';
import { DollarSign, TrendingUp, Settings, AlertCircle } from 'lucide-react';

export default function ControlNominas() {
    const { user } = useAuth();
    const [nominas, setNominas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [config, setConfig] = useState(null);

    // Formulario de Nueva Configuración (Solo Admin)
    const [deduccionVal, setDeduccionVal] = useState('10.00');
    const [bonoVal, setBonoVal] = useState('120.00');
    const [guardandoConfig, setGuardandoConfig] = useState(false);

    // Formulario de Generar Nómina (Solo Admin)
    const [fechaPago, setFechaPago] = useState('');
    const [generandoNomina, setGenerandoNomina] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

    const esAdmin = user?.rol === 'admin';

    const cargarDatos = async () => {
        try {
            const resNominas = await obtenerNominas();
            setNominas(resNominas.data);

            if (esAdmin) {
                const resConfig = await obtenerConfiguracionNomina();
                if (resConfig.data.length > 0) {
                    const activeConfig = resConfig.data[0];
                    setConfig(activeConfig);
                    setDeduccionVal(activeConfig.porcentaje_deduccion);
                    setBonoVal(activeConfig.bono_fijo);
                }
            }
        } catch (e) {
            console.error("Error al cargar datos", e);
        }
    };

    useEffect(() => {
        const boot = async () => {
            setCargando(true);
            await cargarDatos();
            // Poner fecha de pago por defecto al último día de este mes
            const hoy = new Date();
            const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
            setFechaPago(ultimoDia.toISOString().split('T')[0]);
            setCargando(false);
        };
        boot();
    }, []);

    // Guardar nueva configuración
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

    // Generar nóminas llamando al Stored Procedure
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

    if (cargando) return <div className="text-center py-5"><p className="text-secondary">Cargando libro de nóminas...</p></div>;

    return (
        <div className="container-fluid px-0 animate-fade-in">
            {/* Cabecera */}
            <div className="mb-4">
                <h1 className="text-dark mb-1">Nómina Corporativa</h1>
                <p className="text-muted mb-0">Gestión financiera, retenciones, bonificaciones y libro de salarios.</p>
            </div>

            {/* Fila de formularios superiores para el Administrador */}
            {esAdmin && (
                <div className="row g-4 mb-4">
                    {/* Panel 1: Configuracion de parametros */}
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

                    {/* Panel 2: Generar nómina mensual */}
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
                                            onChange={(e) => setFechaPago(e.target.value)}
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

            {/* Alertas globales de confirmación */}
            {mensaje.texto && (
                <div className={`alert alert-${mensaje.tipo} mb-4 rounded-3 d-flex align-items-center gap-2 small`} role="alert">
                    <AlertCircle size={16} />
                    <span>{mensaje.texto}</span>
                </div>
            )}

            {/* La tabla general */}
            <div className="card">
                <div className="card-header d-flex align-items-center gap-2">
                    <DollarSign className="text-primary" size={20} />
                    <span>{esAdmin ? 'Historial General de Nóminas Pagadas' : 'Mi Historial de Nóminas y Recibos'}</span>
                </div>
                <div className="card-body p-0">
                    {nominas.length === 0 ? (
                        <div className="p-5 text-center">
                            <p className="text-secondary mb-0">No se han encontrado registros de nómina calculados.</p>
                        </div>
                    ) : (
                        <ScrollableTable>
                            <table className="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>Empleado</th>
                                        <th>Fecha Pago</th>
                                        <th>Sueldo Base</th>
                                        <th className="text-danger">Deducciones</th>
                                        <th className="text-success">Bonos</th>
                                        <th>Sueldo Neto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nominas.map((nom) => (
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
                    )}
                </div>
            </div>
        </div>
    );
}