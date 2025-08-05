// frontend/js/cart.js

document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalPriceElement = document.getElementById('cartTotalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');

    let currentCart = []; // Cart will be loaded from the server

    // Function to fetch cart from backend API
    async function fetchCart() {
        const token = localStorage.getItem('token');
        if (!token) {
            cartItemsContainer.innerHTML = '<p>Please log in to view your cart.</p>'; // Translated
            cartTotalPriceElement.textContent = '0';
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = 0.5;
            checkoutBtn.style.cursor = 'not-allowed';
            return;
        }

        try {
            const response = await fetch('http://localhost:5500/api/cart', { // Ensure correct backend URL
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                currentCart = data; // Update cart from API data
                renderCart();
            } else {
                console.error('Error fetching cart:', data.message); // Translated
                // Handle expired or invalid token
                if (response.status === 401 || response.status === 403) {
                    alert(data.message || 'Login session has expired. Please log in again.'); // Translated
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = 'login.html'; // Redirect to login page
                } else {
                    cartItemsContainer.innerHTML = `<p>Error fetching cart: ${data.message || 'Please try again.'}</p>`; // Translated
                }
                cartTotalPriceElement.textContent = '0';
                checkoutBtn.disabled = true;
                checkoutBtn.style.opacity = 0.5;
                checkoutBtn.style.cursor = 'not-allowed';
            }
        } catch (error) {
            console.error('Network error when fetching cart:', error); // Translated
            cartItemsContainer.innerHTML = '<p>Cannot connect to the server to load cart. Please check server connection.</p>'; // Translated
            cartTotalPriceElement.textContent = '0';
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = 0.5;
            checkoutBtn.style.cursor = 'not-allowed';
        }
    }

    // Function to render cart on the UI
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let totalPrice = 0;

        if (currentCart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>'; // Translated
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = 0.5;
            checkoutBtn.style.cursor = 'not-allowed';
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.style.opacity = 1;
            checkoutBtn.style.cursor = 'pointer';

            currentCart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                itemElement.innerHTML = `
                    <img src="${item.imageUrl || 'images/placeholder.jpg'}" alt="${item.name}">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p>Price: <span>$${item.price.toLocaleString()}</span></p> <p>Quantity: <span>${item.quantity}</span></p> <p>In Stock: <span>${item.stock}</span></p> </div>
                    <button class="btn-remove-from-cart btn" data-id="${item.id}">Remove</button> `;
                cartItemsContainer.appendChild(itemElement);

                totalPrice += item.price * item.quantity;
            });
        }
        cartTotalPriceElement.textContent = totalPrice.toLocaleString();

        document.querySelectorAll('.btn-remove-from-cart').forEach(button => {
            button.addEventListener('click', async (e) => {
                const carId = e.target.dataset.id;
                await removeFromCart(carId);
            });
        });
    }

    // Function to ADD product to cart (called from script.js)
    window.addToCart = async (car) => {
        console.log('Car added to cart:', car); // Translated
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to add products to your cart.'); // Translated
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch('http://localhost:5500/api/cart', { // Ensure correct backend URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ carId: car.id, quantity: 1 }) // Always add 1 product
            });
            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                fetchCart(); // Reload cart after adding
            } else {
                alert(`Error: ${result.message || 'Could not add product to cart.'}`); // Translated
            }
        } catch (error) {
            console.error('Error adding to cart:', error); // Translated
            alert('Cannot connect to the server to add product to cart.'); // Translated
        }
    };

    // Function to DELETE product from cart
    async function removeFromCart(carId) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You need to log in to perform this action.'); // Translated
            window.location.href = 'login.html';
            return;
        }

        if (!confirm('Are you sure you want to remove this product from your cart?')) { // Translated
            return;
        }

        try {
            console.log('📦 Sending checkout data:', currentCart); // Translated (though this log might be misleading for a delete function)
            const response = await fetch(`http://localhost:5500/api/cart/${carId}`, { // Ensure correct backend URL
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                fetchCart(); // Reload cart after deleting
            } else {
                alert(`Error: ${result.message || 'Could not remove product from cart.'}`); // Translated
            }
        } catch (error) {
            console.error('Error removing from cart:', error); // Translated
            alert('Cannot connect to the server to remove product from cart.'); // Translated
        }
    }

    // Handle click event for "Proceed to Checkout" button
    checkoutBtn.addEventListener('click', async () => {
        // 1. Check if cart is empty
        if (!currentCart || currentCart.length === 0) {
            alert('🛒 Your cart is empty. Please add products before checking out.'); // Translated
            return;
        }

        // 2. Check login
        const token = localStorage.getItem('token');
        if (!token) {
            alert('🔒 You need to log in to proceed with checkout.'); // Translated
            window.location.href = 'login.html';
            return;
        }

        // 3. Send checkout request
        try {
            const payload = {
                items: currentCart.map(item => ({
                    id: item.id,
                    quantity: item.quantity
                }))
            };

            const response = await fetch('http://localhost:5500/api/cars/checkout', { // Ensure correct backend URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            // 4. Successful response
            if (response.ok) {
                alert(`✅ ${result.message || 'Checkout successful!'}`); // Translated
                fetchCart(); // Refresh cart
            } else {
                alert(`❌ Checkout error: ${result.message || 'An error occurred, please try again.'}`); // Translated
            }

        } catch (error) {
            console.error('🔥 Error sending checkout request:', error); // Translated
            alert('⚠️ Cannot connect to the server. Please check your connection or try again later.'); // Translated
        }
    });
    // Call fetchCart when the page is loaded to display the initial cart
    fetchCart();
});