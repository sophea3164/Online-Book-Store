require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');
const { User, Category, Book } = require('./models');

const seed = async () => {
    try {
        await connectDB();
        console.log('Clearing database...');
        await mongoose.connection.db.dropDatabase();
        
        console.log('Seeding...');

        // Admin user
        const adminPass = await bcrypt.hash('admin123', 12);
        await User.create({ name: 'Admin', email: 'admin@bookstore.com', phone: '012345678', password: adminPass, role: 'admin' });

        // Sample customer
        const custPass = await bcrypt.hash('password123', 12);
        await User.create({ name: 'Dara Chan', email: 'customer@bookstore.com', phone: '099123456', password: custPass, role: 'customer' });

        // Categories
        const cats = await Category.insertMany([
            { name: 'Novel' }, { name: 'Science' }, { name: 'Business' }, { name: 'History' },
            { name: 'Self Help' }, { name: 'Technology' }, { name: 'Children' }, { name: 'Biography' }
        ]);

        // Books
        await Book.insertMany([
            { title: 'The Alchemist', author: 'Paulo Coelho', category_id: cats[0]._id, price: 12.99, original_price: 18.00, stock: 50, description: 'A magical story about following your dreams.', image_url: 'https://covers.openlibrary.org/b/id/8095631-L.jpg', avg_rating: 4.8, review_count: 120, publisher: 'HarperCollins', published_year: 1988, pages: 208, language: 'English', is_featured: true },
            { title: 'Sapiens', author: 'Yuval Noah Harari', category_id: cats[1]._id, price: 15.99, original_price: 22.00, stock: 30, description: 'A brief history of humankind.', image_url: 'https://covers.openlibrary.org/b/id/8108215-L.jpg', avg_rating: 4.7, review_count: 200, publisher: 'Harvill Secker', published_year: 2011, pages: 443, language: 'English', is_featured: true },
            { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', category_id: cats[2]._id, price: 10.99, original_price: 14.00, stock: 60, description: 'What the rich teach their kids about money.', image_url: 'https://covers.openlibrary.org/b/id/8739161-L.jpg', avg_rating: 4.5, review_count: 310, publisher: 'Warner Books', published_year: 1997, pages: 336, language: 'English', is_featured: true },
            { title: 'Atomic Habits', author: 'James Clear', category_id: cats[4]._id, price: 14.99, original_price: 20.00, stock: 45, description: 'Tiny changes, remarkable results.', image_url: 'https://covers.openlibrary.org/b/id/10519270-L.jpg', avg_rating: 4.9, review_count: 450, publisher: 'Avery', published_year: 2018, pages: 320, language: 'English', is_featured: true },
            { title: 'Clean Code', author: 'Robert C. Martin', category_id: cats[5]._id, price: 19.99, original_price: 25.00, stock: 25, description: 'A handbook of agile software craftsmanship.', image_url: 'https://covers.openlibrary.org/b/id/8836101-L.jpg', avg_rating: 4.6, review_count: 180, publisher: "O'Reilly", published_year: 2008, pages: 431, language: 'English', is_featured: false },
            { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category_id: cats[4]._id, price: 13.99, original_price: 19.00, stock: 35, description: 'Dual system of thinking explained.', image_url: 'https://covers.openlibrary.org/b/id/8303661-L.jpg', avg_rating: 4.4, review_count: 95, publisher: 'Farrar Straus Giroux', published_year: 2011, pages: 499, language: 'English', is_featured: false },
            { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category_id: cats[0]._id, price: 8.99, original_price: 12.00, stock: 8, description: 'A story of the Jazz Age.', image_url: 'https://covers.openlibrary.org/b/id/8432472-L.jpg', avg_rating: 4.2, review_count: 77, publisher: 'Scribner', published_year: 1925, pages: 180, language: 'English', is_featured: false },
            { title: 'Steve Jobs', author: 'Walter Isaacson', category_id: cats[7]._id, price: 16.99, original_price: 22.00, stock: 20, description: 'The exclusive biography of Steve Jobs.', image_url: 'https://covers.openlibrary.org/b/id/7222246-L.jpg', avg_rating: 4.7, review_count: 230, publisher: 'Simon & Schuster', published_year: 2011, pages: 656, language: 'English', is_featured: true },
            { title: 'The Little Prince', author: 'Antoine de Saint-Exupéry', category_id: cats[6]._id, price: 7.99, original_price: 10.00, stock: 5, description: 'A poetic tale for children and adults.', image_url: 'https://covers.openlibrary.org/b/id/6593528-L.jpg', avg_rating: 4.9, review_count: 500, publisher: 'Reynal & Hitchcock', published_year: 1943, pages: 96, language: 'English', is_featured: true },
            { title: 'Homo Deus', author: 'Yuval Noah Harari', category_id: cats[1]._id, price: 14.99, original_price: 20.00, stock: 28, description: 'A brief history of tomorrow.', image_url: 'https://covers.openlibrary.org/b/id/8592311-L.jpg', avg_rating: 4.5, review_count: 140, publisher: 'Harvill Secker', published_year: 2015, pages: 443, language: 'English', is_featured: false },
            { title: 'Zero to One', author: 'Peter Thiel', category_id: cats[2]._id, price: 11.99, original_price: 16.00, stock: 40, description: 'Notes on startups, or how to build the future.', image_url: 'https://covers.openlibrary.org/b/id/8258215-L.jpg', avg_rating: 4.6, review_count: 160, publisher: 'Crown Business', published_year: 2014, pages: 224, language: 'English', is_featured: false },
            { title: '1984', author: 'George Orwell', category_id: cats[0]._id, price: 9.99, original_price: 13.00, stock: 3, description: 'A dystopian social science fiction.', image_url: 'https://covers.openlibrary.org/b/id/8575708-L.jpg', avg_rating: 4.8, review_count: 380, publisher: 'Secker & Warburg', published_year: 1949, pages: 328, language: 'English', is_featured: false }
        ]);

        console.log('✅ Seed complete!');
        console.log('Admin: admin@bookstore.com / admin123');
        console.log('Customer: customer@bookstore.com / password123');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err);
        process.exit(1);
    }
};

seed();
