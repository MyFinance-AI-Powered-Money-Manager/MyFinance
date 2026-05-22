import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const logout = useCallback(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common.Authorization;
        setUser(null);
        setIsAuthenticated(false);
    }, []);

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

    // Monitor token presence in localStorage for automatic logout
    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem('auth_token');
            if (isAuthenticated && !token) {
                console.warn('Access token is missing. Automatic logout triggered.');
                logout();
            }
        };

        // Check when the browser tab gains focus
        window.addEventListener('focus', checkToken);
        
        // Check when changes happen in other tabs/windows
        window.addEventListener('storage', (e) => {
            if (e.key === 'auth_token' && !e.newValue) {
                logout();
            }
        });

        // Periodic check every 1 second
        const interval = setInterval(checkToken, 1000);

        return () => {
            window.removeEventListener('focus', checkToken);
            clearInterval(interval);
        };
    }, [isAuthenticated, logout]);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            const { data: responseData } = await api.post('/auth/login', { email, password });

            // Backend returns { status, data: { user, token } }
            const token = responseData.data?.token || responseData.token;
            const userData = responseData.data?.user || responseData.user;

            if (!token || !userData) {
                throw new Error('Token atau data pengguna tidak ditemukan dalam respons login');
            }

            localStorage.setItem('auth_token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            // set axios header immediately so subsequent requests have Authorization
            api.defaults.headers.common.Authorization = `Bearer ${token}`;

            setUser(userData);
            setIsAuthenticated(true);
            setError(null);

            // Fetch full profile data after login
            try {
                const profileResponse = await api.get('/users/profile');
                const fullUserData = profileResponse?.data?.data || profileResponse?.data || userData;
                const normalizedUser = {
                    ...userData,
                    ...fullUserData,
                    profile_picture: fullUserData?.profile_picture || userData?.profile_picture || null,
                    full_name: fullUserData?.full_name || fullUserData?.name || userData?.full_name || userData?.name,
                    email: fullUserData?.email || userData?.email,
                };
                setUser(normalizedUser);
                localStorage.setItem('user', JSON.stringify(normalizedUser));
            } catch (profileErr) {
                // If profile fetch fails, use initial user data (not critical)
                console.warn('Profile fetch after login failed:', profileErr);
            }

            return responseData;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Login failed';
            setError(errorMessage);
            setLoading(false);
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

    const updateUser = useCallback((nextUser) => {
        setUser((currentUser) => (typeof nextUser === 'function' ? nextUser(currentUser) : nextUser));
    }, []);

    const value = {
        user,
        loading,
        error,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
