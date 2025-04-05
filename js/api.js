// API Service Module
import { withAuth } from './auth.js';
import { API_URL } from './config.js';

/**
 * Generic error handler for API responses
 * @param {Response} response - The fetch response object
 * @returns {Promise} - Resolves with response data or rejects with error
 */
async function handleResponse(response) {
    if (!response.ok) {
        if (response.status === 401) {
            // Handle unauthorized (redirect to login)
            window.location.href = 'login.html';
            return Promise.reject(new Error('Unauthorized access'));
        } else if (response.status === 403) {
            // Handle forbidden
            return Promise.reject(new Error('Access forbidden'));
        }
        
        // Handle other errors
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        return Promise.reject(new Error(errorMessage));
    }
    
    // Return nothing for 204 No Content responses
    if (response.status === 204) {
        return;
    }
    
    return response.json();
}

/**
 * Fetch products from API
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Products array
 */
export async function fetchProducts(options = {}) {
    const { categoryId, search, page = 1, size = 20 } = options;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (search) params.append('search', search);
    params.append('page', page);
    params.append('size', size);
    
    const queryString = params.toString();
    
    try {
        const response = await fetch(
            `${API_URL}/products${queryString ? `?${queryString}` : ''}`,
            withAuth()
        );
        
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

/**
 * Fetch product by ID
 * @param {number} id - Product ID
 * @returns {Promise<Object>} - Product object
 */
export async function fetchProductById(id) {
    try {
        const response = await fetch(
            `${API_URL}/products/${id}`,
            withAuth()
        );
        
        return handleResponse(response);
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        throw error;
    }
}

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} - Created product
 */
export async function createProduct(productData) {
    try {
        const response = await fetch(
            `${API_URL}/products`,
            {
                ...withAuth(),
                method: 'POST',
                headers: {
                    ...withAuth().headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            }
        );
        
        return handleResponse(response);
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
}

/**
 * Update a product
 * @param {number} id - Product ID
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} - Updated product
 */
export async function updateProduct(id, productData) {
    try {
        const response = await fetch(
            `${API_URL}/products/${id}`,
            {
                ...withAuth(),
                method: 'PUT',
                headers: {
                    ...withAuth().headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            }
        );
        
        return handleResponse(response);
    } catch (error) {
        console.error(`Error updating product ${id}:`, error);
        throw error;
    }
}

/**
 * Delete a product
 * @param {number} id - Product ID
 * @returns {Promise<void>}
 */
export async function deleteProduct(id) {
    try {
        const response = await fetch(
            `${API_URL}/products/${id}`,
            {
                ...withAuth(),
                method: 'DELETE'
            }
        );
        
        return handleResponse(response);
    } catch (error) {
        console.error(`Error deleting product ${id}:`, error);
        throw error;
    }
}

/**
 * Fetch categories from API
 * @returns {Promise<Array>} - Categories array
 */
export async function fetchCategories() {
    try {
        const response = await fetch(
            `${API_URL}/categories`,
            withAuth()
        );
        
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
}

/**
 * Fetch customers from API
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Customers array
 */
export async function fetchCustomers(options = {}) {
    const { search, page = 1, size = 20 } = options;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page);
    params.append('size', size);
    
    const queryString = params.toString();
    
    try {
        const response = await fetch(
            `${API_URL}/customers${queryString ? `?${queryString}` : ''}`,
            withAuth()
        );
        
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }
}

/**
 * Fetch customer by ID
 * @param {number} id - Customer ID
 * @returns {Promise<Object>} - Customer object
 */
export async function fetchCustomerById(id) {
    try {
        const response = await fetch(
            `${API_URL}/customers/${id}`,
            withAuth()
        );
        
        return handleResponse(response);
    } catch (error) {
        console.error(`Error fetching customer ${id}:`, error);
        throw error;
    }
}

/**
 * Create a customer
 * @param {Object} customerData - Customer data
 * @returns {Promise<Object>} - Created customer
 */
export async function createCustomer(customerData) {
    try {
        const response = await fetch(
            `${API_URL}/customers`,
            {
                ...withAuth(),
                method: 'POST',
                headers: {
                    ...withAuth().headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customerData)
            }
        );
        
        return handleResponse(response);
    } catch (error) {
        console.error('Error creating customer:', error);
        throw error;
    }
}

/**
 * Update a customer
 * @param {number} id - Customer ID
 * @param {Object} customerData - Customer data
 * @returns {Promise<Object>} - Updated customer
 */
export async function updateCustomer(id, customerData) {
    try {
        const response = await fetch(
            `${API_URL}/customers/${id}`,
            {
                ...withAuth(),
                method: 'PUT',
                headers: {
                    ...withAuth().headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customerData)
            }
        );
        
        return handleResponse(response);
    } catch (error) {
        console.error(`Error updating customer ${id}:`, error);
        throw error;
    }
}

/**
 * Delete a customer
 * @param {number} id - Customer ID
 * @returns {Promise<void>}
 */
export async function deleteCustomer(id) {
    try {
        const response = await fetch(
            `${API_URL}/customers/${id}`,
            {
                ...withAuth(),
                method: 'DELETE'
            }
        );
        
        return handleResponse(response);
    } catch (error) {
        console.error(`Error deleting customer ${id}:`, error);
        throw error;
    }
}

/**
 * Create an order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} - Created order
 */
export async function createOrder(orderData) {
    try {
        const response = await fetch(
            `${API_URL}/orders`,
            {
                ...withAuth(),
                method: 'POST',
                headers: {
                    ...withAuth().headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            }
        );
        
        return handleResponse(response);
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

/**
 * Fetch orders from API
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Orders array
 */
export async function fetchOrders(options = {}) {
    const { customerId, status, page = 1, size = 20 } = options;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (customerId) params.append('customerId', customerId);
    if (status) params.append('status', status);
    params.append('page', page);
    params.append('size', size);
    
    const queryString = params.toString();
    
    try {
        const response = await fetch(
            `${API_URL}/orders${queryString ? `?${queryString}` : ''}`,
            withAuth()
        );
        
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
}

/**
 * Update an order status
 * @param {number} id - Order ID
 * @param {Object} orderData - Order data with status
 * @returns {Promise<Object>} - Updated order
 */
export async function updateOrder(id, orderData) {
    try {
        // Extract only the status from the order data
        // This ensures we can't change products or customer
        const updateData = {
            status: orderData.status
        };
        
        console.log(`Отправка запроса на обновление статуса заказа ${id} на ${orderData.status}`);
        
        const response = await fetch(
            `${API_URL}/orders/${id}`,
            {
                ...withAuth(),
                method: 'PUT',
                headers: {
                    ...withAuth().headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            }
        );
        
        return handleResponse(response);
    } catch (error) {
        console.error(`Error updating order ${id} status:`, error);
        throw error;
    }
}

/**
 * Delete an order
 * @param {number} id - Order ID
 * @returns {Promise<void>}
 */
export async function deleteOrder(id) {
    try {
        const response = await fetch(
            `${API_URL}/orders/${id}`,
            {
                ...withAuth(),
                method: 'DELETE'
            }
        );
        
        return handleResponse(response);
    } catch (error) {
        console.error(`Error deleting order ${id}:`, error);
        throw error;
    }
}

/**
 * Fetch order by ID
 * @param {number} id - Order ID
 * @returns {Promise<Object>} - Order object
 */
export async function fetchOrderById(id) {
    try {
        const response = await fetch(
            `${API_URL}/orders/${id}`,
            withAuth()
        );
        
        return handleResponse(response);
    } catch (error) {
        console.error(`Error fetching order ${id}:`, error);
        throw error;
    }
}

/**
 * Fetch orders for the current logged-in user
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - User orders array
 */
export async function fetchUserOrders(options = {}) {
    const { page = 1, size = 20 } = options;
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    params.append('currentUser', 'true'); // Special parameter to get only orders for the current user
    
    const queryString = params.toString();
    
    try {
        const response = await fetch(
            `${API_URL}/orders/my${queryString ? `?${queryString}` : ''}`,
            withAuth()
        );
        
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw error;
    }
}