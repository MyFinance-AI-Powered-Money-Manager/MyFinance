import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is already logged in (on mount)
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
                setIsAuthenticated(true);
                // ensure axios has Authorization header for first requests after refresh
                api.defaults.headers.common.Authorization = `Bearer ${token}`;
            } catch {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
            }
        }

        setLoading(false);
    }, []);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            const { data: responseData } = await api.post('/auth/login', { email, password });

            // Backend returns { status, data: { user, token } }
            const token = responseData.data?.token || responseData.token;
            const userData = responseData.data?.user || responseData.user;

            localStorage.setItem('auth_token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            // set axios header immediately so subsequent requests have Authorization
            api.defaults.headers.common.Authorization = `Bearer ${token}`;

            setUser(userData);
            setIsAuthenticated(true);

            return responseData;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async ({ full_name, email, password, confirm_password }) => {
        setLoading(true);
        setError(null);

        try {
            const { data: responseData } = await api.post('/auth/register', {
                full_name,
                email,
                password,
                confirm_password,
            });
            return responseData;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common.Authorization;
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    const value = {
        user,
        loading,
        error,
        isAuthenticated,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
