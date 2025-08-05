document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');

    const pageTitle = document.getElementById('pageTitle');
    const detailHeroImage = document.getElementById('detailHeroImage');
    const detailName = document.getElementById('detailName');
    const detailSeries = document.getElementById('detailSeries');
    const detailPrice = document.getElementById('detailPrice');
    const detailFuelType = document.getElementById('detailFuelType');
    const detailDescription = document.getElementById('detailDescription');
    const specYear = document.getElementById('specYear');
    const specStock = document.getElementById('specStock');
    const detailPageAddToCartBtn = document.getElementById('detailPageAddToCartBtn');

    // Get the "Contact for consultation" button
    const contactConsultationBtn = document.getElementById('contactConsultationBtn');

    let currentCar = null; // Variable to store current car information

    if (!carId) {
        pageTitle.textContent = 'Error - Car not found'; // Translated
        detailName.textContent = 'Car information not found.'; // Translated
        detailDescription.textContent = 'Please return to the homepage to select a product.'; // Translated
        detailSeries.style.display = 'none';
        detailPrice.style.display = 'none';
        detailFuelType.style.display = 'none';
        detailPageAddToCartBtn.style.display = 'none';
        if (contactConsultationBtn) contactConsultationBtn.style.display = 'none'; // Hide button if no car ID
        return;
    }

    try {
        const response = await fetch(`http://localhost:5500/api/cars/${carId}`);
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`); // Translated
        }
        const car = await response.json();
        currentCar = car; // Save car information

        if (car) {
            pageTitle.textContent = `${car.make} ${car.model} - Details`; // Translated
            detailHeroImage.src = `images/${car.image_url}`;
            detailHeroImage.alt = `${car.make} ${car.model}`;
            detailName.textContent = `${car.make} ${car.model}`;
            detailSeries.textContent = car.series || 'No series information available'; // Translated
            detailPrice.textContent = `$${Number(car.price).toLocaleString()} VND`;
            detailFuelType.textContent = car.fuel_type || 'Gasoline'; // Translated
            detailDescription.textContent = car.description || 'No detailed description available for this product.'; // Translated
            specYear.textContent = car.year;
            specStock.textContent = car.stock > 0 ? `${car.stock} units` : 'Out of stock'; // Translated

            detailPageAddToCartBtn.dataset.id = car.id;
            detailPageAddToCartBtn.dataset.name = `${car.make} ${car.model}`;
            detailPageAddToCartBtn.dataset.price = car.price;
            detailPageAddToCartBtn.dataset.image = car.image_url;
            detailPageAddToCartBtn.disabled = car.stock === 0;
            detailPageAddToCartBtn.textContent = car.stock === 0 ? 'Out of stock' : 'Add to Cart'; // Translated

            // Handle Add to Cart button
            detailPageAddToCartBtn.addEventListener('click', async function() {
                const id = parseInt(this.dataset.id);
                const price = parseFloat(this.dataset.price);
                if (!id || isNaN(price)) return;

                const carToAdd = {
                    id,
                    name: this.dataset.name,
                    price,
                    imageUrl: this.dataset.image
                };

                console.log('🛒 Adding car to cart from detail page:', carToAdd); // Translated

                if (typeof window.addToCart === 'function') {
                    await window.addToCart(carToAdd);
                    alert('Product added to cart!'); // Translated
                } else {
                    alert('Cart functionality not ready.'); // Translated
                }
            });

            // Handle "Contact for consultation" button
            if (contactConsultationBtn) {
                contactConsultationBtn.addEventListener('click', () => {
                    if (currentCar) {
                        // Redirect to contact page and pass car information
                        // Default selection for inquiry type is "Detailed consultation"
                        window.location.href = `contact.html?carId=${currentCar.id}&carName=${encodeURIComponent(currentCar.make + ' ' + currentCar.model)}&inquiryType=detailed_consultation`;
                    }
                });
            }

        } else {
            pageTitle.textContent = 'Car not found'; // Translated
            detailName.textContent = 'Car information not found.'; // Translated
            detailDescription.textContent = 'The product you are looking for does not exist.'; // Translated
            detailSeries.style.display = 'none';
            detailPrice.style.display = 'none';
            detailFuelType.style.display = 'none';
            detailPageAddToCartBtn.style.display = 'none';
            if (contactConsultationBtn) contactConsultationBtn.style.display = 'none';
        }

    } catch (error) {
        console.error('❌ Error fetching car details:', error); // Translated
        pageTitle.textContent = 'Data loading error'; // Translated
        detailName.textContent = 'An error occurred while loading car information.'; // Translated
        detailDescription.textContent = 'Please check your network connection or try again later.'; // Translated
        detailSeries.style.display = 'none';
        detailPrice.style.display = 'none';
        detailFuelType.style.display = 'none';
        detailPageAddToCartBtn.style.display = 'none';
        if (contactConsultationBtn) contactConsultationBtn.style.display = 'none';
    }
});