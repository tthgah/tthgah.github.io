// backend/routes/cart.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth'); // User authentication required

// Middleware to protect all routes in this file
router.use(verifyToken);

// 1. Route to GET the current user's cart
router.get('/', async (req, res) => {
    const userId = req.user.id; // Get userId from token

    const sql = `
        SELECT ci.id AS cartItemId, ci.car_id, ci.quantity, 
               c.make, c.model, c.price, c.image_url, c.stock
        FROM cart_items ci
        JOIN cars c ON ci.car_id = c.id
        WHERE ci.user_id = ?
    `;

    try {
        const [rows] = await db.promise().query(sql, [userId]);
        const cartItems = rows.map(row => ({
            id: row.car_id, // Car ID
            cartItemId: row.cartItemId, // ID of the item in the cart_items table
            name: `${row.make} ${row.model}`,
            price: parseFloat(row.price), // Ensure price is a number
            quantity: row.quantity,
            imageUrl: `images/${row.image_url}`, // Full image path for front-end
            stock: row.stock // Current stock quantity
        }));
        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ message: 'Server error when fetching cart.' }); // Translated
    }
});

// 2. Route to ADD product to cart
router.post('/', async (req, res) => {
    console.log('POST body:', req.body); 
    const userId = req.user.id;
    const { carId = 1, quantity = 1 } = req.body; // Default quantity is 1

    if (!carId) {
        return res.status(400).json({ message: 'Missing carId.' }); // Translated
    }
    if (quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be greater than 0.' }); // Translated
    }

    try {
        // Check if car exists and is in stock
        const [carRows] = await db.promise().query('SELECT stock, make, model FROM cars WHERE id = ?', [carId]);
        if (carRows.length === 0) {
            return res.status(404).json({ message: 'Car not found.' }); // Translated
        }
        const car = carRows[0];

        // Check if product is already in cart
        const [existingCartItemRows] = await db.promise().query('SELECT quantity FROM cart_items WHERE user_id = ? AND car_id = ?', [userId, carId]);

        let sql, message;
        if (existingCartItemRows.length > 0) {
            // If already in cart, update quantity
            const currentQuantity = existingCartItemRows[0].quantity;
            const newQuantity = currentQuantity + quantity;

            if (newQuantity > car.stock) {
                return res.status(400).json({ message: `Insufficient stock for ${car.make} ${car.model}. Only ${car.stock} units left.` }); // Translated
            }
            sql = 'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND car_id = ?';
            await db.promise().query(sql, [newQuantity, userId, carId]);
            message = `Updated quantity of ${car.make} ${car.model} in cart to ${newQuantity}.`; // Translated
        } else {
            // If not in cart, add new
            if (quantity > car.stock) {
                return res.status(400).json({ message: `Insufficient stock for ${car.make} ${car.model}. Only ${car.stock} units left.` }); // Translated
            }
            sql = 'INSERT INTO cart_items (user_id, car_id, quantity) VALUES (?, ?, ?)';
            await db.promise().query(sql, [userId, carId, quantity]);
            message = `Added ${car.make} ${car.model} to cart.`; // Translated
        }
        res.status(200).json({ message: message });

    } catch (error) {
        console.error('Error adding/updating cart item:', error);
        res.status(500).json({ message: 'Server error when adding product to cart.' }); // Translated
    }
});

// 3. Route to DELETE product from cart
router.delete('/:carId', async (req, res) => {
    const userId = req.user.id;
    const { carId } = req.params;

    try {
        const sql = 'DELETE FROM cart_items WHERE user_id = ? AND car_id = ?';
        const [result] = await db.promise().query(sql, [userId, carId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not in your cart or does not exist.' }); // Translated
        }
        res.status(200).json({ message: 'Product removed from cart.' }); // Translated
    } catch (error) {
        console.error('Error deleting cart item:', error);
        res.status(500).json({ message: 'Server error when deleting product from cart.' }); // Translated
    }
});

module.exports = router;