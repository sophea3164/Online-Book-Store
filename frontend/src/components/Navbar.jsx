import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const cartCtx = useCart();
    const cartCount = cartCtx?.cartCount ?? 0;
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/'); };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">📚 BookStore</Link>
                <div className="navbar-links">
                    <Link to="/">Home</Link>
                    <Link to="/books">Browse Books</Link>
                    {user && <Link to="/orders">My Orders</Link>}
                    {isAdmin && <Link to="/admin" style={{ color: '#f4a261', fontWeight: 700 }}>⚙ Admin</Link>}
                </div>
                <div className="navbar-actions">
                    {user ? (
                        <>
                            <Link to="/cart" className="btn btn-ghost cart-btn" style={{ color: '#fff', position: 'relative' }}>
                                🛒
                                {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
                            </Link>
                            <span style={{ color: 'rgba(255,255,255,.6)', fontSize: '.85rem' }}>Hi, {user.name.split(' ')[0]}</span>
                            <Link to="/profile" className="btn btn-sm" style={{ background: 'rgba(255,255,255,.1)', color: '#fff', borderRadius: '8px', marginLeft: '.5rem', marginRight: '.5rem' }}>
                                Profile
                            </Link>
                            <button onClick={handleLogout} className="btn btn-sm" style={{ background: 'rgba(255,255,255,.1)', color: '#fff', borderRadius: '8px' }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-sm btn-ghost" style={{ color: 'rgba(255,255,255,.8)' }}>Login</Link>
                            <Link to="/register" className="btn btn-sm btn-primary">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
