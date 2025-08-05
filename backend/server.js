// Import necessary modules
const express = require('express');
const mysql = require('mysql2/promise'); // Use mysql2 with Promise for async/await support
const cors = require('cors'); // To handle Cross-Origin Resource Sharing
const dotenv = require('dotenv'); // To load environment variables from .env file
const path = require('path'); // Path module to work with file paths

// Load environment variables from .env file (if any)
dotenv.config();

// Initialize Express application
const app = express();
const port = process.env.PORT || 5501; // Use port from .env or default to 5501

// Middleware
app.use(cors()); // Allow all origins (can be configured more specifically if needed)
app.use(express.json()); // To parse JSON body from HTTP requests

// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'car_sales_db'
};

// Create a connection pool to efficiently manage database connections
let pool;

async function connectDb() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('Successfully connected to the database with ID:'); // Translated
    } catch (err) {
        console.error('Database connection error:', err); // Translated
        // Optionally exit the application if unable to connect to the database
        process.exit(1);
    }
}

// Call the database connection function when the server starts
connectDb();

// Middleware to pass the database connection pool into the request (helps routes easily access DB)
app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// Serve static images
// Ensure the 'images' folder is inside the 'backend' folder (e.g., car-sales/backend/images)
// Then, images will be accessible via http://localhost:5500/images/image_name.jpg
app.use('/images', express.static(path.join(__dirname, 'images')));

// Import and use routes
// Ensure these files exist in backend/routes/
const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/cars'); // Assuming cars.js handles car-related logic
const cartRoutes = require('./routes/cart'); // Assuming cart.js handles cart-related logic
const orderRoutes = require('./routes/orders'); // Assuming orders.js handles order/checkout logic

app.use('/api/auth', authRoutes); // Routes related to login/registration
app.use('/api/cars', carRoutes);   // Routes related to cars (get list, add, edit, delete)
app.use('/api/cart', cartRoutes);   // Routes related to shopping cart
app.use('/api/orders', orderRoutes); // Routes related to orders/checkout

// Removed the duplicate express.json() and hardcoded /api/cars/checkout route
// The checkout logic should be handled within carRoutes or orderRoutes as demonstrated previously.
// app.use(express.json()); // This is already defined above
// app.post('/api/cars/checkout', (req, res) => {
//     // handle the checkout logic
// });


// Default route or server health check
app.get('/', (req, res) => {
    res.send('Car sales server is running!'); // Translated
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('An error occurred on the server!'); // Translated
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Access frontend at: http://127.0.0.1:5501/frontend/index.html (if you are using Live Server or opening files directly)`); // Translated
    console.log(`Access backend API at: http://localhost:${port}/api/...`);
});