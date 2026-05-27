// Add employee page — wraps EmpleadoForm with create logic.
// Builds FormData (supports photo upload) and POSTs via crearEmpleado().
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearEmpleado } from "./empleadosApi";
import EmpleadoForm from "./EmpleadosForm";

const empleadoInicial = {
    nombre: '',
    departamento: '',
    sueldo: 0,
    fecha_contratacion: new Date().toISOString().split('T')[0],
    puesto: '',
    correo_corporativo: '',
    telefono: '',
    estatus: 'Activo',
    foto_perfil: null
};

export default function AgregarEmpleado() {
    const [empleado, setEmpleado] = useState(empleadoInicial);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const actualizaCampo = (campo, valor) => {
        setEmpleado((actual) => ({
            ...actual,
            [campo]: valor,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const nombreOk = empleado.nombre.trim();
        const deptoOk = empleado.departamento.trim();
        const puestoOk = empleado.puesto.trim();
        const correoOk = empleado.correo_corporativo.trim();
        const sueldoOk = Number(empleado.sueldo) || 0;

        if (!nombreOk || !deptoOk || !puestoOk || !correoOk || sueldoOk <= 0) {
            setError('Por favor complete Nombre, Departamento, Puesto, Correo Corporativo y un sueldo válido.');
            return;
        }

        try {
            setEnviando(true);

            const formData = new FormData();
            formData.append('nombre', nombreOk);
            formData.append('departamento', deptoOk);
            formData.append('sueldo', sueldoOk);
            formData.append('puesto', puestoOk);
            formData.append('fecha_contratacion', empleado.fecha_contratacion);
            formData.append('correo_corporativo', correoOk);
            formData.append('telefono', empleado.telefono ? empleado.telefono.trim() : '');
            formData.append('estatus', empleado.estatus);
            
            if (empleado.foto_perfil instanceof File) {
                formData.append('foto_perfil', empleado.foto_perfil);
            }

            await crearEmpleado(formData);
            navigate('/');
        } catch (e) {
            setError(e.response?.data?.error || 'No se pudo guardar el empleado. Valida que el correo sea único.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="card max-w-lg mx-auto animate-fade-in" style={{ maxWidth: '750px' }}>
            <div className="card-header">
                <strong>Agregar Colaborador</strong>
            </div>
            <div className="card-body">
                {error && <div className="alert alert-danger mb-4 rounded-3 small">{error}</div>}

                <EmpleadoForm 
                    empleado={empleado}
                    enviando={enviando}
                    textoBoton="Registrar Personal"
                    onChange={actualizaCampo}
                    onSubmit={onSubmit}
                    onCancel={() => navigate('/')}
                />
            </div>
        </div>
    );
}