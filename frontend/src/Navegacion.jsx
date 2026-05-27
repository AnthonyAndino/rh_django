// Sidebar navigation — collapsible, responsive, with role-based links.
// Admin: Dashboard, Personal, Asistencias, Nóminas
// Employee: Dashboard, Asistencias
// Also includes theme toggle and logout.
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { Briefcase, Users, Clock, DollarSign, LayoutDashboard, LogOut, Menu, X, ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navegacion() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [sidebarAbierto, setSidebarAbierto] = useState(false);
    const [colapsado, setColapsado] = useState(() => {
        const stored = localStorage.getItem('sidebar_colapsado') === 'true';
        return window.innerWidth < 992 ? false : stored;
    });
    const { tema, toggleTema } = useTheme();

    useEffect(() => {
        const checkWidth = () => {
            if (window.innerWidth < 992) {
                setColapsado(false);
            }
        };
        window.addEventListener('resize', checkWidth);
        checkWidth();
        return () => window.removeEventListener('resize', checkWidth);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleColapso = () => {
        setColapsado(prev => {
            const nuevo = !prev;
            localStorage.setItem('sidebar_colapsado', String(nuevo));
            return nuevo;
        });
    };

    const inicial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <button
                className="sidebar-toggle d-lg-none"
                onClick={() => setSidebarAbierto(!sidebarAbierto)}
                aria-label="Toggle sidebar"
            >
                {sidebarAbierto ? <X size={22} /> : <Menu size={22} />}
            </button>

            {sidebarAbierto && (
                <div className="sidebar-overlay d-lg-none" onClick={() => setSidebarAbierto(false)} />
            )}

            <aside className={`sidebar ${sidebarAbierto ? 'sidebar--open' : ''} ${colapsado ? 'sidebar--collapsed' : ''}`}>
                <button
                    className="sidebar-collapse-btn"
                    onClick={toggleColapso}
                    title={colapsado ? 'Expandir menú' : 'Colapsar menú'}
                >
                    {colapsado ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>

                <div className="sidebar-body">
                    <div className="sidebar-header">
                        <div className="sidebar-brand-icon">
                            <Briefcase size={22} />
                        </div>
                        <div className="sidebar-brand-title">RH Enterprise</div>
                    </div>

                    <div className="sidebar-user">
                        <div className="sidebar-avatar">
                            {inicial}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.username || 'Usuario'}</div>
                            <div className="sidebar-user-role">{user?.rol || 'Empleado'}</div>
                        </div>
                    </div>

                    <ul className="sidebar-menu">
                        <li>
                            <Link 
                                className={`sidebar-link ${isActive('/') ? 'active' : ''}`} 
                                to="/"
                                onClick={() => setSidebarAbierto(false)}
                            >
                                <span className="sidebar-icon-box">
                                    <LayoutDashboard size={18} />
                                </span>
                                <span className="sidebar-label">Dashboard</span>
                            </Link>
                        </li>
                        
                        {user?.rol === 'admin' && (
                            <li>
                                <Link 
                                    className={`sidebar-link ${isActive('/empleados') || isActive('/agregar') || isActive('/editar') ? 'active' : ''}`} 
                                    to="/empleados"
                                    onClick={() => setSidebarAbierto(false)}
                                >
                                    <span className="sidebar-icon-box">
                                        <Users size={18} />
                                    </span>
                                    <span className="sidebar-label">Personal</span>
                                </Link>
                            </li>
                        )}
                        
                        <li>
                            <Link 
                                className={`sidebar-link ${isActive('/asistencia') ? 'active' : ''}`} 
                                to="/asistencia"
                                onClick={() => setSidebarAbierto(false)}
                            >
                                <span className="sidebar-icon-box">
                                    <Clock size={18} />
                                </span>
                                <span className="sidebar-label">Asistencias</span>
                            </Link>
                        </li>
                        
                        {user?.rol === 'admin' && (
                            <li>
                                <Link 
                                    className={`sidebar-link ${isActive('/nominas') ? 'active' : ''}`} 
                                    to="/nominas"
                                    onClick={() => setSidebarAbierto(false)}
                                >
                                    <span className="sidebar-icon-box">
                                        <DollarSign size={18} />
                                    </span>
                                    <span className="sidebar-label">Nóminas</span>
                                </Link>
                            </li>
                        )}

                    </ul>

                    <div className="sidebar-footer">
                        <button
                            onClick={toggleTema}
                            className="sidebar-link sidebar-theme-toggle"
                            title={tema === 'light' ? 'Modo oscuro' : 'Modo claro'}
                        >
                            <span className="sidebar-icon-box">
                                {tema === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                            </span>
                            <span className="sidebar-label">{tema === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
                        </button>
                        <a 
                            href="#" 
                            onClick={handleLogout} 
                            className="sidebar-link sidebar-link-danger"
                        >
                            <span className="sidebar-icon-box">
                                <LogOut size={18} />
                            </span>
                            <span className="sidebar-label">Cerrar Sesión</span>
                        </a>
                    </div>
                </div>
            </aside>
        </>
    );
}
