// backend/config/db.js
const mysql = require('mysql2'); // Use mysql2 for promise support (optional)

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Your MySQL username
    password: '', // Your MySQL password
    database: 'car_sales_db' // Your database name
});

connection.connect((err) => {
    if (err) {
        console.error('Database connection error:', err.stack); // Translated
        return;
    }
    console.log('Successfully connected to database with ID:', connection.threadId); // Translated
});

module.exports = connection;