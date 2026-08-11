import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import StarRating from './StarRating';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const API_BASE = 'http://localhost:3001';

export default function BookCard({ book }) {
    const { user } = useAuth();
    const { addToCart } = useCart();

    const handleAddToCart = async (e) => {
        e.preventDefault();
        if (!user) { toast.info('Please login to add to cart'); return; }
        if (book.stock === 0) { toast.error('Out of stock'); return; }
        try {
            await addToCart(book.id, 1);
            toast.success(`"${book.title}" added to cart!`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add to cart');
        }
    };

    const imgSrc = book.image_url?.startsWith('http') ? book.image_url : `${API_BASE}${book.image_url}`;
    const discount = book.original_price ? Math.round((1 - book.price / book.original_price) * 100) : 0;

    return (
        <Link to={`/books/${book.id}`} className="card book-card">
            <div className="book-card-img">
                <img
                    src={imgSrc}
                    alt={book.title}
                    onError={e => { e.target.src = 'https://via.placeholder.com/220x280?text=No+Image'; }}
                />
                <div className="book-card-badge">
                    {book.stock === 0
                        ? <span className="badge badge-danger">Out of Stock</span>
                        : book.stock <= 5
                            ? <span className="badge badge-warning">Low Stock</span>
                            : discount > 0
                                ? <span className="badge badge-primary">-{discount}%</span>
                                : null}
                </div>
            </div>
            <div className="book-card-body">
                <div className="book-card-title">{book.title}</div>
                <div className="book-card-author">by {book.author}</div>
                {book.category && <div style={{ fontSize: '.78rem', color: '#e85d04', marginBottom: '.3rem' }}>{book.category.name}</div>}
                <div className="book-card-rating">
                    <StarRating rating={book.avg_rating} />
                    <span>({book.review_count})</span>
                </div>
                <div className="book-card-footer">
                    <div>
                        <div className="price">${parseFloat(book.price).toFixed(2)}</div>
                        {book.original_price && <div className="price-original">${parseFloat(book.original_price).toFixed(2)}</div>}
                    </div>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleAddToCart}
                        disabled={book.stock === 0}
                    >
                        🛒 Add
                    </button>
                </div>
            </div>
        </Link>
    );
}
