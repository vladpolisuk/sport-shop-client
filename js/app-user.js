// DOM Elements for user mode
// Import authentication functions
import { checkAuth, isAdmin, logoutUser } from './auth.js';

// Import functions from catalog.js
import { loadCatalog } from './catalog.js';

// Import functions from cart.js
import { loadCart, renderCart } from './cart.js';

// Import functions from checkout.js
import { renderCheckout, setShowUserPage } from './checkout.js';

// Import functions for fetching user orders
import { fetchUserOrders } from './api.js';

// Function to hide preloader when page is loaded
function hidePreloader() {
    document.body.classList.add('loaded');
    // Remove preloader after transition completes
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.display = 'none';
        }
    }, 1000);
}

// Initialize the user application
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is authenticated
    const authStatus = await checkAuth();
    if (!authStatus.authenticated) {
        // Redirect to login page if not authenticated
        window.location.href = 'login.html';
        return;
    }

    // Connect the showUserPage function to the checkout module
    setShowUserPage(showUserPage);

    // Update UI with user information if needed
    if (authStatus.user) {
        // Display username in the welcome block
        const currentUsernameElement = document.getElementById('current-username');
        if (currentUsernameElement) {
            currentUsernameElement.textContent = authStatus.user.username;
        }
        
        console.log(`Logged in as: ${authStatus.user.username}`);
        console.log(`User roles: ${authStatus.user.roles.join(', ')}`);
    }

    // Setup UI elements based on role
    setupUIBasedOnRole();

    // Set up user logout button
    const logoutBtn = document.getElementById('user-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
            window.location.href = 'login.html';
        });
    }
    
    // Обработка кнопки оформления заказа
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            renderCheckout();
            showUserPage('checkout');
        });
    }

    // Load initial data for catalog and cart
    try {
        await Promise.all([
            loadCatalog(),
            loadCart()
        ]);
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
    
    // Hide preloader after data is loaded
    hidePreloader();
});

// Setup UI elements based on user role
function setupUIBasedOnRole() {
    // Элементы интерфейса
    const userNav = document.getElementById('user-nav');
    const userSections = document.getElementById('user-sections');
    
    // Show user interface
    if (userNav) userNav.style.display = 'block';
    if (userSections) userSections.style.display = 'block';
    
    // If user has admin role, redirect to admin page
    if (isAdmin()) {
        // We could redirect to admin page, but we'll just let the user
        // stay on user page and they can navigate to admin page manually
        console.log('User has admin privileges');
    }
    
    // Activate the catalog tab by default
    if (userNav) {
        const catalogLink = userNav.querySelector('a[data-page="catalog"]');
        userNav.querySelectorAll('a').forEach(link => link.classList.remove('active'));
        if (catalogLink) {
            catalogLink.classList.add('active');
        }
    }
    
    // Show correct page
    showUserPage('catalog');
    
    // Add refresh buttons to sections that load data
    addRefreshButtons();
    
    // Обработка навигации пользователя
    if (userNav) {
        const userNavLinks = userNav.querySelectorAll('a');
        userNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const pageName = link.getAttribute('data-page');
                if (!pageName) return; // Skip if no page (e.g., logout button)
                
                // Check if the link is already active (tab already selected)
                if (link.classList.contains('active')) {
                    // If already active, don't reload content
                    return;
                }
                
                // Update active tab
                userNavLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Load data only when switching to a different tab
                showUserPage(pageName);
            });
        });
    }
}

// Add refresh buttons to sections that load data
function addRefreshButtons() {
    // Add refresh button to catalog
    addRefreshButton('catalog', 'catalog-container', loadCatalog);
    
    // Add refresh button to cart
    addRefreshButton('cart', 'cart-items', renderCart);
    
    // Add refresh button to my orders
    addRefreshButton('my-orders', 'user-orders-container', loadUserOrders);
    
    // Add event listener to the dedicated refresh button for orders
    const refreshOrdersBtn = document.getElementById('refresh-orders-btn');
    if (refreshOrdersBtn) {
        refreshOrdersBtn.addEventListener('click', loadUserOrders);
    }
}

// Helper function to add a refresh button to a section
function addRefreshButton(sectionId, contentContainerId, refreshFunction) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // Create the refresh button
    const refreshButton = document.createElement('button');
    refreshButton.className = 'refresh-btn';
    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Обновить';
    
    // Get the header of the section or create one
    let header = section.querySelector('.section-header');
    if (!header) {
        header = document.createElement('div');
        header.className = 'section-header';
        section.prepend(header);
    }
    
    // Add the button to the header
    header.appendChild(refreshButton);
    
    // Add click handler to the refresh button
    refreshButton.addEventListener('click', async () => {
        // Show loading indicator
        const contentContainer = document.getElementById(contentContainerId);
        if (contentContainer) {
            contentContainer.innerHTML = '<div class="loading">Обновление данных...</div>';
        }
        
        // Call the refresh function
        try {
            await refreshFunction();
        } catch (error) {
            console.error(`Error refreshing ${sectionId}:`, error);
            if (contentContainer) {
                contentContainer.innerHTML = 
                    `<div class="error">Ошибка при обновлении данных: ${error.message}</div>`;
            }
        }
    });
}

