import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import BookCard from '../components/BookCard';

export default function BooksPage() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('category_id') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const [localSearch, setLocalSearch] = useState(search);

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const params = { limit: 12, page };
                if (search) params.search = search;
                if (categoryId) params.category_id = categoryId;
                const res = await api.get('/books', { params });
                setBooks(res.data.data);
                setPagination(res.data.pagination);
            } catch { } finally { setLoading(false); }
        };
        fetchBooks();
    }, [search, categoryId, page]);

    useEffect(() => {
        api.get('/categories').then(r => setCategories(r.data.data)).catch(() => { });
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const p = {};
        if (localSearch) p.search = localSearch;
        if (categoryId) p.category_id = categoryId;
        setSearchParams(p);
    };

    const setCategory = (id) => {
        const p = {};
        if (search) p.search = search;
        if (id) p.category_id = id;
        setSearchParams(p);
    };

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <h1>📚 Browse Books</h1>
                    <p>{pagination.total} books found</p>
                </div>
            </div>

            <div className="container" style={{ paddingBottom: '4rem' }}>
                {/* Search & Filters */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.08)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '.5rem', flex: '1', minWidth: '240px' }}>
                        <input className="input" placeholder="Search title, author..." value={localSearch} onChange={e => setLocalSearch(e.target.value)} style={{ flex: 1 }} />
                        <button type="submit" className="btn btn-primary btn-sm">Search</button>
                    </form>
                    <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                        <button onClick={() => setCategory('')} className={`btn btn-sm ${!categoryId ? 'btn-primary' : ''}`} style={!categoryId ? {} : { background: '#f1f5f9', color: '#334155' }}>All</button>
                        {categories.map(cat => (
                            <button key={cat.id} onClick={() => setCategory(cat.id)} className="btn btn-sm" style={categoryId == cat.id ? { background: '#e85d04', color: '#fff' } : { background: '#f1f5f9', color: '#334155' }}>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? <div className="spinner" /> : books.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                        <h3>No books found</h3>
                        <p>Try a different search or category</p>
                    </div>
                ) : (
                    <>
                        <div className="books-grid">
                            {books.map(book => <BookCard key={book.id} book={book} />)}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', marginTop: '2.5rem' }}>
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                                    <button key={p} onClick={() => setSearchParams({ ...(search && { search }), ...(categoryId && { category_id: categoryId }), page: p })}
                                        className="btn btn-sm" style={p === page ? { background: '#e85d04', color: '#fff' } : { background: '#f1f5f9', color: '#334155' }}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
