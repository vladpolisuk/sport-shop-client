// Payment and Delivery Handling Module
import {
    calculateDelivery,
    fetchDeliveryMethods,
    fetchPaymentMethods
} from './api.js';

// Global state for selected methods
let selectedPaymentMethod = null;
let selectedDeliveryMethod = null;
let deliveryCalculation = null;
let currentOrderItems = [];
let totalItemsPrice = 0;

/**
 * Format price to display as currency
 * @param {number} price - Price amount
 * @returns {string} - Formatted price
 */
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2
    }).format(price).replace(/\s/g, ' ');
}

/**
 * Format date to display in human-readable format
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

/**
 * Calculate total weight of order items
 * @returns {number} - Total weight
 */
function calculateTotalWeight() {
    // In a real app, we would have product weights
    // For now, let's assume each item weighs 1kg
    return currentOrderItems.reduce((total, item) => {
        const quantity = parseInt(item.querySelector('.quantity-input').value) || 0;
        return total + quantity;
    }, 0);
}

/**
 * Calculate total price of order items
 * @returns {number} - Total price
 */
function calculateItemsTotal() {
    // This is a simplified version - in a real app, we'd get prices from the API
    // Here we're just using a fixed price per item for demonstration
    const pricePerItem = 1000; // 1000 rubles per item
    return currentOrderItems.reduce((total, item) => {
        const quantity = parseInt(item.querySelector('.quantity-input').value) || 0;
        return total + (quantity * pricePerItem);
    }, 0);
}

/**
 * Update the order summary based on selected items and delivery
 */
function updateOrderSummary() {
    const deliveryCostElement = document.getElementById('delivery-cost');
    const estimatedDateElement = document.getElementById('estimated-delivery-date');
    const totalPriceElement = document.getElementById('total-price');
    const deliveryInfoSection = document.getElementById('delivery-info');
    
    // Calculate items total
    totalItemsPrice = calculateItemsTotal();
    
    if (deliveryCalculation) {
        deliveryInfoSection.style.display = 'block';
        
        // Update delivery cost
        deliveryCostElement.textContent = formatPrice(deliveryCalculation.cost);
        
        // Update estimated delivery date
        estimatedDateElement.textContent = formatDate(deliveryCalculation.estimatedDeliveryDate);
        
        // Update total price
        const totalPrice = totalItemsPrice + deliveryCalculation.cost;
        totalPriceElement.textContent = formatPrice(totalPrice);
    } else {
        deliveryInfoSection.style.display = 'none';
    }
}

/**
 * Calculate delivery based on selected method and address
 * @param {number} deliveryMethodId - Selected delivery method ID
 * @param {string} address - Delivery address
 */
async function calculateDeliveryCost(deliveryMethodId, address) {
    if (!deliveryMethodId || !address) {
        console.error('Missing delivery method ID or address');
        return;
    }
    
    try {
        // Get order items for calculation
        const items = Array.from(document.querySelectorAll('.order-item')).map(item => {
            const productId = item.querySelector('.product-select').value;
            const quantity = parseInt(item.querySelector('.quantity-input').value);
            
            return {
                productId: parseInt(productId),
                quantity: quantity
            };
        });
        
        // Calculate total weight
        const weight = calculateTotalWeight();
        
        // Calculate delivery
        const deliveryData = {
            deliveryMethodId: deliveryMethodId,
            address: address,
            weight: weight,
            items: items
        };
        
        const result = await calculateDelivery(deliveryData);
        
        // Store calculation result
        deliveryCalculation = result.data;
        
        // Update order summary
        updateOrderSummary();
        
        return result.data;
    } catch (error) {
        console.error('Error calculating delivery:', error);
        alert('Ошибка при расчете доставки: ' + error.message);
    }
}

/**
 * Load payment methods and render in the UI
 */
async function loadPaymentMethods() {
    const container = document.getElementById('payment-methods-container');
    
    if (!container) {
        console.error('Payment methods container not found');
        return;
    }
    
    try {
        container.innerHTML = '<p class="loading-message">Загрузка способов оплаты...</p>';
        
        const response = await fetchPaymentMethods();
        const methods = response.data || [];
        
        if (methods.length === 0) {
            container.innerHTML = '<p class="empty-message">Нет доступных способов оплаты</p>';
            return;
        }
        
        container.innerHTML = '';
        
        methods.forEach(method => {
            if (method.isActive) {
                const methodElement = document.createElement('div');
                methodElement.className = 'payment-method-item';
                methodElement.dataset.id = method.id;
                methodElement.dataset.code = method.code;
                
                methodElement.innerHTML = `
                    <div class="method-icon" style="background-image: url('${method.iconUrl}')"></div>
                    <div class="method-details">
                        <div class="method-name">${method.name}</div>
                        <div class="method-description">${method.description}</div>
                    </div>
                    <input type="radio" name="payment-method" value="${method.id}">
                `;
                
                methodElement.addEventListener('click', () => {
                    // Deselect all other methods
                    container.querySelectorAll('.payment-method-item').forEach(item => {
                        item.classList.remove('selected');
                        item.querySelector('input[type="radio"]').checked = false;
                    });
                    
                    // Select this method
                    methodElement.classList.add('selected');
                    methodElement.querySelector('input[type="radio"]').checked = true;
                    selectedPaymentMethod = method;
                });
                
                container.appendChild(methodElement);
            }
        });
        
        // Select first method by default
        if (methods.length > 0) {
            const firstMethod = container.querySelector('.payment-method-item');
            if (firstMethod) {
                firstMethod.click();
            }
        }
    } catch (error) {
        console.error('Error loading payment methods:', error);
        container.innerHTML = `<p class="error-message">Ошибка загрузки способов оплаты: ${error.message}</p>`;
    }
}

