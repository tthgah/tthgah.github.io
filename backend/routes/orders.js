const express = require('express');

const router = express.Router();

const db = require('../config/db'); // Đảm bảo bạn đã export connection pool từ db.js

//const { authenticateToken } = require('../middleware/auth'); // Middleware xác thực
const authenticateToken = require('../middleware/auth');


// Route để tiến hành thanh toán

router.post('/checkout', authenticateToken, async (req, res) => {

  const userId = req.user.id; // Lấy userId từ token đã được xác thực



  try {

    await db.beginTransaction(); // Bắt đầu giao dịch



    // 1. Lấy tất cả các mặt hàng trong giỏ hàng của người dùng

    const [cartItems] = await db.query(

      `SELECT ci.car_id, ci.quantity, c.price, c.stock

      FROM cart_items ci

      JOIN cars c ON ci.car_id = c.id

      WHERE ci.user_id = ?`,

      [userId]

    );



    if (cartItems.length === 0) {

      await db.rollback(); // Hoàn tác nếu giỏ hàng trống

      return res.status(400).json({ message: 'Giỏ hàng của bạn đang trống.' });

    }



    let totalAmount = 0;

    let orderItems = [];



    // 2. Kiểm tra số lượng tồn kho và tính tổng tiền

    for (const item of cartItems) {

      if (item.quantity > item.stock) {

        await db.rollback(); // Hoàn tác nếu vượt quá tồn kho

        return res.status(400).json({

          message: `Số lượng xe ${item.make} ${item.model} (ID: ${item.car_id}) vượt quá số lượng trong kho.`,

          car_id: item.car_id

        });

      }

      totalAmount += item.quantity * item.price;

      orderItems.push({

        car_id: item.car_id,

        quantity: item.quantity,

        price_at_order: item.price // Giá tại thời điểm đặt hàng

      });

    }



    // 3. Tạo một đơn hàng mới trong bảng `orders`

    const [orderResult] = await db.query(

      `INSERT INTO orders (user_id, total_amount, order_date, status)

      VALUES (?, ?, NOW(), 'pending')`, // 'pending' là trạng thái ban đầu

      [userId, totalAmount]

    );

    const orderId = orderResult.insertId;



    // 4. Thêm các mặt hàng vào bảng `order_items`

    for (const item of orderItems) {

      await db.query(

        `INSERT INTO order_items (order_id, car_id, quantity, price_at_order)

        VALUES (?, ?, ?, ?)`,

        [orderId, item.car_id, item.quantity, item.price_at_order]

      );

      // 5. Cập nhật số lượng tồn kho của xe

      await db.query(

        `UPDATE cars

        SET stock = stock - ?

        WHERE id = ?`,

        [item.quantity, item.car_id]

      );

    }



    // 6. Xóa các mặt hàng khỏi giỏ hàng của người dùng

    await db.query(

      `DELETE FROM cart_items

      WHERE user_id = ?`,

      [userId]

    );



    await db.commit(); // Hoàn tất giao dịch

    res.status(200).json({ message: 'Đơn hàng đã được đặt thành công!', orderId: orderId });



  } catch (error) {

    await db.rollback(); // Hoàn tác nếu có lỗi

    console.error('Lỗi khi tiến hành thanh toán:', error);

    res.status(500).json({ message: 'Lỗi server khi tiến hành thanh toán.' });

  }

});



module.exports = router;