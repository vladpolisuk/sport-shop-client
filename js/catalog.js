// Модуль для работы с каталогом товаров
import { fetchProducts } from './api.js';
import { addToCart } from './cart.js';
import { CURRENCY, NOTIFICATION_TIMEOUT } from './config.js';

// Текущий список товаров
let products = [];

// Текущий выбранный товар
let currentProduct = null;

// Загрузка всех товаров из API
async function loadCatalog() {
    try {
        const catalogContainer = document.getElementById('catalog-container');
        if (!catalogContainer) {
            console.error('Catalog container not found');
            return;
        }
        
        catalogContainer.innerHTML = '<div class="loading">Загрузка товаров...</div>';
        
        products = await fetchProducts();
        renderCatalog(products);
    } catch (error) {
        const catalogContainer = document.getElementById('catalog-container');
        if (catalogContainer) {
            catalogContainer.innerHTML = 
                `<div class="error">Ошибка при загрузке товаров: ${error.message}</div>`;
        }
        console.error('Error loading catalog:', error);
    }
}

// Отрисовка каталога товаров
function renderCatalog(products) {
    const catalogContainer = document.getElementById('catalog-container');
    if (!catalogContainer) {
        console.error('Catalog container not found');
        return;
    }
    
    catalogContainer.innerHTML = '';
    
    if (!products || products.length === 0) {
        catalogContainer.innerHTML = '<div class="empty-catalog">Товары не найдены</div>';
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.id = product.id;
        productCard.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}" class="product-card-image">
            <div class="product-card-content">
                <div class="product-card-info">
                    <div class="product-card-title">${product.name}</div>
                    <div class="product-card-price">${product.price.toFixed(2)} ${CURRENCY}</div>
                    <div class="product-card-description">${product.description}</div>
                </div>
                <div class="product-card-actions">
                    <div class="product-card-stock">В наличии: ${product.stock} шт.</div>
                    <button class="btn primary add-to-cart-btn" data-id="${product.id}">В корзину</button>
                </div>
            </div>
        `;
        
        // Make the entire card clickable to show product details
        productCard.addEventListener('click', (event) => {
            // Only proceed if the click wasn't on the add-to-cart button
            if (!event.target.closest('.add-to-cart-btn')) {
                showProductDetails(product.id);
            }
        });
        
        // Handle add to cart separately, and stop propagation to prevent card click
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        addToCartBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Stop the click from bubbling up to the card
            addToCart(product);
        });
        
        catalogContainer.appendChild(productCard);
    });
}

// Отображение детальной информации о товаре
async function showProductDetails(productId) {
    try {
        // Находим товар из загруженного списка
        currentProduct = products.find(p => p.id === productId);
        
        if (!currentProduct) {
            // Если товар не найден в списке, пробуем загрузить все товары заново
            products = await fetchProducts();
            currentProduct = products.find(p => p.id === productId);
            
            if (!currentProduct) {
                throw new Error('Товар не найден');
            }
        }
        
        // Проверяем наличие контейнера
        const detailContainer = document.getElementById('product-detail-container');
        if (!detailContainer) {
            console.error('Product detail container not found');
            return;
        }
        
        // Отображаем страницу деталей товара
        detailContainer.innerHTML = `
            <a href="#" class="back-btn" id="back-to-catalog-btn">← Вернуться в каталог</a>
            <div class="product-container">
                <img src="${currentProduct.imageUrl}" alt="${currentProduct.name}" class="product-image catalog-product-image">
                <div class="product-info">
                    <h2 class="product-title">${currentProduct.name}</h2>
                    <div class="product-price">${currentProduct.price.toFixed(2)} ${CURRENCY}</div>
                    <div class="product-description">${currentProduct.description}</div>
                    <div class="product-stock">В наличии: ${currentProduct.stock} шт.</div>
                    <div class="product-quantity">
                        <button class="quantity-btn minus">-</button>
                        <input type="number" id="product-quantity-input" value="1" min="1" max="${currentProduct.stock}">
                        <button class="quantity-btn plus">+</button>
                    </div>
                    <div class="product-actions">
                        <button class="btn primary" id="add-to-cart-detail-btn">Добавить в корзину</button>
                    </div>
                </div>
            </div>
        `;
        
        // Отображаем страницу товара
        if (typeof window.showUserPage === 'function') {
            window.showUserPage('product-detail');
        }
        
        // Добавляем обработчики событий
        document.getElementById('back-to-catalog-btn').addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof window.showUserPage === 'function') {
                window.showUserPage('catalog');
            }
        });
        
        // Кнопки увеличения/уменьшения количества
        const minusBtn = document.querySelector('.product-quantity .minus');
        if (minusBtn) {
            minusBtn.addEventListener('click', () => {
                const input = document.getElementById('product-quantity-input');
                if (input) {
                    let quantity = parseInt(input.value);
                    if (quantity > 1) {
                        input.value = --quantity;
                    }
                }
            });
        }
        
        const plusBtn = document.querySelector('.product-quantity .plus');
        if (plusBtn) {
            plusBtn.addEventListener('click', () => {
                const input = document.getElementById('product-quantity-input');
                if (input) {
                    let quantity = parseInt(input.value);
                    if (quantity < currentProduct.stock) {
                        input.value = ++quantity;
                    }
                }
            });
        }
        
        // Добавление в корзину
        const addToCartBtn = document.getElementById('add-to-cart-detail-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const input = document.getElementById('product-quantity-input');
                if (input) {
                    const quantity = parseInt(input.value);
                    addToCart(currentProduct, quantity);
                }
            });
        }
        
    } catch (error) {
        const detailContainer = document.getElementById('product-detail-container');
        if (detailContainer) {
            detailContainer.innerHTML = `
                <div class="error">Ошибка при загрузке информации о товаре: ${error.message}</div>
                <a href="#" class="back-btn" id="back-to-catalog-btn">← Вернуться в каталог</a>
            `;
            
            const backBtn = document.getElementById('back-to-catalog-btn');
            if (backBtn) {
                backBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (typeof window.showUserPage === 'function') {
                        window.showUserPage('catalog');
                    }
                });
            }
        }
        console.error('Error showing product details:', error);
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
    
    // Скрываем и удаляем уведомление через указанное время
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, timeout);
}

// Экспортируем функции
export { loadCatalog, renderCatalog, showProductDetails };

