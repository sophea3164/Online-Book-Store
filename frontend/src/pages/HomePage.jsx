import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import BookCard from '../components/BookCard';

export default function HomePage() {
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const [booksRes, catsRes] = await Promise.all([
                    api.get('/books?featured=true&limit=8'),
                    api.get('/categories')
                ]);
                setFeaturedBooks(booksRes.data.data);
                setCategories(catsRes.data.data);
            } catch { } finally { setLoading(false); }
        };
        load();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) navigate(`/books?search=${encodeURIComponent(search)}`);
    };

    return (
        <div>
            {/* Hero */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1>Discover Your Next <span>Great Read</span> 📖</h1>
                        <p>Shop thousands of books online — anytime, anywhere. Fast delivery, secure payment, and great prices.</p>
                        <form className="hero-search" onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Search by title, author, or category..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary">Search</button>
                        </form>
                        <div className="hero-stats">
                            <div className="hero-stat"><strong>10K+</strong><span>Books Available</span></div>
                            <div className="hero-stat"><strong>5K+</strong><span>Happy Customers</span></div>
                            <div className="hero-stat"><strong>Free</strong><span>Returns</span></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="section" style={{ paddingBottom: '2rem' }}>
                <div className="container">
                    <h2 style={{ fontWeight: 800, marginBottom: '1.25rem' }}>Browse by Category</h2>
                    <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                        <Link to="/books" className="btn btn-outline btn-sm">All Books</Link>
                        {categories.map(cat => (
                            <Link key={cat.id} to={`/books?category_id=${cat.id}`} className="btn btn-sm" style={{ background: '#f1f5f9', color: '#334155', border: '1.5px solid #e2e8f0' }}>
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Books */}
            <section className="section" style={{ paddingTop: '1rem' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontWeight: 800 }}>⭐ Featured Books</h2>
                        <Link to="/books" className="btn btn-outline btn-sm">View All →</Link>
                    </div>
                    {loading ? (
                        <div className="spinner" />
                    ) : (
                        <div className="books-grid">
                            {featuredBooks.map(book => <BookCard key={book.id} book={book} />)}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Banner */}
            <section style={{ background: 'linear-gradient(135deg, #e85d04, #f4a261)', padding: '3rem 0', marginTop: '2rem' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.8rem', marginBottom: '.75rem' }}>Ready to Find Your Next Book?</h2>
                    <p style={{ color: 'rgba(255,255,255,.9)', marginBottom: '1.5rem' }}>Thousands of titles waiting for you</p>
                    <Link to="/books" className="btn btn-lg" style={{ background: '#fff', color: '#e85d04', fontWeight: 700 }}>Browse All Books →</Link>
                </div>
            </section>
        </div>
    );
}
