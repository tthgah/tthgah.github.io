document.addEventListener('DOMContentLoaded', () => {
    const featuredCarsContainer = document.getElementById('featuredCarsContainer');
    const otherCarsContainer = document.getElementById('otherCarsContainer');

    // Removed: Product Detail Modal elements and related global variables

    async function fetchCars() {
        try {
            const response = await fetch('http://localhost:5500/api/cars');
            const data = await response.json();
            const featuredCars = data.featured || [];
            const otherCars = data.others || [];

            // Removed: Storing allCarsData as it's no longer needed for modal display

            console.log('🚗 Featured Cars:', featuredCars); // Translated
            console.log('🚙 Other Cars:', otherCars); // Translated

            renderCars(featuredCars, featuredCarsContainer);
            renderCars(otherCars, otherCarsContainer);

            attachProductClickEvents(); // Updated: Now handles redirection
            attachAddToCartEvents();
        } catch (error) {
            console.error('❌ Error fetching car list:', error); // Translated
            alert('Cannot connect to the server. Please try again.'); // Translated
        }
    }

    function renderCars(cars, container) {
        container.innerHTML = '';
        cars.forEach(car => {
            const carCard = document.createElement('div');
            carCard.classList.add('car-card');
            carCard.dataset.id = car.id; // Still keep ID for potential future use
            carCard.innerHTML = `
                <img src="images/${car.image_url}" alt="${car.make} ${car.model}">
                <h3>${car.make} ${car.model} (${car.year})</h3>
                <p>Price: $${Number(car.price).toLocaleString()}</p> <p>In Stock: ${car.stock} units</p> <button class="btn-add-to-cart"
                    data-id="${car.id}"
                    data-name="${car.make} ${car.model}"
                    data-price="${car.price}"
                    data-image="${car.image_url}"
                    ${car.stock === 0 ? 'disabled' : ''}>
                    ${car.stock === 0 ? 'Out of stock' : 'Add to Cart'} </button>
            `;
            container.appendChild(carCard);
        });
    }

    // --- UPDATED Function: Handles clicks on product cards for redirection ---
    function attachProductClickEvents() {
        const carCards = document.querySelectorAll('.car-card');
        carCards.forEach(card => {
            card.addEventListener('click', function(event) {
                // Prevent redirection if "Add to Cart" button is clicked
                if (event.target.classList.contains('btn-add-to-cart')) {
                    return;
                }

                const carId = this.dataset.id;
                if (carId) {
                    window.location.href = `product-detail.html?id=${carId}`; // Redirect to detail page
                } else {
                    console.error('Car ID not found for redirection.'); // Translated
                }
            });
        });
    }

    // Original attachAddToCartEvents remains largely the same
    function attachAddToCartEvents() {
        const buttons = document.querySelectorAll('.btn-add-to-cart');
        buttons.forEach(button => {
            button.addEventListener('click', async function () {
                const id = parseInt(this.dataset.id);
                const price = parseFloat(this.dataset.price);
                if (!id || isNaN(price)) return;

                const car = {
                    id,
                    name: this.dataset.name,
                    price,
                    imageUrl: this.dataset.image
                };

                console.log('🛒 Adding car to cart:', car); // Translated

                if (typeof window.addToCart === 'function') {
                    await window.addToCart(car);
                    alert('Product added to cart!'); // Translated
                    fetchCars(); // Reload to update stock quantity on the index page
                } else {
                    alert('Cart functionality not ready.'); // Translated
                }
            });
        });
    }

    // Call when the page is loaded
    fetchCars();

    // ------------------- User Profile (Existing Code) -------------------
    const profileInfoDiv = document.getElementById('profileInfo');
    if (profileInfoDiv) {
        async function fetchUserProfile() {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));

            if (!token || !user) {
                profileInfoDiv.innerHTML = '<p>Please log in to view your profile.</p>'; // Translated
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) logoutBtn.style.display = 'none';
                return;
            }

            profileInfoDiv.innerHTML = `
                <p><strong>Username:</strong> ${user.username}</p> <p><strong>Email:</strong> ${user.email}</p> `;
        }

        fetchUserProfile();
    }
});