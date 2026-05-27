/* eslint-disable react-refresh/only-export-components */
// Authentication context — manages login state, token persistence,
// and an axios 401 interceptor that auto-logs out on unauthorized responses.
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const initialToken = localStorage.getItem('user_token');
if (initialToken) {
    axios.defaults.headers.common['Authorization'] = `Token ${initialToken}`;
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('user_token') || null);
    const [user, setUser] = useState(() => {
        const localUser = localStorage.getItem('user_data');
        if (localUser) {
            try {
                return JSON.parse(localUser);
            } catch (e) {
                console.error("Error parsing user_data from localStorage on initialization:", e);
                localStorage.removeItem('user_data');
            }
        }
        return null;
    });
    const [cargando] = useState(false);
    const logoutRef = useRef(null);

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
        delete axios.defaults.headers.common['Authorization'];
    };

    useEffect(() => {
        logoutRef.current = logout;
    });

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Global 401 interceptor — triggers logout when the token expires
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401 && logoutRef.current) {
                    logoutRef.current();
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('user_token', newToken);
        localStorage.setItem('user_data', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Token ${newToken}`;
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        cargando
    };

    return (
        <AuthContext.Provider value={value}>
            {!cargando && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}