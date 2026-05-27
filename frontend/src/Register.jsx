// Registration page — creates a new user via /api/auth/register
// and auto-logs in on success. First registered user becomes admin.
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { Mail, Lock, User, Briefcase, AlertCircle } from 'lucide-react';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !email || !password) {
            setError('Por favor complete todos los campos');
            return;
        }

        try {
            setCargando(true);
            const res = await axios.post('/api/auth/register', { username, email, password });
            login(res.data.token, res.data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'No se pudo completar el registro');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-card">
                <div className="auth-header">
                    <Briefcase size={36} className="text-info mx-auto" />
                    <h2 className="auth-title">Crear Cuenta</h2>
                    <p className="auth-subtitle">Registre las credenciales de su corporación</p>
                </div>

                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-4 rounded-3 small">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={onSubmit}>
                    <div className="mb-3">
                        <label className="form-label text-secondary small">Nombre de Usuario</label>
                        <div className="input-icon-group">
                            <User size={18} />
                            <input 
                                type="text"
                                className="form-control"
                                placeholder="Escribe tu usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label text-secondary small">Correo Corporativo</label>
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

                    <div className="mb-4">
                        <label className="form-label text-secondary small">Contraseña</label>
                        <div className="input-icon-group">
                            <Lock size={18} />
                            <input 
                                type="password"
                                className="form-control"
                                placeholder="Crea una contraseña segura"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary w-100 py-2.5"
                        disabled={cargando}
                    >
                        {cargando ? 'Creando Cuenta...' : 'Registrar Cuenta'}
                    </button>
                </form>

                <div className="auth-footer">
                    <span className="text-secondary">¿Ya tienes cuenta? </span>
                    <Link to="/login" className="auth-link">Iniciar Sesión</Link>
                </div>
            </div>
    );
}