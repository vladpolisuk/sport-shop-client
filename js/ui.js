// DOM Elements for modals
const productModal = document.getElementById('product-modal');
const customerModal = document.getElementById('customer-modal');
const orderModal = document.getElementById('order-modal');
const orderDetailsModal = document.getElementById('order-details-modal');

// Import payment and delivery functions
import { initPaymentAndDelivery } from './payment-delivery.js';

// Modal handlers
function closeAllModals() {
    if (productModal) productModal.style.display = 'none';
    if (customerModal) customerModal.style.display = 'none';
    if (orderModal) orderModal.style.display = 'none';
    if (orderDetailsModal) orderDetailsModal.style.display = 'none';
}

// Open modal functions with optional data for editing
function openProductModal(product = null) {
    const form = document.getElementById('product-form');
    const title = document.getElementById('product-modal-title');
    
    form.reset();
    
    if (product) {
        title.textContent = 'Редактировать товар';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-stock').value = product.stock;
        
        // Set image URL if it exists
        if (product.imageUrl) {
            document.getElementById('product-image-url').value = product.imageUrl;
        }
    } else {
        title.textContent = 'Добавить товар';
        document.getElementById('product-id').value = '';
    }
    
    productModal.style.display = 'flex';
}

function openCustomerModal(customer = null) {
    const form = document.getElementById('customer-form');
    const title = document.getElementById('customer-modal-title');
    
    form.reset();
    
    if (customer) {
        title.textContent = 'Редактировать клиента';
        document.getElementById('customer-id').value = customer.id;
        document.getElementById('customer-name').value = customer.name;
        document.getElementById('customer-phone').value = customer.phone;
        document.getElementById('customer-email').value = customer.email;
    } else {
        title.textContent = 'Добавить клиента';
        document.getElementById('customer-id').value = '';
    }
    
    customerModal.style.display = 'flex';
}

