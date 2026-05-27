// Login page — POSTs credentials to /api/auth/login,
// stores the token/user via useAuth().login(), then navigates to /.
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { Lock, User, Briefcase, AlertCircle } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!username || !password) {
            setError('Por favor complete todos los campos');
            return;
        }

        try {
            setCargando(true);
            const res = await axios.post('/api/auth/login', { username, password });
            login(res.data.token, res.data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Usuario o contraseña incorrectos');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-card">
                <div className="auth-header">
                    <Briefcase size={36} className="text-info animate-pulse mx-auto" />
                    <h2 className="auth-title">RH Enterprise</h2>
                    <p className="auth-subtitle">Inicie sesión para acceder al panel de control</p>
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

                    <div className="mb-4">
                        <div className="d-flex justify-content-between mb-1">
                            <label className="form-label text-secondary small mb-0">Contraseña</label>
                            <Link to="/recuperar" className="auth-link small">¿Olvidó su contraseña?</Link>
                        </div>
                        <div className="input-icon-group">
                            <Lock size={18} />
                            <input 
                                type="password"
                                className="form-control"
                                placeholder="Escribe tu contraseña"
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
                        {cargando ? 'Iniciando Sesión...' : 'Entrar al Sistema'}
                    </button>
                </form>

                <div className="auth-footer">
                    <span className="text-secondary">¿No tienes cuenta? </span>
                    <Link to="/registro" className="auth-link">Registrarse</Link>
                </div>
            </div>
    );
}