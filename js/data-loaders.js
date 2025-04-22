// Import necessary functions
import {
    deleteCustomer,
    deleteOrder,
    deleteProduct,
    fetchCustomers,
    fetchOrders,
    fetchProducts
} from './api.js';

import {
    openCustomerModal,
    openOrderDetailsModal,
    openOrderModal,
    openProductModal
} from './ui.js';

// Data loading functions
async function loadProducts() {
    // Найдем или создадим элементы для отображения товаров
    const section = document.getElementById('products');
    if (!section) {
        console.error('Products section not found');
        return Promise.reject(new Error('Products section not found'));
    }

    // Найдем или создадим контейнер таблицы
    let tableContainer = section.querySelector('.table-container');
    if (!tableContainer) {
        tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        section.appendChild(tableContainer);
    }

    // Найдем или создадим таблицу
    let table = tableContainer.querySelector('table');
    if (!table) {
        table = document.createElement('table');
        table.id = 'products-table';
        tableContainer.appendChild(table);
        
        // Создадим заголовок таблицы
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Изображение</th>
                <th>Цена</th>
                <th>Описание</th>
                <th>Наличие</th>
                <th>Действия</th>
            </tr>
        `;
        table.appendChild(thead);
    }

    // Найдем или создадим тело таблицы
    let tbody = table.querySelector('tbody');
    if (!tbody) {
        tbody = document.createElement('tbody');
        table.appendChild(tbody);
    }

    // Показываем индикатор загрузки
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Загрузка...</td></tr>';
    
    // Загружаем данные
    return fetchProducts()
        .then(products => {
            tbody.innerHTML = '';
            
            if (products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Нет товаров</td></tr>';
                return;
            }
            
            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.imageUrl ? 
                        `<a href="${product.imageUrl}" target="_blank" title="Открыть изображение">Просмотр</a>` : 
                        'Нет'}</td>
                    <td>${product.price.toFixed(2)} руб.</td>
                    <td class="description">
                        <span class="description-text">
                            ${product.description}
                        </span>
                    </td>
                    <td>${product.stock}</td>
                    <td class="actions">
                        <button class="btn edit-product" data-id="${product.id}">Изменить</button>
                        <button class="btn danger delete-product" data-id="${product.id}">Удалить</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            // Add event listeners for edit and delete buttons
            document.querySelectorAll('.edit-product').forEach(btn => {
                btn.addEventListener('click', () => {
                    const productId = btn.getAttribute('data-id');
                    const product = products.find(p => p.id == productId);
                    openProductModal(product);
                });
            });
            
            document.querySelectorAll('.delete-product').forEach(btn => {
                btn.addEventListener('click', () => {
                    const productId = btn.getAttribute('data-id');
                    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
                        deleteProduct(productId)
                            .then(() => loadProducts())
                            .catch(error => alert('Ошибка при удалении товара: ' + error.message));
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error loading products:', error);
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Ошибка загрузки: ${error.message}</td></tr>`;
            return Promise.reject(error);
        });
}

async function loadCustomers() {
    // Найдем или создадим элементы для отображения клиентов
    const section = document.getElementById('customers');
    if (!section) {
        console.error('Customers section not found');
        return Promise.reject(new Error('Customers section not found'));
    }

    // Найдем или создадим контейнер таблицы
    let tableContainer = section.querySelector('.table-container');
    if (!tableContainer) {
        tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        section.appendChild(tableContainer);
    }

    // Найдем или создадим таблицу
    let table = tableContainer.querySelector('table');
    if (!table) {
        table = document.createElement('table');
        table.id = 'customers-table';
        tableContainer.appendChild(table);
        
        // Создадим заголовок таблицы
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Действия</th>
            </tr>
        `;
        table.appendChild(thead);
    }

    // Найдем или создадим тело таблицы
    let tbody = table.querySelector('tbody');
    if (!tbody) {
        tbody = document.createElement('tbody');
        table.appendChild(tbody);
    }

    // Показываем индикатор загрузки
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Загрузка...</td></tr>';
    
    // Загружаем данные
    return fetchCustomers()
        .then(customers => {
            tbody.innerHTML = '';
            
            if (customers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Нет клиентов</td></tr>';
                return;
            }
            
            customers.forEach(customer => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${customer.id}</td>
                    <td>${customer.name}</td>
                    <td>${customer.phone}</td>
                    <td>${customer.email}</td>
                    <td class="actions">
                        <button class="btn edit-customer" data-id="${customer.id}">Изменить</button>
                        <button class="btn danger delete-customer" data-id="${customer.id}">Удалить</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            // Add event listeners for edit and delete buttons
            document.querySelectorAll('.edit-customer').forEach(btn => {
                btn.addEventListener('click', () => {
                    const customerId = btn.getAttribute('data-id');
                    const customer = customers.find(c => c.id == customerId);
                    openCustomerModal(customer);
                });
            });
            
            document.querySelectorAll('.delete-customer').forEach(btn => {
                btn.addEventListener('click', () => {
                    const customerId = btn.getAttribute('data-id');
                    if (confirm('Вы уверены, что хотите удалить этого клиента?')) {
                        deleteCustomer(customerId)
                            .then(() => loadCustomers())
                            .catch(error => alert('Ошибка при удалении клиента: ' + error.message));
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error loading customers:', error);
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Ошибка загрузки: ${error.message}</td></tr>`;
            return Promise.reject(error);
        });
}

