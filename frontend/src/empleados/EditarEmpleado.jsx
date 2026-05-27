// Edit employee page — loads existing employee by URL param, pre-populates
// EmpleadoForm. Builds FormData and PATCHes via actualizarEmpleado().
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerEmpleado, actualizarEmpleado } from "./empleadosApi";
import EmpleadoForm from "./EmpleadosForm";

const empleadoInicial = {
    nombre: '',
    departamento: '',
    sueldo: 0,
    fecha_contratacion: '',
    puesto: '',
    correo_corporativo: '',
    telefono: '',
    estatus: 'Activo',
    foto_perfil: null
};

export default function EditarEmpleado() {
    const { idEmpleado } = useParams();
    const navigate = useNavigate();

    const [empleado, setEmpleado] = useState(empleadoInicial);
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargar = async () => {
            try {
                const { data } = await obtenerEmpleado(idEmpleado);

                setEmpleado({
                    nombre: data?.nombre ?? '',
                    departamento: data?.departamento ?? '',
                    sueldo: Number(data?.sueldo) || 0,
                    fecha_contratacion: data?.fecha_contratacion ?? '',
                    puesto: data?.puesto ?? '',
                    correo_corporativo: data?.correo_corporativo ?? '',
                    telefono: data?.telefono ?? '',
                    estatus: data?.estatus ?? 'Activo',
                    foto_perfil: data?.foto_perfil ?? null
                });
            } catch (e) {
                console.error("Error al cargar colaborador:", e);
                setError('No se pudo cargar el empleado');
            } finally {
                setCargando(false);
            }
        };

        cargar();
    }, [idEmpleado]);

    const actualizarCampo = (campo, valor) => {
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

            await actualizarEmpleado(idEmpleado, formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'No se pudo guardar los cambios del empleado.');
        } finally {
            setEnviando(false);
        }
    };

    if (cargando) {
        return <div className="text-center py-5"><p className="text-secondary">Cargando...</p></div>;
    }

    return (
        <div className="card max-w-lg mx-auto animate-fade-in" style={{ maxWidth: '750px' }}>
            <div className="card-header">
                <strong>Editar Colaborador #{idEmpleado}</strong>
            </div>
            <div className="card-body">
                {error && <div className="alert alert-danger mb-4 rounded-3 small">{error}</div>}

                <EmpleadoForm
                    empleado={empleado}
                    enviando={enviando}
                    textoBoton="Guardar Cambios"
                    onChange={actualizarCampo}
                    onSubmit={onSubmit}
                    onCancel={() => navigate('/')}
                />
            </div>
        </div>
    );
}