function openOrderModal(order = null) {
    // Get the modal
    const orderModal = document.getElementById('order-modal');
    if (!orderModal) {
        console.error('Order modal not found');
        return;
    }
    
    // Ensure we have the order items container
    const container = document.getElementById('order-items-container');
    if (!container) {
        console.error('Order items container not found');
        return;
    }
    
    // Clear existing items
    container.innerHTML = '';
    
    // Populate customers dropdown
    const customerSelect = document.getElementById('order-customer');
    if (!customerSelect) {
        console.error('Customer select not found');
        return;
    }
    
    // Reset form
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.reset();
    }
    
    if (order) {
        console.log('Editing order with status:', order.status); // Debug log to see the server status
        
        // Editing existing order - only show status
        const title = document.getElementById('order-modal-title');
        const customerInfoGroup = document.getElementById('customer-info-group');
        const orderItemsGroup = document.getElementById('order-items-group');
        const addItemButton = document.getElementById('add-order-item');
        const statusGroup = document.getElementById('status-group');
        const statusSelect = document.getElementById('order-status');
        
        // Payment and delivery sections - hide when editing
        const paymentMethodGroup = document.getElementById('payment-method-group');
        const deliveryMethodGroup = document.getElementById('delivery-method-group');
        const deliveryAddressGroup = document.getElementById('delivery-address-group');
        const deliveryInfo = document.getElementById('delivery-info');
        
        if (paymentMethodGroup) paymentMethodGroup.style.display = 'none';
        if (deliveryMethodGroup) deliveryMethodGroup.style.display = 'none';
        if (deliveryAddressGroup) deliveryAddressGroup.style.display = 'none';
        if (deliveryInfo) deliveryInfo.style.display = 'none';
        
        // Set modal title
        if (title) title.textContent = 'Обновить статус заказа';
        
        // Set order ID
        if (order.id) document.getElementById('order-id').value = order.id;

        // Show status group and populate with current status
        if (statusGroup) {
            statusGroup.style.display = 'block';
        }

        // Hide customer selection and disable it
        if (customerInfoGroup) {
            customerInfoGroup.style.display = 'block';
            customerSelect.disabled = true;
        }
        
        // Display customer information as readonly text instead of dropdown
        customerSelect.innerHTML = '';
        const option = document.createElement('option');
        option.value = order.customerId || '';
        option.textContent = order.customerName || 'Неизвестно';
        option.selected = true;
        customerSelect.appendChild(option);
        
        // Hide order items UI, disable adding new items
        if (orderItemsGroup) {
            orderItemsGroup.style.display = 'block';
        }
        
        if (addItemButton) {
            addItemButton.style.display = 'none';
        }
        
        // Show and configure status selection
        if (statusGroup && statusSelect) {
            statusGroup.style.display = 'block';
            
            // Clear existing options
            statusSelect.innerHTML = '';
            
            // Define status options - make sure these match exactly what the server expects
            const statusOptions = [
                { value: 'IN_WORK', label: 'В работе' },
                { value: 'COMPLETED', label: 'Завершён' }
            ];
            
            // Create status options
            statusOptions.forEach(statusOption => {
                const option = document.createElement('option');
                option.value = statusOption.value;
                option.textContent = statusOption.label;
                
                // Pre-select the matching status
                if (statusOption.value === order.status) {
                    option.selected = true;
                }
                
                statusSelect.appendChild(option);
            });
            
            // Set current status explicitly after adding all options
            if (order.status) {
                statusSelect.value = order.status;
                console.log('Текущий статус заказа:', order.status);
                console.log('Установлено значение dropdown:', statusSelect.value);
                
                // Дополнительно проверяем, что опция с таким значением существует
                const exists = Array.from(statusSelect.options).some(option => option.value === order.status);
                console.log('Существует ли опция с таким значением:', exists);
            }
        }
        
        // Display order items as readonly information
        if (order.orderItems && order.orderItems.length > 0) {
            // Create a summary list of order items (readonly)
            const orderItemsSummary = document.createElement('div');
            orderItemsSummary.className = 'order-items-summary';
            
            const itemsList = document.createElement('ul');
            let total = 0;
            
            order.orderItems.forEach(item => {
                const listItem = document.createElement('li');
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                
                listItem.textContent = `${item.productName || 'Товар'} - ${item.quantity} шт. x ${item.price.toFixed(2)} руб. = ${itemTotal.toFixed(2)} руб.`;
                itemsList.appendChild(listItem);
            });
            
            orderItemsSummary.appendChild(itemsList);
            
            // Add total
            const totalElement = document.createElement('div');
            totalElement.className = 'order-total';
            totalElement.innerHTML = `<strong>Итого: ${total.toFixed(2)} руб.</strong>`;
            orderItemsSummary.appendChild(totalElement);
            
            // Add the summary to the order items container
            container.appendChild(orderItemsSummary);
        }
        
        // Display delivery and payment information
        if (order.delivery || order.payment) {
            const orderDetailsSummary = document.createElement('div');
            orderDetailsSummary.className = 'order-items-summary';
            orderDetailsSummary.innerHTML = '<h3>Информация о доставке и оплате</h3>';
            
            if (order.delivery) {
                const deliveryInfo = document.createElement('div');
                deliveryInfo.className = 'delivery-info-item';
                deliveryInfo.innerHTML = `
                    <strong>Доставка:</strong> ${order.delivery.methodName}<br>
                    <strong>Адрес:</strong> ${order.delivery.address || 'Самовывоз'}<br>
                    <strong>Стоимость доставки:</strong> ${order.delivery.cost.toFixed(2)} руб.<br>
                    <strong>Статус доставки:</strong> ${translateStatus(order.delivery.status)}<br>
                    <strong>Ожидаемая дата доставки:</strong> ${formatDate(order.delivery.estimatedDeliveryDate)}<br>
                    ${order.delivery.trackingNumber ? `<strong>Номер отслеживания:</strong> ${order.delivery.trackingNumber}` : ''}
                `;
                orderDetailsSummary.appendChild(deliveryInfo);
            }
            
            if (order.payment) {
                const paymentInfo = document.createElement('div');
                paymentInfo.className = 'payment-info-item';
                paymentInfo.innerHTML = `
                    <strong>Способ оплаты:</strong> ${order.payment.methodName}<br>
                    <strong>Статус оплаты:</strong> ${translatePaymentStatus(order.payment.status)}<br>
                    ${order.payment.transactionId ? `<strong>ID транзакции:</strong> ${order.payment.transactionId}<br>` : ''}
                    ${order.payment.paidAt ? `<strong>Дата оплаты:</strong> ${formatDate(order.payment.paidAt)}` : ''}
                `;
                orderDetailsSummary.appendChild(paymentInfo);
            }
            
            container.appendChild(orderDetailsSummary);
        }
    } else {
        // Creating new order - show all form fields
        const title = document.getElementById('order-modal-title');
        const customerInfoGroup = document.getElementById('customer-info-group');
        const orderItemsGroup = document.getElementById('order-items-group');
        const statusGroup = document.getElementById('status-group');
        
        // Payment and delivery sections - show when creating new order
        const paymentMethodGroup = document.getElementById('payment-method-group');
        const deliveryMethodGroup = document.getElementById('delivery-method-group');
        const deliveryAddressGroup = document.getElementById('delivery-address-group');
        
        if (paymentMethodGroup) paymentMethodGroup.style.display = 'block';
        if (deliveryMethodGroup) deliveryMethodGroup.style.display = 'block';
        if (deliveryAddressGroup) deliveryAddressGroup.style.display = 'block';
        
        // Set modal title
        if (title) title.textContent = 'Создать заказ';
        
        // Hide status selection for new orders
        if (statusGroup) {
            statusGroup.style.display = 'none';
        }
        
        // Show and enable customer selection
        if (customerInfoGroup) {
            customerInfoGroup.style.display = 'block';
            customerSelect.disabled = false;
        }
        
        // Show order items UI
        if (orderItemsGroup) {
            orderItemsGroup.style.display = 'block';
        }
        
        // Add initial empty order item row
        addOrderItemRow();
        
        // Initialize payment and delivery methods
        initPaymentAndDelivery();
    }
    
    orderModal.style.display = 'flex';
}

