import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:3001/api/admin/categories', {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            if (res.data.success) {
                setCategories(res.data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name });
        } else {
            setEditingCategory(null);
            setFormData({ name: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const url = editingCategory
                ? `http://localhost:3001/api/admin/categories/${editingCategory.id}`
                : 'http://localhost:3001/api/admin/categories';

            const method = editingCategory ? 'put' : 'post';
            const token = localStorage.getItem('token');

            const res = await axios({
                method,
                url,
                data: formData,
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });

            if (res.data.success) {
                toast.success(res.data.message);
                fetchCategories();
                handleCloseModal();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save category');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`http://localhost:3001/api/admin/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchCategories();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete category');
        }
    };

    if (loading) {
        return <div className="admin-loading">Loading categories...</div>;
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Categories Management</h1>
                    <p className="admin-page-subtitle">Manage book categories</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary"
                >
                    + Add Category
                </button>
            </div>

            <div className="admin-card" style={{ marginTop: '2rem' }}>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length > 0 ? (
                                categories.map(category => (
                                    <tr key={category.id}>
                                        <td>#{category.id}</td>
                                        <td><strong>{category.name}</strong></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleOpenModal(category)}
                                                className="btn btn-sm btn-outline"
                                                style={{ marginRight: '0.5rem' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="btn btn-sm"
                                                style={{ backgroundColor: '#DC2626', color: 'white', border: 'none' }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                                        No categories found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-group">
                                <label>Category Name</label>
                                <input
                                    type="text"
                                    required
                                    className="form-control"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter category name"
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Save Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
