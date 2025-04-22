// DOM Elements
const navLinks = document.querySelectorAll('nav a');

// Import auth functions
import { checkAuth, isAdmin, logoutUser } from './auth.js';

// Import handling functions
import {
    handleCustomerSubmit,
    handleOrderSubmit,
    handleProductSubmit
} from './handlers.js';

// Import UI functions
import {
    addOrderItemRow,
    closeAllModals,
    openCustomerModal,
    openOrderModal,
    openProductModal
} from './ui.js';

// Import data loading functions
import {
    loadCustomers,
    loadOrders,
    loadProducts
} from './data-loaders.js';

// Import payment and delivery functions

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

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is authenticated
    const authStatus = await checkAuth();
    if (!authStatus.authenticated) {
        // Redirect to login page if not authenticated
        window.location.href = 'login.html';
        return;
    }

    // Check if user has admin role
    if (!isAdmin()) {
        // Redirect to user page if not admin
        window.location.href = 'user.html';
        return;
    }

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

    // Set up hamburger menu
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('admin-nav');
    
    if (hamburgerMenu && navMenu) {
        hamburgerMenu.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // Close the menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburgerMenu.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }

    // Set up navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            
            // Skip if link is already active
            if (link.classList.contains('active')) {
                return;
            }
            
            if (targetPage) {
                showPage(targetPage);
                // Close mobile menu after navigation
                navMenu.classList.remove('active');
            }
        });
    });

    // Set up logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
            window.location.href = 'login.html';
        });
    }

    // Set up modal close buttons
    document.querySelectorAll('.close, #cancel-product, #cancel-customer, #cancel-order').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    // Setup add buttons
    const addProductBtn = document.getElementById('add-product-btn');
    const addCustomerBtn = document.getElementById('add-customer-btn');
    const addOrderBtn = document.getElementById('add-order-btn');
    
    if (addProductBtn) addProductBtn.addEventListener('click', () => openProductModal());
    if (addCustomerBtn) addCustomerBtn.addEventListener('click', () => openCustomerModal());
    if (addOrderBtn) addOrderBtn.addEventListener('click', () => openOrderModal());

    // Setup form submissions
    const productForm = document.getElementById('product-form');
    const customerForm = document.getElementById('customer-form');
    const orderForm = document.getElementById('order-form');
    
    if (productForm) productForm.addEventListener('submit', handleProductSubmit);
    if (customerForm) customerForm.addEventListener('submit', handleCustomerSubmit);
    if (orderForm) orderForm.addEventListener('submit', handleOrderSubmit);

    // Add order item button
    const addOrderItemBtn = document.getElementById('add-order-item');
    if (addOrderItemBtn) {
        addOrderItemBtn.addEventListener('click', addOrderItemRow);
    }

    // Add refresh buttons to admin sections
    addRefreshButtons();

    // Load initial data
    await Promise.all([
        loadProducts(),
        loadCustomers(),
        loadOrders()
    ]);
    
    // Hide preloader after data is loaded
    hidePreloader();
});

// Add refresh buttons to sections that load data
function addRefreshButtons() {
    // Add refresh button to products
    addRefreshButton('products', 'products-table', loadProducts);
    
    // Add refresh button to customers
    addRefreshButton('customers', 'customers-table', loadCustomers);
    
    // Add refresh button to orders
    addRefreshButton('orders', 'orders-table', loadOrders);
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
        try {
            // Call the refresh function directly without modifying the DOM first
            // The refreshFunction will handle showing the loading state
            await refreshFunction();
        } catch (error) {
            console.error(`Error refreshing ${sectionId}:`, error);
            
            // If there's an error, find a place to show the error message
            const tableContainer = section.querySelector('.table-container');
            if (tableContainer) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error';
                errorDiv.textContent = `Ошибка при обновлении данных: ${error.message}`;
                
                // Clear existing errors
                const existingErrors = tableContainer.querySelectorAll('.error');
                existingErrors.forEach(el => el.remove());
                
                // Add the new error
                tableContainer.appendChild(errorDiv);
            }
        }
    });
}

// Показать определенную страницу
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    
    // Получаем навигационные элементы
    const adminNav = document.getElementById('admin-nav');
    
    // Деактивируем все страницы
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Деактивируем все ссылки навигации
    if (adminNav) {
        const navLinks = adminNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
    }
    
    // Активируем целевую страницу
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    } else {
        console.error(`Target page with id ${pageId} not found`);
        return;
    }
    
    // Активируем соответствующую ссылку в навигации
    if (adminNav) {
        const activeLink = adminNav.querySelector(`a[data-page="${pageId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
}

// Make showPage function available globally
window.showPage = showPage; 