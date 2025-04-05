// Модуль для оформления заказов
import { createCustomer, createOrder } from './api.js';
import { clearCart, getCart } from './cart.js';
import { CURRENCY, NOTIFICATION_TIMEOUT } from './config.js';

// Declare the showUserPage function which will be imported in app-user.js
// This is just for proper module structure
let showUserPage;

// Экспортирует функцию для установки showUserPage
export function setShowUserPage(showPageFunction) {
    showUserPage = showPageFunction;
}

// Текущий заказ
let currentOrder = null;

// Отображение страницы оформления заказа
function renderCheckout() {
    const cart = getCart();
    
    if (cart.length === 0) {
        // Если корзина пуста, возвращаемся на страницу корзины
        if (showUserPage) showUserPage('cart');
        return;
    }
    
    // Отображаем список товаров
    const orderItemsContainer = document.getElementById('order-items-summary');
    if (!orderItemsContainer) {
        console.error('Order items container not found');
        return;
    }
    
    orderItemsContainer.innerHTML = '';
    
    let totalPrice = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;
        
        const orderItem = document.createElement('div');
        orderItem.className = 'order-summary-item';
        orderItem.innerHTML = `
            <div class="order-summary-item-name">${item.name} x ${item.quantity}</div>
            <div class="order-summary-item-price">${itemTotal.toFixed(2)} ${CURRENCY}</div>
        `;
        
        orderItemsContainer.appendChild(orderItem);
    });
    
    // Обновляем итоговую сумму
    const totalPriceElement = document.getElementById('order-total-price');
    if (totalPriceElement) {
        totalPriceElement.textContent = totalPrice.toFixed(2);
    }
    
    // Добавляем обработчики событий
    const checkoutForm = document.getElementById('checkout-form');
    const backToCartBtn = document.getElementById('back-to-cart');
    
    if (checkoutForm && backToCartBtn) {
        // Очищаем существующие обработчики
        checkoutForm.removeEventListener('submit', handleCheckoutSubmit);
        backToCartBtn.removeEventListener('click', handleBackToCart);
        
        // Добавляем новые обработчики
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
        backToCartBtn.addEventListener('click', handleBackToCart);
    }
}

// Обработчик кнопки возврата в корзину
function handleBackToCart(e) {
    e.preventDefault();
    if (showUserPage) showUserPage('cart');
}

// Обработчик отправки формы оформления заказа
async function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    const cart = getCart();
    if (cart.length === 0) {
        showNotification('Ваша корзина пуста');
        return;
    }
    
    const nameInput = document.getElementById('checkout-name');
    const phoneInput = document.getElementById('checkout-phone');
    const emailInput = document.getElementById('checkout-email');
    
    if (!nameInput || !phoneInput || !emailInput) {
        console.error('Checkout form fields not found');
        return;
    }
    
    const name = nameInput.value;
    const phone = phoneInput.value;
    const email = emailInput.value;
    
    try {
        // Сначала создаем клиента, если его нет
        const customer = await createCustomer({
            name,
            phone,
            email
        });
        
        // Создаем заказ
        const orderItems = cart.map(item => ({
            product: { id: item.id },
            quantity: item.quantity,
            name: item.name,  // Сохраняем имя товара для отображения
            price: item.price  // Сохраняем цену товара для отображения
        }));
        
        const order = await createOrder({
            customer: { id: customer.id },
            orderItems
        });
        
        // Обогащаем данные заказа информацией о клиенте и товарах (которая может не вернуться от API)
        currentOrder = {
            ...order,
            customer: {
                ...order.customer,
                name,
                phone,
                email
            },
            orderItems: orderItems.map((item, index) => ({
                ...item,
                name: cart[index].name,
                price: cart[index].price
            })),
            totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
        
        // Показываем страницу подтверждения
        showOrderConfirmation(currentOrder);
        
        // Очищаем корзину
        clearCart();
    } catch (error) {
        showNotification(`Ошибка при оформлении заказа: ${error.message}`);
    }
}

// Показать уведомление
function showNotification(message, timeout = NOTIFICATION_TIMEOUT) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerText = message;
    
    // Добавляем уведомление в DOM
    document.body.appendChild(notification);
    
    // Показываем уведомление с анимацией
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Скрываем и удаляем уведомление через заданное время
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, timeout);
}

// Отображение подтверждения заказа
function showOrderConfirmation(order) {
    // Находим контейнер для сообщения подтверждения
    const confirmationContainer = document.getElementById('order-confirmation');
    if (!confirmationContainer) {
        console.error('Order confirmation container not found');
        return;
    }
    
    // Форматируем дату создания заказа, если она есть
    let formattedDate = '';
    if (order.createdAt) {
        const date = new Date(order.createdAt);
        formattedDate = date.toLocaleString('ru-RU', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Создаем HTML для деталей заказа
    confirmationContainer.innerHTML = `
        <h2>Заказ оформлен</h2>
        <div class="confirmation-message">
            <p>Спасибо за ваш заказ! Номер вашего заказа: <span id="confirmation-order-id">${order.id}</span></p>
            <p>Наш менеджер свяжется с вами в ближайшее время для подтверждения.</p>
            ${formattedDate ? `<p>Дата оформления: ${formattedDate}</p>` : ''}
        </div>
        
        <div class="order-details">
            <h3>Данные заказа</h3>
            <div class="order-customer-info">
                <p><strong>Имя:</strong> ${order.customer.name || 'Не указано'}</p>
                <p><strong>Телефон:</strong> ${order.customer.phone || 'Не указано'}</p>
                <p><strong>Email:</strong> ${order.customer.email || 'Не указано'}</p>
            </div>
            
            <h3>Состав заказа</h3>
            <div class="order-items-list">
                ${order.orderItems.map(item => `
                    <div class="order-confirmation-item">
                        <div class="order-confirmation-item-name">${item.name || 'Товар'} x ${item.quantity}</div>
                        <div class="order-confirmation-item-price">${item.price ? (item.price * item.quantity).toFixed(2) : '0.00'} ${CURRENCY}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-confirmation-total">
                <h3>Итого: ${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'} ${CURRENCY}</h3>
            </div>
        </div>
        
        <button id="back-to-catalog" class="btn primary">Вернуться в каталог</button>
    `;
    
    // Отображаем страницу подтверждения
    if (showUserPage) showUserPage('order-confirmation');
    
    // Добавляем обработчик для кнопки возврата в каталог
    const backToCatalogBtn = document.getElementById('back-to-catalog');
    if (backToCatalogBtn) {
        backToCatalogBtn.addEventListener('click', () => {
            if (showUserPage) showUserPage('catalog');
        });
    }
}

// Экспортируем функции для использования в других модулях
export {
    handleBackToCart,
    handleCheckoutSubmit, renderCheckout, showOrderConfirmation
};