// Показать страницу в пользовательском интерфейсе
function showUserPage(pageName) {
    // Записываем информацию для отладки
    console.log(`Переключение на страницу: ${pageName}`);
    
    // Скрываем все страницы
    document.querySelectorAll('#user-sections .page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Показываем нужную страницу
    const targetPage = document.getElementById(pageName);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Load content for the page if needed
        if (pageName === 'catalog') {
            // Don't auto-load catalog to prevent unnecessary reloads
            // Use refresh button instead
        } else if (pageName === 'cart') {
            renderCart();
        } else if (pageName === 'my-orders') {
            loadUserOrders();
        }
    } else {
        console.error(`Page ${pageName} not found`);
    }
}

// Make showUserPage available globally
window.showUserPage = showUserPage;

// Function to load and display user orders
async function loadUserOrders() {
    const ordersContainer = document.getElementById('user-orders-container');
    if (!ordersContainer) return;
    
    // Show loading message
    ordersContainer.innerHTML = '<p class="loading-message">Загрузка заказов...</p>';
    
    try {
        // Fetch user orders
        const orders = await fetchUserOrders();
        
        // Clear container
        ordersContainer.innerHTML = '';
        
        // Check if there are any orders
        if (!orders || orders.length === 0) {
            ordersContainer.innerHTML = '<p class="empty-message">У вас пока нет заказов</p>';
            return;
        }
        
        // Create orders list
        const ordersList = document.createElement('div');
        ordersList.className = 'orders-list';
        
        // Sort orders by date (newest first)
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Render each order
        orders.forEach(order => {
            const orderCard = createOrderCard(order);
            ordersList.appendChild(orderCard);
        });
        
        // Add to container
        ordersContainer.appendChild(ordersList);
    } catch (error) {
        console.error('Error loading user orders:', error);
        ordersContainer.innerHTML = `<p class="error-message">Ошибка при загрузке заказов: ${error.message}</p>`;
    }
}

// Function to create an order card
function createOrderCard(order) {
    // Format date
    const orderDate = new Date(order.createdAt).toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Format status
    let statusText = 'Неизвестно';
    let statusClass = '';
    
    switch (order.status) {
        case 'IN_WORK':
            statusText = 'В работе';
            statusClass = 'status-in-progress';
            break;
        case 'COMPLETED':
            statusText = 'Завершён';
            statusClass = 'status-completed';
            break;
    }
    
    // Create order card element
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    orderCard.dataset.orderId = order.id;
    
    // Create header with order number and date
    const orderHeader = document.createElement('div');
    orderHeader.className = 'order-header';
    orderHeader.innerHTML = `
        <div class="order-number">Заказ #${order.id}</div>
        <div class="order-date">${orderDate}</div>
    `;
    
    // Create status badge
    const statusBadge = document.createElement('div');
    statusBadge.className = `order-status ${statusClass}`;
    statusBadge.textContent = statusText;
    
    // Create customer info section
    const customerInfo = document.createElement('div');
    customerInfo.className = 'customer-info';
    
    // Get customer details
    const customerId = order.customerId || 'Не указан';
    const customerName = order.customerName || 'Не указан';
    const customerEmail = order.customerEmail || 'Не указан';
    const customerPhone = order.customerPhone || 'Не указан';
    
    customerInfo.innerHTML = `
        <div class="customer-info-header">Информация о клиенте:</div>
        <div class="customer-info-details">
            <p><strong>ID:</strong> ${customerId}</p>
            <p><strong>Имя:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Телефон:</strong> ${customerPhone}</p>
        </div>
    `;
    
    // Create order summary
    const orderSummary = document.createElement('div');
    orderSummary.className = 'order-summary';
    
    // Calculate total items
    const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
    
    orderSummary.innerHTML = `
        <div class="order-info">
            <div>Товаров: ${totalItems}</div>
            <div class="order-total">Сумма: ${order.totalPrice.toFixed(2)} руб.</div>
        </div>
    `;
    
    // Create items container (initially hidden)
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'order-items-container';
    itemsContainer.style.display = 'none';
    
    // Add items to container
    if (order.orderItems && order.orderItems.length > 0) {
        const itemsList = document.createElement('ul');
        itemsList.className = 'order-items-list';
        
        order.orderItems.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'order-item';
            listItem.innerHTML = `
                <div class="item-name">${item.productName}</div>
                <div class="item-details">
                    <span class="item-quantity">${item.quantity} шт.</span>
                    <span class="item-price">${item.price.toFixed(2)} руб.</span>
                    <span class="item-total">${(item.quantity * item.price).toFixed(2)} руб.</span>
                </div>
            `;
            itemsList.appendChild(listItem);
        });
        
        itemsContainer.appendChild(itemsList);
    } else {
        itemsContainer.innerHTML = '<p class="empty-message">Нет данных о товарах</p>';
    }
    
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'toggle-details-btn';
    toggleButton.textContent = 'Показать детали';
    toggleButton.addEventListener('click', () => {
        const isHidden = itemsContainer.style.display === 'none';
        itemsContainer.style.display = isHidden ? 'block' : 'none';
        toggleButton.textContent = isHidden ? 'Скрыть детали' : 'Показать детали';
    });
    
    // Assemble the card
    orderCard.appendChild(orderHeader);
    orderCard.appendChild(statusBadge);
    orderCard.appendChild(customerInfo);
    orderCard.appendChild(orderSummary);
    orderCard.appendChild(toggleButton);
    orderCard.appendChild(itemsContainer);
    
    return orderCard;
}