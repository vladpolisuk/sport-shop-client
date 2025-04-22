// Модуль для оформления заказов
import {
    calculateDeliveryCost,
    calculateDeliveryTime,
    checkCustomerByEmail,
    createCustomer,
    createOrder,
    fetchDeliveryMethods,
    fetchPaymentMethods
} from './api.js';
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

// Сохраняем выбранные методы доставки и оплаты
let selectedDeliveryMethod = null;
let selectedPaymentMethod = null;
let deliveryCost = 0;
let deliveryTime = 0;

// Отображение страницы оформления заказа
async function renderCheckout() {
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
    
    // Загружаем методы доставки
    await loadDeliveryMethods();
    
    // Загружаем методы оплаты
    await loadPaymentMethods();
    
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

// Загрузка доступных методов доставки
async function loadDeliveryMethods() {
    const deliveryMethodsContainer = document.getElementById('delivery-methods-container');
    if (!deliveryMethodsContainer) {
        console.error('Delivery methods container not found');
        return;
    }
    
    try {
        // Загружаем методы доставки с сервера
        const deliveryMethods = await fetchDeliveryMethods();
        
        if (!deliveryMethods || Object.keys(deliveryMethods).length === 0) {
            deliveryMethodsContainer.innerHTML = '<p>Нет доступных методов доставки</p>';
            return;
        }
        
        // Создаем HTML для методов доставки
        let deliveryMethodsHTML = '';
        
        Object.entries(deliveryMethods).forEach(([id, name]) => {
            deliveryMethodsHTML += `
                <div class="delivery-method">
                    <input type="radio" name="delivery-method" id="delivery-${id}" value="${id}" 
                        ${selectedDeliveryMethod === id ? 'checked' : ''}>
                    <label for="delivery-${id}">${name}</label>
                </div>
            `;
        });
        
        // Отображаем методы доставки
        deliveryMethodsContainer.innerHTML = deliveryMethodsHTML;
        
        // Добавляем обработчики для выбора метода доставки
        const deliveryInputs = document.querySelectorAll('input[name="delivery-method"]');
        deliveryInputs.forEach(input => {
            input.addEventListener('change', handleDeliveryMethodChange);
        });
        
        // Отображаем детали доставки, если метод уже выбран
        if (selectedDeliveryMethod) {
            const deliveryDetails = document.getElementById('delivery-details');
            if (deliveryDetails) {
                deliveryDetails.style.display = 'block';
            }
        }
        
    } catch (error) {
        console.error('Error loading delivery methods:', error);
        deliveryMethodsContainer.innerHTML = '<p>Ошибка загрузки методов доставки</p>';
    }
}

// Обработчик изменения метода доставки
async function handleDeliveryMethodChange(e) {
    selectedDeliveryMethod = e.target.value;
    
    // Отображаем детали доставки
    const deliveryDetails = document.getElementById('delivery-details');
    if (deliveryDetails) {
        deliveryDetails.style.display = 'block';
    }
    
    // Расчет стоимости и времени доставки
    const addressInput = document.getElementById('checkout-address');
    if (addressInput && addressInput.value) {
        await updateDeliveryInfo(selectedDeliveryMethod, addressInput.value);
    }
    
    // Добавляем обработчик для изменения адреса
    if (addressInput) {
        addressInput.removeEventListener('blur', handleAddressChange);
        addressInput.addEventListener('blur', handleAddressChange);
    }
}

// Обработчик изменения адреса
async function handleAddressChange(e) {
    if (selectedDeliveryMethod) {
        await updateDeliveryInfo(selectedDeliveryMethod, e.target.value);
    }
}

// Обновление информации о доставке
async function updateDeliveryInfo(method, address) {
    // Здесь можно использовать расстояние как упрощенную метрику для примера
    // В реальном приложении нужно будет использовать сервис геокодирования
    const distance = 10; // Примерное расстояние (10 км)
    const weight = calculateCartWeight(); // Рассчитываем вес корзины
    
    try {
        // Получаем стоимость доставки
        deliveryCost = await calculateDeliveryCost(method, distance, weight);
        
        // Получаем время доставки
        deliveryTime = await calculateDeliveryTime(method, distance);
        
        // Обновляем отображение
        const deliveryCostElement = document.getElementById('delivery-cost');
        const deliveryTimeElement = document.getElementById('delivery-time');
        
        if (deliveryCostElement) {
            deliveryCostElement.textContent = deliveryCost;
        }
        
        if (deliveryTimeElement) {
            deliveryTimeElement.textContent = deliveryTime;
        }
        
        // Обновляем итоговую сумму
        updateTotalWithDelivery();
        
    } catch (error) {
        console.error('Error updating delivery info:', error);
        showNotification('Ошибка расчета доставки');
    }
}

// Расчет веса корзины (упрощенно)
function calculateCartWeight() {
    const cart = getCart();
    // Предполагаем, что средний вес товара составляет 1 кг
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Обновление итоговой суммы с учетом доставки
function updateTotalWithDelivery() {
    const cart = getCart();
    let totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Добавляем стоимость доставки
    totalPrice += parseFloat(deliveryCost || 0);
    
    // Обновляем отображение
    const totalPriceElement = document.getElementById('order-total-price');
    if (totalPriceElement) {
        totalPriceElement.textContent = totalPrice.toFixed(2);
    }
}

// Загрузка доступных методов оплаты
async function loadPaymentMethods() {
    const paymentMethodsContainer = document.getElementById('payment-methods-container');
    if (!paymentMethodsContainer) {
        console.error('Payment methods container not found');
        return;
    }
    
    try {
        // Загружаем методы оплаты с сервера
        const paymentMethods = await fetchPaymentMethods();
        
        if (!paymentMethods || Object.keys(paymentMethods).length === 0) {
            paymentMethodsContainer.innerHTML = '<p>Нет доступных методов оплаты</p>';
            return;
        }
        
        // Создаем HTML для методов оплаты
        let paymentMethodsHTML = '';
        
        Object.entries(paymentMethods).forEach(([id, name]) => {
            paymentMethodsHTML += `
                <div class="payment-method">
                    <input type="radio" name="payment-method" id="payment-${id}" value="${id}" 
                        ${selectedPaymentMethod === id ? 'checked' : ''}>
                    <label for="payment-${id}">${name}</label>
                </div>
            `;
        });
        
        // Отображаем методы оплаты
        paymentMethodsContainer.innerHTML = paymentMethodsHTML;
        
        // Добавляем обработчики для выбора метода оплаты
        const paymentInputs = document.querySelectorAll('input[name="payment-method"]');
        paymentInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                selectedPaymentMethod = e.target.value;
            });
        });
        
    } catch (error) {
        console.error('Error loading payment methods:', error);
        paymentMethodsContainer.innerHTML = '<p>Ошибка загрузки методов оплаты</p>';
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
    const addressInput = document.getElementById('checkout-address');
    
    if (!nameInput || !phoneInput || !emailInput) {
        console.error('Checkout form fields not found');
        return;
    }
    
    const name = nameInput.value;
    const phone = phoneInput.value;
    const email = emailInput.value;
    const address = addressInput ? addressInput.value : '';
    
    // Проверка выбора методов доставки и оплаты
    if (!selectedDeliveryMethod) {
        showNotification('Пожалуйста, выберите способ доставки');
        return;
    }
    
    if (!selectedPaymentMethod) {
        showNotification('Пожалуйста, выберите способ оплаты');
        return;
    }
    
    let customerId = null;
    
    try {
        // 1. Check if customer exists
        try {
            console.log(`Проверка клиента по email: ${email}`);
            const existingCustomerResponse = await checkCustomerByEmail(email);
            if (existingCustomerResponse && existingCustomerResponse.data) {
                customerId = existingCustomerResponse.data.id;
                console.log(`Найден существующий клиент с ID: ${customerId}`);
            }
        } catch (error) {
            // Check if it's a 404 Not Found error
            if (error.message.includes('404') || (error.response && error.response.status === 404)) {
                console.log(`Клиент с email ${email} не найден. Создание нового клиента.`);
                // Customer not found, proceed to create one
            } else {
                // Re-throw other errors (like 403, 500, network errors)
                throw error;
            }
        }
        
        // 2. Create customer if not found
        if (!customerId) {
            const newCustomer = await createCustomer({
                name,
                phone,
                email
            });
            customerId = newCustomer.id; // Assuming API returns the created customer with ID
            console.log(`Создан новый клиент с ID: ${customerId}`);
        }
        
        // 3. Prepare order items
        const orderItems = cart.map(item => ({
            productId: item.id, // Send only productId as per API doc
            quantity: item.quantity
            // name and price are not needed for backend, but used later for confirmation page
        }));
        
        // 4. Create the order using the determined customerId
        const orderPayload = {
            customerId: customerId, // Send customerId directly as per API doc
            items: orderItems,
            deliveryMethod: selectedDeliveryMethod,
            deliveryAddress: address,
            paymentMethod: selectedPaymentMethod
        };
        
        console.log('Отправка данных для создания заказа:', orderPayload);
        const createdOrder = await createOrder(orderPayload);
        
        // Prepare data for the confirmation page (enrich with local data)
        currentOrder = {
            ...createdOrder, // API returns order directly, not wrapped in data property
            customer: {
                // Use data potentially returned by API, fallback to form data
                id: customerId,
                name: name,
                phone: phone,
                email: email
            },
            delivery: {
                method: selectedDeliveryMethod,
                address: address,
                cost: deliveryCost,
                time: deliveryTime
            },
            payment: {
                method: selectedPaymentMethod
            },
            orderItems: createdOrder.orderItems || cart.map(cartItem => ({
                // Use local cart data for display details
                productId: cartItem.id,
                productName: cartItem.name,
                price: cartItem.price,
                quantity: cartItem.quantity,
                totalPrice: cartItem.price * cartItem.quantity
            })),
            // Calculate totalAmount locally for confirmation page if not in API response
            totalAmount: (createdOrder.totalPrice || cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)) + parseFloat(deliveryCost || 0)
        };
        
        // Show confirmation page
        showOrderConfirmation(currentOrder);
        
        // Clear the cart
        clearCart();
        
        // Reset selected delivery and payment methods
        selectedDeliveryMethod = null;
        selectedPaymentMethod = null;
        deliveryCost = 0;
        deliveryTime = 0;
        
    } catch (error) {
        console.error('Ошибка при оформлении заказа:', error);
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
            
            <div class="order-delivery-info">
                <h3>Информация о доставке</h3>
                <p><strong>Способ доставки:</strong> ${order.delivery?.method || 'Не указано'}</p>
                <p><strong>Адрес доставки:</strong> ${order.delivery?.address || 'Не указано'}</p>
                <p><strong>Стоимость доставки:</strong> ${order.delivery?.cost || '0'} ${CURRENCY}</p>
                <p><strong>Срок доставки:</strong> ${order.delivery?.time || '0'} дней</p>
            </div>
            
            <div class="order-payment-info">
                <h3>Способ оплаты</h3>
                <p>${order.payment?.method || 'Не указано'}</p>
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

