// Login and Registration Logic
import { loginUser, registerUser } from './auth.js';

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

document.addEventListener('DOMContentLoaded', () => {
    // Hide preloader once login page is ready
    hidePreloader();
    
    // Tab switching functionality
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    const errorMessage = document.getElementById('error-message');
    
    // Login form elements
    const loginForm = document.getElementById('login-form-element');
    const loginUsername = document.getElementById('login-username');
    const loginPassword = document.getElementById('login-password');
    
    // Register form elements
    const registerForm = document.getElementById('register-form-element');
    const registerUsername = document.getElementById('register-username');
    const registerEmail = document.getElementById('register-email');
    const registerPassword = document.getElementById('register-password');
    const registerConfirmPassword = document.getElementById('register-confirm-password');
    
    // Switch between login and register tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetForm = tab.getAttribute('data-form');
            
            // Deactivate all tabs and forms
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            // Activate the selected tab and form
            tab.classList.add('active');
            document.getElementById(targetForm).classList.add('active');
            
            // Clear error message
            hideError();
        });
    });
    
    // Show error message
    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    };
    
    // Hide error message
    const hideError = () => {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    };
    
    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        
        const username = loginUsername.value.trim();
        const password = loginPassword.value;
        
        if (!username || !password) {
            showError('Please fill in all fields');
            return;
        }
        
        try {
            // Call the login API
            await loginUser(username, password);
            
            // Redirect to main page on successful login
            window.location.href = 'index.html';
        } catch (error) {
            showError(error.message || 'Login failed. Please check your credentials.');
        }
    });
    
    // Handle register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        
        const username = registerUsername.value.trim();
        const email = registerEmail.value.trim();
        const password = registerPassword.value;
        const confirmPassword = registerConfirmPassword.value;
        
        // Basic validation
        if (!username || !email || !password || !confirmPassword) {
            showError('Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address');
            return;
        }
        
        try {
            // Call the register API
            await registerUser(username, password, email);
            
            // Show success message and switch to login tab
            hideError();
            showSuccess('Registration successful! Please login with your new account.');
            
            // Clear the register form
            registerForm.reset();
            
            // Switch to login tab
            tabs[0].click();
        } catch (error) {
            showError(error.message || 'Registration failed. Please try again.');
        }
    });
    
    // Show success message (reusing error message element with different styling)
    const showSuccess = (message) => {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.style.color = '#28a745';
        
        // Reset to error style after 5 seconds
        setTimeout(() => {
            errorMessage.style.color = '#dc3545';
            hideError();
        }, 5000);
    };
}); 