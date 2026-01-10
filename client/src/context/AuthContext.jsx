import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const { data } = await api.get('/auth/me');
                if (data.success) {
                    setUser(data.data);
                }
            } catch (error) {
                console.error('Auth Check Failed', error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            if (data.success) {
                localStorage.setItem('token', data.data.token);
                setUser(data.data);
                toast.success(`Welcome back, ${data.data.name}!`);
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            if (data.success) {
                localStorage.setItem('token', data.data.token);
                setUser(data.data);
                toast.success(`Welcome, ${data.data.name}!`);
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            return false;
        }
    };

    const googleLogin = async (credential) => {
        try {
            const { data } = await api.post('/auth/google', { token: credential });
            if (data.success) {
                localStorage.setItem('token', data.data.token);
                setUser(data.data);
                toast.success(`Welcome, ${data.data.name}!`);
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Google Login failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        toast.success('Logged out');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, googleLogin, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
