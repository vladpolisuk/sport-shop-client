// Import API functions
import {
    createCustomer,
    createOrder,
    createProduct,
    updateCustomer,
    updateOrder,
    updateProduct
} from './api.js';

// Import UI and data loading functions
import { loadCustomers, loadOrders, loadProducts } from './data-loaders.js';
import { getOrderPaymentDeliveryData } from './payment-delivery.js';
import { closeAllModals } from './ui.js';

// Form submit handlers
async function handleProductSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value;
    const stock = parseInt(document.getElementById('product-stock').value);
    const imageUrl = document.getElementById('product-image-url').value.trim();
    
    const product = { 
        name, 
        price, 
        description, 
        stock
    };
    
    // Add imageUrl only if it's not empty
    if (imageUrl) {
        product.imageUrl = imageUrl;
    }
    
    try {
        if (id) {
            // Update existing product - передаем id и product как отдельные параметры
            await updateProduct(id, product);
        } else {
            // Create new product
            await createProduct(product);
        }
        
        closeAllModals();
        loadProducts();
    } catch (error) {
        alert('Ошибка при сохранении товара: ' + error.message);
    }
}

async function handleCustomerSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('customer-id').value;
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const email = document.getElementById('customer-email').value;
    
    const customer = { name, phone, email };
    
    try {
        if (id) {
            // Update existing customer - передаем id и customer как отдельные параметры
            await updateCustomer(id, customer);
        } else {
            // Create new customer
            await createCustomer(customer);
        }
        
        closeAllModals();
        loadCustomers();
    } catch (error) {
        alert('Ошибка при сохранении клиента: ' + error.message);
    }
}

async function handleOrderSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('order-id').value;
    const customerId = document.getElementById('order-customer').value;
    const status = document.getElementById('order-status')?.value;
    
    console.log('Отправка формы заказа:', { id, status });
    
    try {
        if (id) {
            // Update existing order - только статус
            const orderUpdate = {
                status: status || 'IN_WORK'
            };
            console.log('Обновление статуса заказа:', orderUpdate);
            await updateOrder(id, orderUpdate);
        } else {
            // Get order items для нового заказа
            const orderItems = [];
            document.querySelectorAll('.order-item').forEach(item => {
                const productId = item.querySelector('.product-select').value;
                const quantity = parseInt(item.querySelector('.quantity-input').value);
                
                if (productId && quantity > 0) {
                    orderItems.push({
                        product: { id: productId },
                        quantity: quantity
                    });
                }
            });
            
            // Проверяем, что выбран клиент и добавлены товары
            if (!customerId) {
                alert('Пожалуйста, выберите клиента');
                return;
            }
            
            if (orderItems.length === 0) {
                alert('Пожалуйста, добавьте хотя бы один товар');
                return;
            }
            
            // Get payment and delivery data
            const paymentDeliveryData = getOrderPaymentDeliveryData();
            
            // Validate payment and delivery data
            if (!paymentDeliveryData.paymentMethodId) {
                alert('Пожалуйста, выберите способ оплаты');
                return;
            }
            
            if (!paymentDeliveryData.deliveryMethodId) {
                alert('Пожалуйста, выберите способ доставки');
                return;
            }
            
            if (paymentDeliveryData.deliveryMethodId !== 3 && !paymentDeliveryData.deliveryAddress) {
                // If not self-pickup, address is required
                alert('Пожалуйста, введите адрес доставки');
                return;
            }
            
            const order = {
                customer: { id: customerId },
                orderItems: orderItems,
                deliveryMethodId: paymentDeliveryData.deliveryMethodId,
                deliveryAddress: paymentDeliveryData.deliveryAddress,
                paymentMethodId: paymentDeliveryData.paymentMethodId
            };
            
            console.log('Создание нового заказа:', order);
            
            // Create new order
            await createOrder(order);
        }
        
        closeAllModals();
        loadOrders();
    } catch (error) {
        alert('Ошибка при сохранении заказа: ' + error.message);
    }
}

// Export the handlers to be used in other modules
export {
    handleCustomerSubmit,
    handleOrderSubmit, handleProductSubmit
};

