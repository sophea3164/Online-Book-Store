import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer style={{ background: '#1a1a2e', color: 'rgba(255,255,255,.7)', padding: '3rem 0 1.5rem' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                    <div>
                        <h3 style={{ color: '#f4a261', fontWeight: 800, fontSize: '1.3rem', marginBottom: '.75rem' }}>📚 BookStore</h3>
                        <p style={{ fontSize: '.88rem', lineHeight: 1.6 }}>Your one-stop destination for books of all genres. Shop anytime, anywhere.</p>
                    </div>
                    <div>
                        <h4 style={{ color: '#fff', marginBottom: '.75rem' }}>Quick Links</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', fontSize: '.88rem' }}>
                            <Link to="/" style={{ color: 'rgba(255,255,255,.7)' }}>Home</Link>
                            <Link to="/books" style={{ color: 'rgba(255,255,255,.7)' }}>Browse Books</Link>
                            <Link to="/cart" style={{ color: 'rgba(255,255,255,.7)' }}>Shopping Cart</Link>
                            <Link to="/orders" style={{ color: 'rgba(255,255,255,.7)' }}>My Orders</Link>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ color: '#fff', marginBottom: '.75rem' }}>Contact</h4>
                        <p style={{ fontSize: '.88rem' }}>📍 Phnom Penh, Cambodia</p>
                        <p style={{ fontSize: '.88rem', marginTop: '.3rem' }}>📞 +855 12 345 678</p>
                        <p style={{ fontSize: '.88rem', marginTop: '.3rem' }}>✉ info@bookstore.kh</p>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: '1.5rem', textAlign: 'center', fontSize: '.82rem' }}>
                    © {new Date().getFullYear()} Online Book Store. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
