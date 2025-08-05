// frontend/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            document.getElementById('loginEmailError').textContent = '';
            document.getElementById('loginPasswordError').textContent = '';

            try {
                const response = await fetch('http://localhost:5500/api/auth/login', { // Ensure correct backend URL
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('user', JSON.stringify(result.user));
                    window.location.href = 'index.html';
                } else {
                    if (result.errors) {
                        if (result.errors.email) {
                            document.getElementById('loginEmailError').textContent = result.errors.email;
                        }
                        if (result.errors.password) {
                            document.getElementById('loginPasswordError').textContent = result.errors.password;
                        }
                    } else {
                        alert(result.message || 'Login failed.'); // Translated
                    }
                }
            } catch (error) {
                console.error('Error during login:', error); // Translated
                alert('Cannot connect to the server. Please try again later.'); // Translated
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Clear previous errors
            document.getElementById('registerNameError').textContent = '';
            document.getElementById('registerEmailError').textContent = '';
            document.getElementById('registerPasswordError').textContent = '';
            document.getElementById('confirmPasswordError').textContent = '';

            if (password !== confirmPassword) {
                document.getElementById('confirmPasswordError').textContent = 'Confirm password does not match.'; // Translated
                return;
            }

            try {
                const response = await fetch('http://localhost:5500/api/auth/register', { // Ensure correct backend URL
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    window.location.href = 'login.html'; // Redirect to login page
                } else {
                    // Handle server errors (e.g., email already exists)
                    alert(result.message || 'Registration failed.'); // Translated
                }
            } catch (error) {
                console.error('Error during registration:', error); // Translated
                alert('Cannot connect to the server. Please try again later.'); // Translated
            }
        });
    }

    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            alert('You have been logged out.'); // Translated
            window.location.href = 'index.html'; // Or login.html
        });
    }

    // Function to check login status and update nav bar UI
    function checkLoginStatus() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user'); // Can be used to display username

        const loginLink = document.querySelector('nav ul li a[href="login.html"]');
        const registerLink = document.querySelector('nav ul li a[href="register.html"]');
        const profileLink = document.querySelector('nav ul li a[href="profile.html"]');
        const cartLink = document.querySelector('nav ul li a[href="cart.html"]'); // Keep unchanged, always visible

        if (token && user) {
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (profileLink) profileLink.style.display = 'block';
        } else {
            if (loginLink) loginLink.style.display = 'block';
            if (registerLink) registerLink.style.display = 'block';
            if (profileLink) profileLink.style.display = 'none';
        }
    }

    // Call function when script is loaded and when localStorage changes
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus); // Update UI if another tab logs out
});