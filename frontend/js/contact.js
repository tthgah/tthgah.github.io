document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.createElement('div'); // Create element to display messages
    formMessage.id = 'formMessage';
    formMessage.classList.add('message-area');
    contactForm.appendChild(formMessage); // Append to the end of the form

    const fullNameInput = document.getElementById('fullName'); // Changed from 'name' to 'fullName'
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone'); // Added phone field
    const inquiryTypeSelect = document.getElementById('inquiryType');
    const carOfInterestInput = document.getElementById('carOfInterest');
    const messageTextarea = document.getElementById('message');

    // Get information from URL (if any)
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('carId');
    const carName = urlParams.get('carName');
    const inquiryType = urlParams.get('inquiryType');

    // Pre-fill form information if available from URL
    if (carId && carName) {
        carOfInterestInput.value = `${decodeURIComponent(carName)} (ID: ${carId})`;
    }

    if (inquiryType) {
        inquiryTypeSelect.value = inquiryType;
        // Customize initial message based on inquiry type
        if (inquiryType === 'test_drive') {
            messageTextarea.value = `I would like to schedule a test drive for the car ${carName ? decodeURIComponent(carName) : 'I am interested in'}. Please contact me to arrange a time.`; // Translated
        } else if (inquiryType === 'detailed_consultation') {
            messageTextarea.value = `I need a detailed consultation about the car ${carName ? decodeURIComponent(carName) : 'I am interested in'}. Please provide more information.`; // Translated
        }
    }


    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent page reload

        formMessage.textContent = ''; // Clear old message
        formMessage.classList.remove('success', 'error');

        const formData = {
            fullName: fullNameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            inquiryType: inquiryTypeSelect.value,
            carOfInterest: carOfInterestInput.value,
            message: messageTextarea.value
        };

        // This is where you would send the form data to your backend
        // Example: using fetch API
        try {
            // const response = await fetch('http://localhost:5500/api/contact', { // Your API endpoint
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(formData),
            // });

            // if (response.ok) {
            //     const result = await response.json();
            //     formMessage.textContent = 'Your request has been sent successfully! We will contact you as soon as possible.';
            //     formMessage.classList.add('success');
            //     contactForm.reset(); // Clear the form
            //     // Ensure car info still displays if it was pre-filled
            //     if (carId && carName) {
            //         carOfInterestInput.value = `${decodeURIComponent(carName)} (ID: ${carId})`;
            //     }
            // } else {
            //     const errorData = await response.json();
            //     formMessage.textContent = `Error: ${errorData.message || 'Could not send request.'}`;
            //     formMessage.classList.add('error');
            // }

            // Temporarily display success without backend for testing
            formMessage.textContent = 'Your request has been sent successfully! (Actual sending functionality requires backend)'; // Translated
            formMessage.classList.add('success');
            contactForm.reset(); // Reset form
            // After reset, if car info exists from URL, re-fill it
            if (carId && carName) {
                carOfInterestInput.value = `${decodeURIComponent(carName)} (ID: ${carId})`;
            }
            // Also re-fill inquiry type if it was pre-filled
            if (inquiryType) {
                inquiryTypeSelect.value = inquiryType;
            }


        } catch (error) {
            console.error('Error submitting contact form:', error); // Translated
            formMessage.textContent = 'An error occurred while sending your request. Please try again later.'; // Translated
            formMessage.classList.add('error');
        }
    });
});