import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const API_BASE = 'http://localhost:3001';

export default function BookDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [review, setReview] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [tab, setTab] = useState('desc');

    useEffect(() => {
        api.get(`/books/${id}`).then(r => setBook(r.data.data)).catch(() => { }).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="spinner" />;
    if (!book) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}><h2>Book not found</h2></div>;

    const imgSrc = book.image_url?.startsWith('http') ? book.image_url : `${API_BASE}${book.image_url}`;

    const handleAddToCart = async () => {
        if (!user) { toast.info('Please login first'); return; }
        try { await addToCart(book.id, qty); toast.success('Added to cart!'); }
        catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    };

    const handleReview = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post(`/books/${id}/reviews`, review);
            toast.success('Review submitted!');
            const r = await api.get(`/books/${id}`);
            setBook(r.data.data);
            setReview({ rating: 5, comment: '' });
        } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
            <Link to="/books" style={{ color: '#e85d04', fontWeight: 600 }}>← Back to Books</Link>

            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2.5rem', marginTop: '1.5rem', alignItems: 'start' }}>
                {/* Book image */}
                <div style={{ maxWidth: 280 }}>
                    <img src={imgSrc} alt={book.title} style={{ width: '100%', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,.15)' }}
                        onError={e => { e.target.src = 'https://via.placeholder.com/280x380?text=No+Image'; }} />
                </div>

                {/* Book info */}
                <div>
                    <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.75rem', flexWrap: 'wrap' }}>
                        {book.category && <span className="badge badge-primary">{book.category.name}</span>}
                        {book.language && <span className="badge" style={{ background: '#f1f5f9', color: '#334155' }}>{book.language}</span>}
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '.3rem' }}>{book.title}</h1>
                    <p style={{ color: '#6b7280', marginBottom: '.75rem' }}>by <strong style={{ color: '#334155' }}>{book.author}</strong></p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <StarRating rating={book.avg_rating} count={book.review_count} size="1.2rem" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 800, color: '#e85d04' }}>${parseFloat(book.price).toFixed(2)}</span>
                        {book.original_price && <span style={{ fontSize: '1rem', color: '#9ca3af', textDecoration: 'line-through' }}>${parseFloat(book.original_price).toFixed(2)}</span>}
                    </div>

                    <div style={{ marginBottom: '1.5rem', color: book.stock === 0 ? '#e63946' : book.stock <= 5 ? '#e9c46a' : '#2d6a4f', fontWeight: 600 }}>
                        {book.stock === 0 ? '❌ Out of Stock' : book.stock <= 5 ? `⚠ Only ${book.stock} left!` : `✅ In Stock (${book.stock} available)`}
                    </div>

                    {book.stock > 0 && (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div className="qty-control">
                                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: 30, textAlign: 'center' }}>{qty}</span>
                                <button className="qty-btn" onClick={() => setQty(q => Math.min(book.stock, q + 1))}>+</button>
                            </div>
                            <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>🛒 Add to Cart</button>
                            <Link to="/cart" className="btn btn-outline btn-lg">View Cart</Link>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: '.5rem 2rem', fontSize: '.88rem', color: '#6b7280' }}>
                        {book.publisher && <span>🏢 Publisher: <strong style={{ color: '#334155' }}>{book.publisher}</strong></span>}
                        {book.published_year && <span>📅 Year: <strong style={{ color: '#334155' }}>{book.published_year}</strong></span>}
                        {book.pages && <span>📄 Pages: <strong style={{ color: '#334155' }}>{book.pages}</strong></span>}
                        {book.isbn && <span>🔖 ISBN: <strong style={{ color: '#334155' }}>{book.isbn}</strong></span>}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ marginTop: '3rem' }}>
                <div style={{ display: 'flex', gap: '.5rem', borderBottom: '2px solid #e5e7eb', marginBottom: '1.5rem' }}>
                    {['desc', 'reviews'].map(t => (
                        <button key={t} onClick={() => setTab(t)} className="btn btn-sm" style={{ borderRadius: '8px 8px 0 0', fontWeight: 700, borderBottom: tab === t ? '3px solid #e85d04' : '3px solid transparent', color: tab === t ? '#e85d04' : '#6b7280', background: 'none' }}>
                            {t === 'desc' ? 'Description' : `Reviews (${book.review_count})`}
                        </button>
                    ))}
                </div>

                {tab === 'desc' ? (
                    <div style={{ lineHeight: 1.8, color: '#374151', maxWidth: 720 }}>{book.description || 'No description available.'}</div>
                ) : (
                    <div>
                        {/* Review list */}
                        {(book.reviews || []).length === 0 ? (
                            <p style={{ color: '#9ca3af' }}>No reviews yet. Be the first!</p>
                        ) : (
                            (book.reviews || []).map(r => (
                                <div key={r.id} style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem' }}>
                                        <strong>{r.user?.name}</strong>
                                        <span style={{ fontSize: '.82rem', color: '#9ca3af' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <StarRating rating={r.rating} />
                                    <p style={{ marginTop: '.5rem', color: '#374151' }}>{r.comment}</p>
                                </div>
                            ))
                        )}

                        {/* Submit review form */}
                        {user ? (
                            <form onSubmit={handleReview} style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', marginTop: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                                <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Write a Review</h3>
                                <div className="form-group">
                                    <label>Rating</label>
                                    <div style={{ display: 'flex', gap: '.5rem' }}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button key={s} type="button" onClick={() => setReview(r => ({ ...r, rating: s }))}
                                                style={{ fontSize: '1.5rem', background: 'none', color: s <= review.rating ? '#e9c46a' : '#d1d5db', transition: 'color .2s' }}>★</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Comment</label>
                                    <textarea className="input" rows={3} value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} placeholder="Share your thoughts..." />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
                            </form>
                        ) : (
                            <p style={{ color: '#9ca3af', marginTop: '1rem' }}><Link to="/login" style={{ color: '#e85d04' }}>Login</Link> to write a review</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
