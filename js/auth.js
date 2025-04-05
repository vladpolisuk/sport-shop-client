import { API_URL } from './config.js';

// Store the auth token in localStorage
const setAuthToken = (token) => {
    localStorage.setItem('authToken', token);
};

// Get the auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

// Remove the auth token from localStorage
const removeAuthToken = () => {
    localStorage.removeItem('authToken');
};

// Store user data in localStorage
const setUserData = (userData) => {
    localStorage.setItem('userData', JSON.stringify(userData));
};

// Get user data from localStorage
const getUserData = () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
};

// Get user roles from localStorage
const getUserRoles = () => {
    const userData = getUserData();
    return userData && userData.roles ? userData.roles : [];
};

// Check if user has a specific role
const hasRole = (role) => {
    const roles = getUserRoles();
    return roles.includes(role);
};

// Remove user data from localStorage
const removeUserData = () => {
    localStorage.removeItem('userData');
};

// Register a new user
const registerUser = async (username, password, email) => {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                email
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

// Login user
const loginUser = async (username, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        
        // Save token and user data including roles
        setAuthToken(data.token);
        setUserData(data.user);
        
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Check if user is authenticated
const checkAuth = async () => {
    const token = getAuthToken();
    
    if (!token) {
        return { authenticated: false };
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/check`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            removeAuthToken();
            removeUserData();
            return { authenticated: false };
        }

        const data = await response.json();
        
        // Update user data in case it changed
        setUserData(data.user);
        
        return { 
            authenticated: true,
            user: data.user
        };
    } catch (error) {
        console.error('Auth check error:', error);
        removeAuthToken();
        removeUserData();
        return { authenticated: false };
    }
};

// Logout user
const logoutUser = () => {
    removeAuthToken();
    removeUserData();
};

// Check if user is logged in and redirect if not
const requireAuth = async () => {
    const { authenticated } = await checkAuth();
    
    if (!authenticated) {
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
};

// Check if user has admin role
const isAdmin = () => {
    return hasRole('ADMIN');
};

// Check if user is authenticated and has admin role, redirect if not
const requireAdmin = async () => {
    const { authenticated } = await checkAuth();
    
    if (!authenticated) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (!hasRole('ADMIN')) {
        alert('У вас нет прав для доступа к этой странице');
        return false;
    }
    
    return true;
};

// Add authorization header to fetch options if token exists
const withAuth = (options = {}) => {
    const token = getAuthToken();
    
    if (!token) {
        return options;
    }
    
    return {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    };
};

export {
    checkAuth,
    getAuthToken,
    getUserData,
    getUserRoles,
    hasRole,
    isAdmin,
    loginUser,
    logoutUser,
    registerUser, requireAdmin, requireAuth, withAuth
};