async function loadOrders() {
    // Найдем или создадим элементы для отображения заказов
    const section = document.getElementById('orders');
    if (!section) {
        console.error('Orders section not found');
        return Promise.reject(new Error('Orders section not found'));
    }

    // Найдем или создадим контейнер таблицы
    let tableContainer = section.querySelector('.table-container');
    if (!tableContainer) {
        tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        section.appendChild(tableContainer);
    }

    // Найдем или создадим таблицу
    let table = tableContainer.querySelector('table');
    if (!table) {
        table = document.createElement('table');
        table.id = 'orders-table';
        tableContainer.appendChild(table);
        
        // Создадим заголовок таблицы
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Клиент</th>
                <th>Сумма</th>
                <th>Доставка</th>
                <th>Оплата</th>
                <th>Статус</th>
                <th>Дата создания</th>
                <th>Действия</th>
            </tr>
        `;
        table.appendChild(thead);
    }

    // Найдем или создадим тело таблицы
    let tbody = table.querySelector('tbody');
    if (!tbody) {
        tbody = document.createElement('tbody');
        table.appendChild(tbody);
    }

    // Показываем индикатор загрузки
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Загрузка...</td></tr>';
    
    // Загружаем данные
    return fetchOrders()
        .then(orders => {
            tbody.innerHTML = '';
            
            if (orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Нет заказов</td></tr>';
                return;
            }
            
            orders.forEach(order => {
                // Format delivery and payment information
                const deliveryInfo = order.delivery ? 
                    `${order.delivery.methodName}<br>${translateStatus(order.delivery.status)}<br>Стоимость: ${order.delivery.cost.toFixed(2)} руб.` :
                    'Не указано';
                
                const paymentInfo = order.payment ?
                    `${order.payment.methodName}<br>${translatePaymentStatus(order.payment.status)}` :
                    'Не указано';
                
                // Format date
                const createdDate = order.createdAt ? new Date(order.createdAt) : new Date();
                const formattedDate = createdDate.toLocaleString('ru-RU', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                // Format total price
                const totalPrice = order.totalPrice ? order.totalPrice.toFixed(2) : 
                    (order.itemsPrice && order.deliveryCost ? 
                        (order.itemsPrice + order.deliveryCost).toFixed(2) : '0.00');
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.customerName || 'Неизвестно'}</td>
                    <td>${totalPrice} руб.</td>
                    <td>${deliveryInfo}</td>
                    <td>${paymentInfo}</td>
                    <td>${formatOrderStatus(order.status)}</td>
                    <td>${formattedDate}</td>
                    <td class="actions">
                        <button class="btn view-order" data-id="${order.id}">Детали</button>
                        <button class="btn edit-order" data-id="${order.id}">Статус</button>
                        <button class="btn danger delete-order" data-id="${order.id}">Удалить</button>
                    </td>
                `;
                tbody.appendChild(row);
                
                // Store the full order object for use in modals
                row.dataset.order = JSON.stringify(order);
            });
            
            // Add event listeners for view, edit and delete buttons
            document.querySelectorAll('.view-order').forEach(btn => {
                btn.addEventListener('click', () => {
                    const orderId = btn.getAttribute('data-id');
                    const row = btn.closest('tr');
                    const orderData = JSON.parse(row.dataset.order);
                    openOrderDetailsModal(orderData);
                });
            });
            
            document.querySelectorAll('.edit-order').forEach(btn => {
                btn.addEventListener('click', () => {
                    const orderId = btn.getAttribute('data-id');
                    const row = btn.closest('tr');
                    const orderData = JSON.parse(row.dataset.order);
                    openOrderModal(orderData);
                });
            });
            
            document.querySelectorAll('.delete-order').forEach(btn => {
                btn.addEventListener('click', () => {
                    const orderId = btn.getAttribute('data-id');
                    if (confirm('Вы уверены, что хотите удалить этот заказ?')) {
                        deleteOrder(orderId)
                            .then(() => loadOrders())
                            .catch(error => alert('Ошибка при удалении заказа: ' + error.message));
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error loading orders:', error);
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">Ошибка загрузки: ${error.message}</td></tr>`;
            return Promise.reject(error);
        });
}

/**
 * Format order status for display
 * @param {string} status - Order status from server
 * @returns {string} - Formatted status for display
 */
function formatOrderStatus(status) {
    switch (status) {
        case 'IN_WORK':
            return 'В работе';
        case 'COMPLETED':
            return 'Завершён';
        default:
            return status || 'Неизвестно';
    }
}

/**
 * Translate status code to human-readable text
 * @param {string} status - Status code
 * @returns {string} - Translated status
 */
function translateStatus(status) {
    const statusMap = {
        'CREATED': 'Создан',
        'PROCESSING': 'В обработке',
        'SHIPPED': 'Отправлен',
        'DELIVERED': 'Доставлен',
        'COMPLETED': 'Завершен',
        'CANCELLED': 'Отменен',
        'PENDING': 'В ожидании',
        'PREPARING': 'Подготовка',
        'IN_WORK': 'В работе',
        'PAID': 'Оплачен',
        'FAILED': 'Ошибка'
    };
    
    return statusMap[status] || status;
}

// Export data loading functions
export {
    loadCustomers, loadOrders, loadProducts
};

