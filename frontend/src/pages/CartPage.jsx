import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';

const API_BASE = 'http://localhost:3001';

export default function CartPage() {
    const { cart, updateItem, removeItem, clearCart } = useCart();

    const handleQty = async (item, delta) => {
        const newQty = item.quantity + delta;
        if (newQty < 1) { await removeItem(item.id); toast.info('Item removed'); return; }
        if (newQty > item.book.stock) { toast.warning('Not enough stock'); return; }
        await updateItem(item.id, newQty);
    };

    const handleRemove = async (id) => { await removeItem(id); toast.info('Item removed'); };

    if (!cart.items.length) return (
        <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
            <h2 style={{ fontWeight: 800, marginBottom: '.5rem' }}>Your cart is empty</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Browse our collection and add some books!</p>
            <Link to="/books" className="btn btn-primary btn-lg">Browse Books</Link>
        </div>
    );

    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontWeight: 800 }}>🛒 Shopping Cart ({cart.items.length})</h1>
                <button onClick={() => { clearCart(); toast.info('Cart cleared'); }} className="btn btn-sm btn-danger">Clear All</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
                {/* Items */}
                <div>
                    {cart.items.map(item => {
                        const imgSrc = item.book.image_url?.startsWith('http') ? item.book.image_url : `${API_BASE}${item.book.image_url}`;
                        return (
                            <div key={item.id} className="cart-item">
                                <Link to={`/books/${item.book.id}`}>
                                    <img src={imgSrc} alt={item.book.title} className="cart-item-img"
                                        onError={e => { e.target.src = 'https://via.placeholder.com/80x110?text=Book'; }} />
                                </Link>
                                <div style={{ flex: 1 }}>
                                    <Link to={`/books/${item.book.id}`} style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a2e' }}>{item.book.title}</Link>
                                    <p style={{ color: '#6b7280', fontSize: '.85rem' }}>by {item.book.author}</p>
                                    <p style={{ color: '#e85d04', fontWeight: 700, margin: '.4rem 0' }}>${parseFloat(item.book.price).toFixed(2)}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '.5rem' }}>
                                        <div className="qty-control">
                                            <button className="qty-btn" onClick={() => handleQty(item, -1)}>−</button>
                                            <span style={{ fontWeight: 700, minWidth: 28, textAlign: 'center' }}>{item.quantity}</span>
                                            <button className="qty-btn" onClick={() => handleQty(item, 1)}>+</button>
                                        </div>
                                        <span style={{ fontWeight: 700 }}>${(item.quantity * parseFloat(item.book.price)).toFixed(2)}</span>
                                        <button onClick={() => handleRemove(item.id)} className="btn btn-sm btn-danger">Remove</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,.1)', position: 'sticky', top: 80 }}>
                    <h2 style={{ fontWeight: 800, marginBottom: '1.25rem' }}>Order Summary</h2>
                    {cart.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem', marginBottom: '.5rem' }}>
                            <span style={{ color: '#6b7280' }}>{item.book.title} x{item.quantity}</span>
                            <span>${(item.quantity * parseFloat(item.book.price)).toFixed(2)}</span>
                        </div>
                    ))}
                    <div style={{ borderTop: '2px dashed #e5e7eb', margin: '1rem 0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem' }}>
                        <span>Total</span>
                        <span style={{ color: '#e85d04' }}>${cart.total.toFixed(2)}</span>
                    </div>
                    <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginBottom: '.75rem' }}>Proceed to Checkout →</Link>
                    <Link to="/books" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>← Continue Shopping</Link>
                </div>
            </div>
        </div>
    );
}
