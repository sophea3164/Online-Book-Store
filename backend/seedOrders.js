require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const { User, Book, Order, OrderItem } = require('./models');

const seedOrders = async () => {
    try {
        await connectDB();
        console.log('Seeding 10 sample sales...');

        const users = await User.find({ role: 'customer' });
        const books = await Book.find({ is_active: true });

        if (users.length === 0 || books.length === 0) {
            console.log('Please ensure you have seeded users and books first.');
            process.exit(1);
        }

        const statuses = ['completed', 'completed', 'completed', 'shipping', 'processing'];
        let ordersAdded = 0;

        for (let i = 0; i < 10; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const bookCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 items per order
            
            let totalAmount = 0;
            const orderItemsPayload = [];
            
            for (let j = 0; j < bookCount; j++) {
                const book = books[Math.floor(Math.random() * books.length)];
                const quantity = Math.floor(Math.random() * 2) + 1; // 1 to 2 copies
                totalAmount += book.price * quantity;
                
                orderItemsPayload.push({
                    book_id: book._id,
                    quantity: quantity,
                    unit_price: book.price
                });
            }

            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            // Create the order
            const order = await Order.create({
                user_id: user._id,
                total_amount: totalAmount.toFixed(2),
                status: status,
                shipping_address: '123 Fake Street, Phnom Penh',
                shipping_city: 'Phnom Penh',
                shipping_phone: '012345678',
                payment_method: Math.random() > 0.5 ? 'cod' : 'online',
                payment_status: status === 'completed' ? 'paid' : 'pending',
                notes: 'Sample seed order'
            });

            // Create order items
            for (const item of orderItemsPayload) {
                await OrderItem.create({
                    order_id: order._id,
                    ...item
                });
            }
            
            ordersAdded++;
        }

        console.log(`✅ Successfully added ${ordersAdded} sample orders!`);
        process.exit(0);

    } catch (err) {
        console.error('❌ Failed to seed orders:', err);
        process.exit(1);
    }
};

seedOrders();