function openOrderDetailsModal(order) {
    // Get the modal
    const detailsModal = document.getElementById('order-details-modal');
    if (!detailsModal) {
        console.error('Order details modal not found');
        return;
    }
    
    // Get modal content elements
    const orderId = document.getElementById('order-details-id');
    const orderDate = document.getElementById('order-details-date');
    const orderStatus = document.getElementById('order-details-status');
    const customerInfo = document.getElementById('order-details-customer');
    const itemsContainer = document.getElementById('order-details-items');
    const totalAmount = document.getElementById('order-details-total');
    
    // Set order details
    if (orderId) orderId.textContent = order.id;
    if (orderDate) orderDate.textContent = formatDate(order.createdAt);
    if (orderStatus) orderStatus.textContent = translateStatus(order.status);
    
    // Set customer information
    if (customerInfo) {
        customerInfo.innerHTML = '';
        
        if (order.customer) {
            // Old format with nested customer object
            customerInfo.innerHTML = `
                <p><strong>Имя:</strong> ${order.customer.name || 'Н/Д'}</p>
                <p><strong>Телефон:</strong> ${order.customer.phone || 'Н/Д'}</p>
                <p><strong>Email:</strong> ${order.customer.email || 'Н/Д'}</p>
            `;
        } else if (order.customerName || order.customerEmail || order.customerPhone) {
            // New format with customer info at root level
            customerInfo.innerHTML = `
                <p><strong>Имя:</strong> ${order.customerName || 'Н/Д'}</p>
                <p><strong>Телефон:</strong> ${order.customerPhone || 'Н/Д'}</p>
                <p><strong>Email:</strong> ${order.customerEmail || 'Н/Д'}</p>
            `;
        } else {
            customerInfo.innerHTML = '<p>Информация о клиенте недоступна</p>';
        }
    }
    
    // Set order items
    if (itemsContainer) {
        itemsContainer.innerHTML = '';
        
        if (order.orderItems && order.orderItems.length > 0) {
            let subtotal = 0;
            
            order.orderItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'order-details-item';
                
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                
                itemElement.innerHTML = `
                    <span class="item-name">${item.productName || 'Товар'}</span>
                    <span class="item-quantity">${item.quantity} шт.</span>
                    <span class="item-price">${item.price.toFixed(2)} руб.</span>
                    <span class="item-total">${itemTotal.toFixed(2)} руб.</span>
                `;
                
                itemsContainer.appendChild(itemElement);
            });
            
            // Add delivery info if available in either format
            if (order.delivery && order.delivery.cost) {
                const deliveryElement = document.createElement('div');
                deliveryElement.className = 'order-details-item delivery-item';
                
                deliveryElement.innerHTML = `
                    <span class="item-name">Доставка (${order.delivery.methodName || 'Стандартная'})</span>
                    <span class="item-quantity"></span>
                    <span class="item-price"></span>
                    <span class="item-total">${order.delivery.cost.toFixed(2)} руб.</span>
                `;
                
                itemsContainer.appendChild(deliveryElement);
                
                // Add delivery to subtotal
                subtotal += order.delivery.cost;
            } else if (order.deliveryMethod) {
                // Show delivery method if we have it, even without the cost
                const deliveryElement = document.createElement('div');
                deliveryElement.className = 'order-details-item delivery-item';
                
                deliveryElement.innerHTML = `
                    <span class="item-name">Доставка (${order.deliveryMethod})</span>
                    <span class="item-quantity"></span>
                    <span class="item-price"></span>
                    <span class="item-total">включена</span>
                `;
                
                itemsContainer.appendChild(deliveryElement);
                
                // Note: We don't add to subtotal since we don't have specific cost
                // The server's totalPrice should already include delivery
            }
            
            // Set total amount - prefer the server's total price which should include delivery
            if (totalAmount) {
                totalAmount.textContent = `${(order.totalPrice || subtotal).toFixed(2)} руб.`;
            }
        } else {
            itemsContainer.innerHTML = '<p>Нет товаров в заказе</p>';
            
            if (totalAmount) {
                totalAmount.textContent = '0.00 руб.';
            }
        }
    }
    
    // Add payment and delivery information
    const paymentDeliveryInfo = document.getElementById('order-details-payment-delivery');
    if (paymentDeliveryInfo) {
        paymentDeliveryInfo.innerHTML = '<h3>Информация о доставке и оплате</h3>';
        
        // Delivery information
        const deliveryInfo = document.createElement('div');
        deliveryInfo.className = 'info-section';
        
        if (order.deliveryMethod || order.deliveryAddress) {
            deliveryInfo.innerHTML = `
                <h4>Информация о доставке</h4>
                <p><strong>Способ доставки:</strong> ${order.deliveryMethod || 'Не указан'}</p>
                <p><strong>Адрес:</strong> ${order.deliveryAddress || 'Не указан'}</p>
            `;
        } else if (order.delivery) {
            // Backward compatibility with old format
            deliveryInfo.innerHTML = `
                <h4>Информация о доставке</h4>
                <p><strong>Способ доставки:</strong> ${order.delivery.methodName || 'Не указан'}</p>
                <p><strong>Адрес:</strong> ${order.delivery.address || 'Самовывоз'}</p>
                ${order.delivery.status ? `<p><strong>Статус:</strong> ${translateStatus(order.delivery.status)}</p>` : ''}
                ${order.delivery.estimatedDeliveryDate ? `<p><strong>Ожидаемая дата:</strong> ${formatDate(order.delivery.estimatedDeliveryDate)}</p>` : ''}
                ${order.delivery.trackingNumber ? `<p><strong>Номер отслеживания:</strong> ${order.delivery.trackingNumber}</p>` : ''}
            `;
        } else {
            deliveryInfo.innerHTML = `
                <h4>Информация о доставке</h4>
                <p>Данные о доставке отсутствуют</p>
            `;
        }
        paymentDeliveryInfo.appendChild(deliveryInfo);
        
        // Payment information
        const paymentInfo = document.createElement('div');
        paymentInfo.className = 'info-section';
        
        if (order.paymentMethod) {
            paymentInfo.innerHTML = `
                <h4>Информация об оплате</h4>
                <p><strong>Способ оплаты:</strong> ${order.paymentMethod || 'Не указан'}</p>
            `;
        } else if (order.payment) {
            // Backward compatibility with old format
            paymentInfo.innerHTML = `
                <h4>Информация об оплате</h4>
                <p><strong>Способ оплаты:</strong> ${order.payment.methodName || 'Не указан'}</p>
                ${order.payment.status ? `<p><strong>Статус:</strong> ${translatePaymentStatus(order.payment.status)}</p>` : ''}
                ${order.payment.transactionId ? `<p><strong>ID транзакции:</strong> ${order.payment.transactionId}</p>` : ''}
                ${order.payment.paidAt ? `<p><strong>Дата оплаты:</strong> ${formatDate(order.payment.paidAt)}</p>` : ''}
            `;
        } else {
            paymentInfo.innerHTML = `
                <h4>Информация об оплате</h4>
                <p>Данные об оплате отсутствуют</p>
            `;
        }
        paymentDeliveryInfo.appendChild(paymentInfo);
    }
    
    // Display modal
    detailsModal.style.display = 'flex';
}

