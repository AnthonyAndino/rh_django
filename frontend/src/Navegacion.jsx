import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Users, Clock, DollarSign, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navegacion() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [sidebarAbierto, setSidebarAbierto] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const inicial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

    return (
        <>
            {/* Hamburguesa para mobile */}
            <button
                className="sidebar-toggle d-lg-none"
                onClick={() => setSidebarAbierto(!sidebarAbierto)}
                aria-label="Toggle sidebar"
            >
                {sidebarAbierto ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Overlay para mobile */}
            {sidebarAbierto && (
                <div className="sidebar-overlay d-lg-none" onClick={() => setSidebarAbierto(false)} />
            )}

            <aside className={`sidebar ${sidebarAbierto ? 'sidebar--open' : ''}`}>
                <div className="sidebar-user">
                    <div className="sidebar-avatar">
                        {inicial}
                    </div>
                    <div className="sidebar-user-name">{user?.username || 'Usuario'}</div>
                    <div className="sidebar-user-role">{user?.rol || 'Empleado'}</div>
                </div>

                <ul className="sidebar-menu">
                    <li>
                        <Link 
                            className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`} 
                            to="/"
                            onClick={() => setSidebarAbierto(false)}
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </Link>
                    </li>
                    
                    {user?.rol === 'admin' && (
                        <li>
                            <Link 
                                className={`sidebar-link ${location.pathname.startsWith('/empleados') || location.pathname === '/agregar' || location.pathname.startsWith('/editar') ? 'active' : ''}`} 
                                to="/empleados"
                                onClick={() => setSidebarAbierto(false)}
                            >
                                <Users size={18} />
                                Personal
                            </Link>
                        </li>
                    )}
                    
                    <li>
                        <Link 
                            className={`sidebar-link ${location.pathname === '/asistencia' ? 'active' : ''}`} 
                            to="/asistencia"
                            onClick={() => setSidebarAbierto(false)}
                        >
                            <Clock size={18} />
                            Asistencias
                        </Link>
                    </li>
                    
                    {user?.rol === 'admin' && (
                        <li>
                            <Link 
                                className={`sidebar-link ${location.pathname === '/nominas' ? 'active' : ''}`} 
                                to="/nominas"
                                onClick={() => setSidebarAbierto(false)}
                            >
                                <DollarSign size={18} />
                                Nóminas
                            </Link>
                        </li>
                    )}

                    <li style={{ marginTop: 'auto' }}>
                        <a 
                            href="#" 
                            onClick={handleLogout} 
                            className="sidebar-link sidebar-link-danger d-flex align-items-center gap-3"
                        >
                            <LogOut size={18} />
                            Cerrar Sesión
                        </a>
                    </li>
                </ul>
            </aside>
        </>
    );
}