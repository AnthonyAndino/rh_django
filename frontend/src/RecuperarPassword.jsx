// Password recovery page — sends email to /api/auth/recover-password.
// Displays success/error messages inline.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Briefcase, AlertCircle, CheckCircle } from 'lucide-react';

export default function RecuperarPassword() {
    const [email, setEmail] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        if (!email) {
            setError('Por favor escribe tu correo electrónico');
            return;
        }

        try {
            setCargando(true);
            const res = await axios.post('/api/auth/recover-password', { email });
            setMensaje(res.data.message);
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.error || 'No pudimos procesar su solicitud');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-card">
                <div className="auth-header">
                    <Briefcase size={36} className="text-info mx-auto" />
                    <h2 className="auth-title">Recuperación</h2>
                    <p className="auth-subtitle">Restablezca la contraseña de su cuenta corporativa</p>
                </div>

                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-4 rounded-3 small">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {mensaje && (
                    <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mb-4 rounded-3 small">
                        <CheckCircle size={16} />
                        <span>{mensaje}</span>
                    </div>
                )}

                <form onSubmit={onSubmit}>
                    <div className="mb-4">
                        <label className="form-label text-secondary small">Correo Electrónico Registrado</label>
                        <div className="input-icon-group">
                            <Mail size={18} />
                            <input 
                                type="email"
                                className="form-control"
                                placeholder="ejemplo@empresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary w-100 py-2.5"
                        disabled={cargando}
                    >
                        {cargando ? 'Enviando...' : 'Enviar Enlace'}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/login" className="auth-link">Regresar al Login</Link>
                </div>
            </div>
    );
}