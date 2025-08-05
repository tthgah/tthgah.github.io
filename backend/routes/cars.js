// backend/routes/cars.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise'); 
const db = require('../config/db'); // Use the existing connection

const verifyToken = require('../middleware/auth'); // Authentication middleware

// Route to get list of cars, categorized: featured & others
router.get('/', async (req, res) => {
    console.log('Fetching all cars (categorized)'); // Translated
    const sql = 'SELECT id, make, model, year, price, description, image_url, stock FROM cars ORDER BY id ASC'; // Can be changed to updated_at or sales count if available

    try {
        const [results] = await db.promise().query(sql);

        // Categorize: first 6 cars are featured, the rest are others
        const featured = results.slice(0, 6); // Top 6
        const others = results.slice(6);

        res.json({ featured, others });
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ message: 'Server error when fetching car list.' }); // Translated
    }
});


// Route to get car by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT id, make, model, year, price, description, image_url, stock FROM cars WHERE id = ?';
    try {
        const [results] = await db.promise().query(sql, [id]);
        if (results.length === 0) return res.status(404).json({ message: 'Car not found.' }); // Translated
        res.json(results[0]);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ message: 'Server error when fetching car information.' }); // Translated
    }
});

// Route to handle checkout
router.post('/checkout', verifyToken, async (req, res) => {
    const userId = req.user.id; // Get userId from authenticated token
    const { items } = req.body; // List of items from the cart sent up
    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty. Cannot checkout.' }); // Translated
    }

    const connection = await req.pool.getConnection(); // ✅ Correct
    await connection.beginTransaction(); // Start a transaction

    try {
        let totalAmount = 0;
        const carDetailsMap = new Map(); // Store car details for later use

        // Step 1: Verify stock and calculate total amount based on price from database
        for (const item of items) {
            const [carRows] = await connection.query('SELECT id, price, stock FROM cars WHERE id = ? FOR UPDATE', [item.id]); // Use FOR UPDATE to lock row
            if (carRows.length === 0) {
                throw new Error(`Car with ID ${item.id} does not exist.`); // Translated
            }
            const car = carRows[0];

            if (car.stock < item.quantity) {
                throw new Error(`Insufficient stock for car ID ${item.id}. Only ${car.stock} units left.`); // Translated
            }
            totalAmount += parseFloat(car.price) * item.quantity; // Ensure price is a number
            carDetailsMap.set(car.id, car); // Store car details
        }

        // Step 2: Create a new order record in the `orders` table
        const insertOrderSql = 'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)';
        const [orderResult] = await connection.query(insertOrderSql, [userId, totalAmount, 'pending']);
        const orderId = orderResult.insertId;

        // Step 3: Add order items to `order_items` table
        // and update car quantities in `cars`
        const insertOrderItemSql = 'INSERT INTO order_items (order_id, car_id, quantity, price_at_order) VALUES (?, ?, ?, ?)';
        const updateStockSql = 'UPDATE cars SET stock = stock - ? WHERE id = ?';

        for (const item of items) {
            const car = carDetailsMap.get(parseInt(item.id)); // Get car details from Map
            await connection.query(insertOrderItemSql, [orderId, item.id, item.quantity, parseFloat(car.price)]);
            await connection.query(updateStockSql, [item.quantity, item.id]);
        }

        // Step 4: Clear user's cart after successful checkout
        await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

        await connection.commit(); // Complete the transaction
        res.status(200).json({ message: 'Checkout successful and cart cleared!', orderId: orderId, totalAmount: totalAmount }); // Translated

    } catch (error) {
        await connection.rollback(); // Rollback transaction if an error occurs
        console.error('Error during checkout:', error.message); // Translated
        res.status(500).json({ message: `Checkout failed: ${error.message}` }); // Translated
    } finally {
        connection.release(); // Release the connection
    }
});

module.exports = router;