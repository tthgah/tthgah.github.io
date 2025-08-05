// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Ensure bcryptjs is installed
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Use the existing connection

const secretKey = 'your_jwt_secret_key_very_secret_and_long'; // Must match secretKey in middleware/auth.js

// Register new user
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please fill in all fields.' }); // Translated
    }

    try {
        // Check if email already exists
        const [existingUser] = await db.promise().query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Email already exists. Please use a different email.' }); // Translated
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // Save user to database
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        const [result] = await db.promise().query(sql, [username, email, hashedPassword]);

        res.status(201).json({ message: 'Registration successful!', userId: result.insertId }); // Translated
    } catch (error) {
        console.error('Error during registration:', error); // Translated
        res.status(500).json({ message: 'Server error during account registration.' }); // Translated
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter email and password.' }); // Translated
    }

    try {
        // Find user by email
        const sql = 'SELECT id, username, email, password FROM users WHERE email = ?';
        const [rows] = await db.promise().query(sql, [email]);
        const user = rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' }); // Translated
        }

        // Compare hashed password
        // FIX: "Illegal arguments: string, undefined"
        // Ensure both 'password' (from req.body) and 'user.password' (from DB) are strings
        const isMatch = await bcrypt.compare(password, String(user.password)); 

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' }); // Translated
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            secretKey,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.status(200).json({ 
            message: 'Login successful!', // Translated
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error during login:', error); // Translated
        res.status(500).json({ message: 'Server error during login.' }); // Translated
    }
});

module.exports = router;