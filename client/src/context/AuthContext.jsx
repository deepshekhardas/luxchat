import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkUserLoggedIn = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        checkUserLoggedIn();
    }, [checkUserLoggedIn]);

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

    const guestLogin = async () => {
        const guestEmail = "guest@example.com";
        const guestPass = "guest123";
        try {
            // Try login first
            const { data } = await api.post('/auth/login', { email: guestEmail, password: guestPass });
            if (data.success) {
                localStorage.setItem('token', data.data.token);
                setUser(data.data);
                toast.success(`Welcome back, Guest!`);
                return true;
            }
        } catch {
            // If login fails (likely user doesn't exist), try to register
            try {
                const { data } = await api.post('/auth/register', { name: "Guest User", email: guestEmail, password: guestPass });
                if (data.success) {
                    localStorage.setItem('token', data.data.token);
                    setUser(data.data);
                    toast.success(`Welcome, Guest!`);
                    return true;
                }
            } catch {
                console.error("Guest login registration failed");
                toast.error("Guest login failed");
                return false;
            }
        }
        return false;
    };

    return (
        <AuthContext.Provider value={{ user, login, register, googleLogin, guestLogin, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
