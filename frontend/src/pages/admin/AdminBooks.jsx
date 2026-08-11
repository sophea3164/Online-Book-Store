import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const API_BASE = 'http://localhost:3001';
const EMPTY_FORM = { title: '', author: '', category_id: '', price: '', original_price: '', stock: '', description: '', isbn: '', publisher: '', published_year: '', pages: '', language: 'English', is_featured: false, image_url: '' };

export default function AdminBooks() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [imageFile, setImageFile] = useState(null);
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ pages: 1, total: 0 });
    const fileRef = useRef();

    const load = async (p = 1) => {
        setLoading(true);
        try {
            const params = { limit: 12, page: p };
            if (search) params.search = search;
            const [bRes, cRes] = await Promise.all([api.get('/books', { params }), api.get('/categories')]);
            setBooks(bRes.data.data);
            setPagination(bRes.data.pagination);
            setCategories(cRes.data.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { load(page); }, [page, search]);

    const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setImageFile(null); setShowModal(true); };
    const openEdit = (book) => {
        setEditing(book.id);
        setForm({ title: book.title, author: book.author, category_id: book.category_id || '', price: book.price, original_price: book.original_price || '', stock: book.stock, description: book.description || '', isbn: book.isbn || '', publisher: book.publisher || '', published_year: book.published_year || '', pages: book.pages || '', language: book.language || 'English', is_featured: book.is_featured, image_url: book.image_url || '' });
        setImageFile(null);
        setShowModal(true);
    };

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (imageFile) fd.append('image', imageFile);
            if (editing) await api.put(`/books/${editing}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            else await api.post('/books', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success(editing ? 'Book updated!' : 'Book created!');
            setShowModal(false);
            load(page);
        } catch (e) { toast.error(e.response?.data?.message || 'Error saving book'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}"?`)) return;
        try { await api.delete(`/books/${id}`); toast.success('Book deleted'); load(page); }
        catch { toast.error('Failed to delete'); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div><h1 style={{ fontWeight: 800, fontSize: '1.75rem' }}>📚 Book Management</h1><p style={{ color: '#6b7280' }}>{pagination.total} books total</p></div>
                <button onClick={openCreate} className="btn btn-primary">+ Add New Book</button>
            </div>

            {/* Search */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', display: 'flex', gap: '.75rem' }}>
                <input className="input" placeholder="Search books..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ flex: 1 }} />
            </div>

            {loading ? <div className="spinner" /> : (
                <>
                    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,.07)', overflow: 'hidden' }}>
                        <div className="table-wrap">
                            <table>
                                <thead><tr><th>Book</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Featured</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {books.map(book => {
                                        const img = book.image_url?.startsWith('http') ? book.image_url : `${API_BASE}${book.image_url}`;
                                        return (
                                            <tr key={book.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                                                        <img src={img} alt={book.title} style={{ width: 44, height: 60, objectFit: 'cover', borderRadius: 6 }} onError={e => { e.target.src = 'https://via.placeholder.com/44x60'; }} />
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{book.title}</div>
                                                            <div style={{ color: '#6b7280', fontSize: '.78rem' }}>{book.author}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className="badge badge-primary">{book.category?.name || '-'}</span></td>
                                                <td>
                                                    <div style={{ fontWeight: 700, color: '#e85d04' }}>${parseFloat(book.price).toFixed(2)}</div>
                                                    {book.original_price && <div style={{ fontSize: '.75rem', color: '#9ca3af', textDecoration: 'line-through' }}>${parseFloat(book.original_price).toFixed(2)}</div>}
                                                </td>
                                                <td>
                                                    <span className={`badge ${book.stock === 0 ? 'badge-danger' : book.stock <= 5 ? 'badge-warning' : 'badge-success'}`}>{book.stock}</span>
                                                </td>
                                                <td>⭐ {parseFloat(book.avg_rating).toFixed(1)} ({book.review_count})</td>
                                                <td>{book.is_featured ? '⭐' : '—'}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '.4rem' }}>
                                                        <button onClick={() => openEdit(book)} className="btn btn-sm btn-outline">Edit</button>
                                                        <button onClick={() => handleDelete(book.id, book.title)} className="btn btn-sm btn-danger">Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', marginTop: '1.5rem' }}>
                            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPage(p)} className="btn btn-sm" style={p === page ? { background: '#e85d04', color: '#fff' } : { background: '#f1f5f9', color: '#334155' }}>{p}</button>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontWeight: 800 }}>{editing ? 'Edit Book' : 'Add New Book'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                    <label>Title *</label>
                                    <input className="input" name="title" value={form.title} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Author *</label>
                                    <input className="input" name="author" value={form.author} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select className="input" name="category_id" value={form.category_id} onChange={handleChange}>
                                        <option value="">-- Select Category --</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Price (USD) *</label>
                                    <input className="input" type="number" step=".01" name="price" value={form.price} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Original Price</label>
                                    <input className="input" type="number" step=".01" name="original_price" value={form.original_price} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Stock *</label>
                                    <input className="input" type="number" name="stock" value={form.stock} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Language</label>
                                    <input className="input" name="language" value={form.language} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Publisher</label>
                                    <input className="input" name="publisher" value={form.publisher} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Published Year</label>
                                    <input className="input" type="number" name="published_year" value={form.published_year} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Pages</label>
                                    <input className="input" type="number" name="pages" value={form.pages} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>ISBN</label>
                                    <input className="input" name="isbn" value={form.isbn} onChange={handleChange} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                    <label>Description</label>
                                    <textarea className="input" name="description" value={form.description} onChange={handleChange} rows={3} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                    <label>Cover Image URL (or upload file below)</label>
                                    <input className="input" name="image_url" value={form.image_url} onChange={handleChange} placeholder="https://..." />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                    <label>Upload Image File</label>
                                    <input type="file" ref={fileRef} accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ display: 'block', marginTop: '.4rem' }} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                    <input type="checkbox" name="is_featured" id="featured" checked={form.is_featured} onChange={handleChange} style={{ width: 18, height: 18 }} />
                                    <label htmlFor="featured" style={{ marginBottom: 0 }}>Featured on Homepage</label>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Book' : 'Create Book'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
