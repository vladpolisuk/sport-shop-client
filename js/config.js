/**
 * Global configuration variables for the Sport Shop application
 */

// API configuration
export const API_URL = 'http://localhost:8080';

// Application settings
export const APP_NAME = 'Sport Shop';
export const CURRENCY = 'руб.';
export const ITEMS_PER_PAGE = 10;

// User roles
export const ROLES = {
    USER: 'USER',
    ADMIN: 'ADMIN'
};

// Local storage keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'authToken',
    USER_DATA: 'userData',
    CART: 'cart',
};

// Notification display time (ms)
export const NOTIFICATION_TIMEOUT = 3000;

// Shopping cart settings
export const CART_SETTINGS = {
    MAX_QUANTITY_PER_ITEM: 99,
    MIN_QUANTITY_PER_ITEM: 1
}; 