/**
 * Load delivery methods and render in the UI
 */
async function loadDeliveryMethods() {
    const container = document.getElementById('delivery-methods-container');
    
    if (!container) {
        console.error('Delivery methods container not found');
        return;
    }
    
    try {
        container.innerHTML = '<p class="loading-message">Загрузка способов доставки...</p>';
        
        const response = await fetchDeliveryMethods();
        const methods = response.data || [];
        
        if (methods.length === 0) {
            container.innerHTML = '<p class="empty-message">Нет доступных способов доставки</p>';
            return;
        }
        
        container.innerHTML = '';
        
        methods.forEach(method => {
            if (method.isActive) {
                const methodElement = document.createElement('div');
                methodElement.className = 'delivery-method-item';
                methodElement.dataset.id = method.id;
                methodElement.dataset.code = method.code;
                
                const estimatedDays = method.estimatedDaysMin === method.estimatedDaysMax
                    ? `${method.estimatedDaysMin} дн.`
                    : `${method.estimatedDaysMin}-${method.estimatedDaysMax} дн.`;
                
                methodElement.innerHTML = `
                    <div class="method-details">
                        <div class="method-name">${method.name}</div>
                        <div class="method-description">${method.description}</div>
                        <div class="method-time">Срок доставки: ${estimatedDays}</div>
                    </div>
                    <div class="method-price">${formatPrice(method.baseCost)}</div>
                    <input type="radio" name="delivery-method" value="${method.id}">
                `;
                
                methodElement.addEventListener('click', () => {
                    // Deselect all other methods
                    container.querySelectorAll('.delivery-method-item').forEach(item => {
                        item.classList.remove('selected');
                        item.querySelector('input[type="radio"]').checked = false;
                    });
                    
                    // Select this method
                    methodElement.classList.add('selected');
                    methodElement.querySelector('input[type="radio"]').checked = true;
                    selectedDeliveryMethod = method;
                    
                    // Calculate delivery if address is available
                    const addressInput = document.getElementById('delivery-address');
                    if (addressInput && addressInput.value.trim() !== '') {
                        calculateDeliveryCost(method.id, addressInput.value);
                    }
                });
                
                container.appendChild(methodElement);
            }
        });
        
        // Select first method by default
        if (methods.length > 0) {
            const firstMethod = container.querySelector('.delivery-method-item');
            if (firstMethod) {
                firstMethod.click();
            }
        }
        
        // Add event listener to address input for delivery calculation
        const addressInput = document.getElementById('delivery-address');
        if (addressInput) {
            addressInput.addEventListener('change', () => {
                if (selectedDeliveryMethod && addressInput.value.trim() !== '') {
                    calculateDeliveryCost(selectedDeliveryMethod.id, addressInput.value);
                }
            });
        }
    } catch (error) {
        console.error('Error loading delivery methods:', error);
        container.innerHTML = `<p class="error-message">Ошибка загрузки способов доставки: ${error.message}</p>`;
    }
}

/**
 * Initialize payment and delivery functionality
 */
export function initPaymentAndDelivery() {
    // Load payment and delivery methods
    loadPaymentMethods();
    loadDeliveryMethods();
    
    // Track order items for delivery calculation
    const orderItemsContainer = document.getElementById('order-items-container');
    if (orderItemsContainer) {
        // Initial items
        currentOrderItems = Array.from(orderItemsContainer.querySelectorAll('.order-item'));
        
        // Watch for changes
        const observer = new MutationObserver((mutations) => {
            currentOrderItems = Array.from(orderItemsContainer.querySelectorAll('.order-item'));
            
            // Recalculate delivery if we have a method and address selected
            if (selectedDeliveryMethod) {
                const addressInput = document.getElementById('delivery-address');
                if (addressInput && addressInput.value.trim() !== '') {
                    calculateDeliveryCost(selectedDeliveryMethod.id, addressInput.value);
                }
            }
        });
        
        observer.observe(orderItemsContainer, { childList: true });
        
        // Listen for quantity changes
        orderItemsContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                // Recalculate delivery if we have a method and address selected
                if (selectedDeliveryMethod) {
                    const addressInput = document.getElementById('delivery-address');
                    if (addressInput && addressInput.value.trim() !== '') {
                        calculateDeliveryCost(selectedDeliveryMethod.id, addressInput.value);
                    }
                }
            }
        });
    }
}

/**
 * Get selected payment and delivery data for order
 * @returns {Object} - Selected payment and delivery data
 */
export function getOrderPaymentDeliveryData() {
    const addressInput = document.getElementById('delivery-address');
    
    return {
        paymentMethodId: selectedPaymentMethod ? selectedPaymentMethod.id : null,
        deliveryMethodId: selectedDeliveryMethod ? selectedDeliveryMethod.id : null,
        deliveryAddress: addressInput ? addressInput.value : '',
        deliveryCost: deliveryCalculation ? deliveryCalculation.cost : 0,
        estimatedDeliveryDate: deliveryCalculation ? deliveryCalculation.estimatedDeliveryDate : null
    };
}

// Export the selected methods to be accessed from other modules
export { deliveryCalculation, selectedDeliveryMethod, selectedPaymentMethod };