// Helper functions for date and status formatting
function formatDate(dateString) {
    if (!dateString) return 'Н/Д';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function translateStatus(status) {
    const statusMap = {
        'CREATED': 'Создан',
        'PROCESSING': 'В обработке',
        'SHIPPED': 'Отправлен',
        'DELIVERED': 'Доставлен',
        'COMPLETED': 'Завершен',
        'CANCELLED': 'Отменен',
        'PENDING': 'В ожидании',
        'PREPARING': 'Подготовка'
    };
    
    return statusMap[status] || status;
}

function translatePaymentStatus(status) {
    const statusMap = {
        'PENDING': 'Ожидает оплаты',
        'PAID': 'Оплачен',
        'FAILED': 'Ошибка оплаты',
        'REFUNDED': 'Возвращен'
    };
    
    return statusMap[status] || status;
}

function addOrderItemRow(item = null) {
    const container = document.getElementById('order-items-container');
    if (!container) {
        console.error('Order items container not found');
        return;
    }
    
    // Create item row
    const itemRow = document.createElement('div');
    itemRow.className = 'order-item';
    
    // Create product selection element
    const productSelect = document.createElement('select');
    productSelect.className = 'product-select';
    productSelect.innerHTML = '<option value="">Выберите товар</option>';
    
    // Create quantity input
    const quantityInput = document.createElement('input');
    quantityInput.className = 'quantity-input';
    quantityInput.type = 'number';
    quantityInput.min = '1';
    quantityInput.value = item ? item.quantity : '1';
    
    // Create remove button
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-item';
    removeButton.textContent = 'Удалить';
    removeButton.addEventListener('click', () => {
        itemRow.remove();
    });
    
    // Add elements to the row
    itemRow.appendChild(productSelect);
    itemRow.appendChild(quantityInput);
    itemRow.appendChild(removeButton);
    
    // Add the row to the container
    container.appendChild(itemRow);
    
    // Populate products dropdown
    loadProductsForSelect(productSelect, item ? item.productId : null);
}

// Helper function to load products for select element
async function loadProductsForSelect(selectElement, selectedProductId = null) {
    try {
        // Import required function
        const { fetchProducts } = await import('./api.js');
        
        // Clear all options except first one
        const placeholder = selectElement.querySelector('option:first-child');
        selectElement.innerHTML = '';
        selectElement.appendChild(placeholder);
        
        // Fetch products
        const response = await fetchProducts();
        const products = response.data || [];
        
        // Add product options
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} - ${product.price.toFixed(2)} руб.`;
            
            if (selectedProductId && product.id == selectedProductId) {
                option.selected = true;
            }
            
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading products for select:', error);
        alert('Ошибка при загрузке товаров');
    }
}

// Export functions to be used in other modules
export {
    addOrderItemRow,
    closeAllModals,
    openCustomerModal,
    openOrderDetailsModal,
    openOrderModal,
    openProductModal
};

