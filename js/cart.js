// Модуль для управления корзиной покупок
import { CART_SETTINGS, CURRENCY, NOTIFICATION_TIMEOUT, STORAGE_KEYS } from './config.js';

// Локальное хранилище корзины
let cart = [];

// Инициализация корзины из localStorage
function initCart() {
    const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCounter();
    }
}

// Load cart when module initializes
function loadCart() {
    initCart();
    return cart;
}

// Добавление товара в корзину
function addToCart(product, quantity = 1) {
    // Проверяем, есть ли уже такой товар в корзине
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        // Если товар уже есть, увеличиваем количество
        existingItem.quantity += quantity;
        // Ограничиваем максимальное количество
        if (existingItem.quantity > CART_SETTINGS.MAX_QUANTITY_PER_ITEM) {
            existingItem.quantity = CART_SETTINGS.MAX_QUANTITY_PER_ITEM;
        }
    } else {
        // Иначе добавляем новый товар
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            description: product.description,
            quantity: Math.min(quantity, CART_SETTINGS.MAX_QUANTITY_PER_ITEM)
        });
    }
    
    // Сохраняем корзину в localStorage
    saveCart();
    
    // Обновляем счетчик товаров в корзине
    updateCartCounter();
    
    // Показываем уведомление
    showNotification(`Товар "${product.name}" добавлен в корзину`);
}

// Удаление товара из корзины
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCounter();
    
    // Если мы на странице корзины, обновляем отображение
    if (document.getElementById('cart') && document.getElementById('cart').classList.contains('active')) {
        renderCart();
    }
}

// Изменение количества товара в корзине
function updateCartItemQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(CART_SETTINGS.MIN_QUANTITY_PER_ITEM, Math.min(quantity, CART_SETTINGS.MAX_QUANTITY_PER_ITEM));
        
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            
            // Если мы на странице корзины, обновляем отображение
            if (document.getElementById('cart') && document.getElementById('cart').classList.contains('active')) {
                updateCartTotal();
            }
        }
    }
}

// Очистка корзины
function clearCart() {
    cart = [];
    saveCart();
    updateCartCounter();
}

// Сохранение корзины в localStorage
function saveCart() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

// Обновление счетчика товаров в корзине
function updateCartCounter() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = `(${totalItems})`;
    }
}

// Отображение корзины
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) {
        console.error('Cart items container not found');
        return;
    }
    
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutButton = document.getElementById('checkout-btn');
    
    // Очищаем контейнер
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        // Если корзина пуста
        cartItemsContainer.innerHTML = '<div class="cart-empty"><p>Ваша корзина пуста</p></div>';
        if (cartTotalPrice) cartTotalPrice.textContent = '0';
        if (checkoutButton) checkoutButton.disabled = true;
    } else {
        // Добавляем каждый товар в корзину
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${item.price.toFixed(2)} ${CURRENCY}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus">-</button>
                        <input type="number" value="${item.quantity}" min="${CART_SETTINGS.MIN_QUANTITY_PER_ITEM}" max="${CART_SETTINGS.MAX_QUANTITY_PER_ITEM}" data-id="${item.id}">
                        <button class="quantity-btn plus">+</button>
                    </div>
                </div>
                <div class="cart-item-total">${(item.price * item.quantity).toFixed(2)} ${CURRENCY}</div>
                <div class="cart-item-remove" data-id="${item.id}">✕</div>
            `;
            
            cartItemsContainer.appendChild(cartItem);
        });
        
        // Включаем кнопку оформления заказа
        if (checkoutButton) checkoutButton.disabled = false;
        
        // Обновляем общую сумму
        updateCartTotal();
        
        // Добавляем обработчики событий
        addCartEventListeners();
    }
}

// Обновление общей стоимости корзины
function updateCartTotal() {
    const cartTotalPrice = document.getElementById('cart-total-price');
    if (cartTotalPrice) {
        const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        cartTotalPrice.textContent = totalPrice.toFixed(2);
    }
}

// Добавление обработчиков событий для элементов корзины
function addCartEventListeners() {
    // Обработчики для кнопок изменения количества
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.nextElementSibling;
            const productId = parseInt(input.getAttribute('data-id'));
            let quantity = parseInt(input.value);
            if (quantity > CART_SETTINGS.MIN_QUANTITY_PER_ITEM) {
                input.value = --quantity;
                updateCartItemQuantity(productId, quantity);
            }
        });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const productId = parseInt(input.getAttribute('data-id'));
            let quantity = parseInt(input.value);
            if (quantity < CART_SETTINGS.MAX_QUANTITY_PER_ITEM) {
                input.value = ++quantity;
                updateCartItemQuantity(productId, quantity);
            }
        });
    });
    
    // Обработчики для полей ввода количества
    document.querySelectorAll('.cart-item-quantity input').forEach(input => {
        input.addEventListener('change', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const quantity = parseInt(this.value);
            if (quantity >= CART_SETTINGS.MIN_QUANTITY_PER_ITEM) {
                updateCartItemQuantity(productId, quantity);
            } else {
                this.value = CART_SETTINGS.MIN_QUANTITY_PER_ITEM;
                updateCartItemQuantity(productId, CART_SETTINGS.MIN_QUANTITY_PER_ITEM);
            }
        });
    });
    
    // Обработчики для кнопок удаления
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            removeFromCart(productId);
        });
    });
}

// Показать уведомление
function showNotification(message) {
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
    }, NOTIFICATION_TIMEOUT);
}

// Get current cart
function getCart() {
    return cart;
}

// Инициализируем корзину при загрузке модуля
initCart();

// Экспортируем функции для использования в других модулях
export {
    addToCart, clearCart, getCart, loadCart, removeFromCart, renderCart, updateCartItemQuantity, updateCartTotal
};

