// DOM Elements for modals
const productModal = document.getElementById('product-modal');
const customerModal = document.getElementById('customer-modal');
const orderModal = document.getElementById('order-modal');
const orderDetailsModal = document.getElementById('order-details-modal');

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
    
    productModal.style.display = 'block';
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
    
    customerModal.style.display = 'block';
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
            
            container.appendChild(orderItemsSummary);
        } else {
            container.innerHTML = '<p>Нет товаров в заказе</p>';
        }
    } else {
        // This is a new order - show full UI
        const title = document.getElementById('order-modal-title');
        const customerInfoGroup = document.getElementById('customer-info-group');
        const orderItemsGroup = document.getElementById('order-items-group');
        const addItemButton = document.getElementById('add-order-item');
        const statusGroup = document.getElementById('status-group');
        
        if (title) title.textContent = 'Создать заказ';
        document.getElementById('order-id').value = '';
        
        // Reset and enable customer selection
        customerSelect.disabled = false;
        customerSelect.innerHTML = '<option value="">Выберите клиента</option>';
        
        // Populate customer dropdown for new orders
        fetchCustomers().then(customers => {
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = `${customer.name} (${customer.phone})`;
                customerSelect.appendChild(option);
            });
        });
        
        // Show order items UI for new orders
        if (orderItemsGroup) {
            orderItemsGroup.style.display = 'block';
        }
        
        if (addItemButton) {
            addItemButton.style.display = 'block';
        }
        
        // Hide status for new orders
        if (statusGroup) {
            statusGroup.style.display = 'none';
        }
        
        // Add one empty item row by default
        addOrderItemRow();
    }
    
    orderModal.style.display = 'block';
}

function openOrderDetailsModal(order) {
    const detailsContainer = document.getElementById('order-details');
    
    // Format date
    const orderDate = new Date(order.createdAt).toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Calculate total price
    const totalPrice = order.totalPrice.toFixed(2);
    
    // Format status for display
    let formattedStatus = order.status;
    switch (order.status) {
        case 'IN_WORK':
            formattedStatus = 'В работе';
            break;
        case 'COMPLETED':
            formattedStatus = 'Завершён';
            break;
    }
    
    // Build order details HTML
    let detailsHTML = `
        <div class="order-details-info">
            <p><strong>Номер заказа:</strong> ${order.id}</p>
            <h3>Информация о клиенте:</h3>
            <div class="customer-details">
                <p><strong>ID клиента:</strong> ${order.customerId || 'Не указан'}</p>
                <p><strong>Имя:</strong> ${order.customerName || 'Не указан'}</p>
                <p><strong>Email:</strong> ${order.customerEmail || 'Не указан'}</p>
                <p><strong>Телефон:</strong> ${order.customerPhone || 'Не указан'}</p>
            </div>
            <p><strong>Статус:</strong> ${formattedStatus}</p>
            <p><strong>Дата:</strong> ${orderDate}</p>
        </div>
        <div class="order-details-items">
            <h3>Товары в заказе:</h3>
    `;
    
    order.orderItems.forEach(item => {
        // Get the price and calculate total
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 1;
        const itemTotal = (itemPrice * itemQuantity).toFixed(2);
        
        detailsHTML += `
            <div class="order-details-item">
                <div>
                    <strong>${item.productName || 'Товар'}</strong>
                </div>
                <div>
                    <div>${itemQuantity} x ${itemPrice.toFixed(2)} руб.</div>
                    <div><strong>${itemTotal} руб.</strong></div>
                </div>
            </div>
        `;
    });
    
    detailsHTML += `
        <div class="order-total">
            Итого: ${totalPrice} руб.
        </div>
    `;
    
    detailsContainer.innerHTML = detailsHTML;
    const orderDetailsModal = document.getElementById('order-details-modal');
    if (orderDetailsModal) {
        orderDetailsModal.style.display = 'block';
    } else {
        console.error('Order details modal element not found');
    }
}

// Add an order item row to the form
function addOrderItemRow(item = null) {
    const container = document.getElementById('order-items-container');
    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';
    
    // Create product dropdown
    const productSelect = document.createElement('select');
    productSelect.className = 'product-select';
    productSelect.required = true;
    
    // Create quantity input
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.className = 'quantity-input';
    quantityInput.min = 1;
    quantityInput.value = item ? item.quantity : 1;
    quantityInput.required = true;
    
    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-item';
    removeBtn.textContent = 'Удалить';
    removeBtn.addEventListener('click', () => {
        container.removeChild(orderItem);
    });
    
    // Load products for dropdown
    fetchProducts().then(products => {
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} - ${product.price} руб.`;
            productSelect.appendChild(option);
        });
        
        if (item) {
            productSelect.value = item.product.id;
        }
    });
    
    // Add elements to the order item
    orderItem.appendChild(productSelect);
    orderItem.appendChild(quantityInput);
    orderItem.appendChild(removeBtn);
    
    // Add the item to the container
    container.appendChild(orderItem);
}

// Import API functions
import {
    fetchCustomers,
    fetchProducts
} from './api.js';

// Export UI functions
export {
    addOrderItemRow, closeAllModals, openCustomerModal, openOrderDetailsModal, openOrderModal, openProductModal
};

