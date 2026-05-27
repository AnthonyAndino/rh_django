// Reusable employee form — used by both AgregarEmpleado and EditarEmpleado.
// Fields: nombre, puesto, departamento, correo, telefono, fecha contratación,
// sueldo (NumericFormat), estatus (TomSelect), foto perfil (hidden input + ref).
import { useMemo, useRef } from 'react';
import { NumericFormat } from 'react-number-format';
import TomSelect from '../components/TomSelect';
import DatePicker from '../components/DatePicker';
import { User, Mail, Phone, Image, Award, ToggleLeft } from 'lucide-react';

export default function EmpleadoForm({
    empleado,
    enviando,
    textoBoton,
    onChange,
    onSubmit,
    onCancel,
}) {
    const estatusOptions = useMemo(() => [
        { value: 'Activo', text: 'Activo' },
        { value: 'Inactivo', text: 'Inactivo' },
        { value: 'Suspendido', text: 'Suspendido' },
    ], []);
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onChange('foto_perfil', e.target.files[0]);
        }
    };

    const fileInputRef = useRef(null);

    return (
        <form onSubmit={onSubmit} className="row g-4 animate-fade-in">
            <div className="col-md-6">
                <label className="form-label">Nombre Completo</label>
                <div className="input-icon-group">
                    <User size={18} />
                    <input 
                        type="text"
                        className="form-control"
                        value={empleado.nombre}
                        onChange={(e) => onChange('nombre', e.target.value)}
                        placeholder="Juan Pérez"
                        required
                    />
                </div>
            </div>

            <div className="col-md-6">
                <label className="form-label">Puesto Organizacional</label>
                <div className="input-icon-group">
                    <Award size={18} />
                    <input 
                        type="text"
                        className="form-control"
                        value={empleado.puesto}
                        onChange={(e) => onChange('puesto', e.target.value)}
                        placeholder="Gerente de Operaciones"
                        required
                    />
                </div>
            </div>

            <div className="col-md-6">
                <label className="form-label">Departamento</label>
                <div className="input-icon-group">
                    <ToggleLeft size={18} />
                    <input 
                        type="text"
                        className="form-control"
                        value={empleado.departamento}
                        onChange={(e) => onChange('departamento', e.target.value)}
                        placeholder="Administración"
                        required
                    />
                </div>
            </div>

            <div className="col-md-6">
                <label className="form-label">Correo Corporativo</label>
                <div className="input-icon-group">
                    <Mail size={18} />
                    <input 
                        type="email"
                        className="form-control"
                        value={empleado.correo_corporativo}
                        onChange={(e) => onChange('correo_corporativo', e.target.value)}
                        placeholder="juan.perez@empresa.com"
                        required
                    />
                </div>
            </div>

            <div className="col-md-6">
                <label className="form-label">Teléfono de Contacto</label>
                <div className="input-icon-group">
                    <Phone size={18} />
                    <input 
                        type="text"
                        className="form-control"
                        value={empleado.telefono}
                        onChange={(e) => onChange('telefono', e.target.value)}
                        placeholder="+52 55 1234 5678"
                    />
                </div>
            </div>

            <div className="col-md-6">
                <DatePicker
                    label="Fecha de Contratación"
                    value={empleado.fecha_contratacion}
                    onChange={(value) => onChange('fecha_contratacion', value)}
                />
            </div>

            <div className="col-md-6">
                <label className="form-label">Sueldo Mensual ($)</label>
                <NumericFormat 
                    className="form-control"
                    value={empleado.sueldo}
                    thousandSeparator=","
                    decimalSeparator="."
                    decimalScale={2}
                    fixedDecimalScale
                    allowNegative={false}
                    prefix="$"
                    onValueChange={({ floatValue }) => onChange('sueldo', floatValue ?? 0)}
                />
            </div>

            <div className="col-md-6">
                <label className="form-label">Estatus de Servicio</label>
                <TomSelect
                    value={empleado.estatus}
                    onChange={(value) => onChange('estatus', value)}
                    options={estatusOptions}
                    placeholder="Seleccionar estatus"
                />
            </div>

            {/* Photo upload — hidden input triggered by clicking the styled .file-upload container */}
            <div className="col-md-12">
                <label className="form-label">Foto de Perfil (Opcional)</label>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    hidden
                />
                <div className="file-upload" onClick={() => fileInputRef.current?.click()}>
                    <Image size={18} className="file-upload__icon" />
                    <span className={`file-upload__text${empleado.foto_perfil instanceof File ? '' : ' file-upload__text--placeholder'}`}>
                        {empleado.foto_perfil instanceof File
                            ? empleado.foto_perfil.name
                            : 'Subir foto de perfil'}
                    </span>
                </div>
                {empleado.foto_perfil && typeof empleado.foto_perfil === 'string' && (
                    <div className="mt-2 text-secondary small">
                        Imagen registrada: <a href={empleado.foto_perfil} target="_blank" rel="noreferrer" className="auth-link">Ver archivo actual</a>
                    </div>
                )}
            </div>

            <div className="col-12 d-flex gap-3 mt-4">
                <button type="submit" className="btn btn-primary px-4 py-2.5" disabled={enviando}>
                    {enviando ? 'Guardando...' : textoBoton}
                </button>

                {onCancel && (
                    <button type="button" className="btn btn-secondary px-4 py-2.5" onClick={onCancel}>
                        Regresar
                    </button>
                )}
            </div>
        </form>
    );
}