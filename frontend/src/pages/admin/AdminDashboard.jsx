import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import OrderDetailsModal from '../../components/OrderDetailsModal';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        api.get('/admin/dashboard').then(r => setData(r.data.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner" />;

    const stats = [
        { label: 'Total Books', value: data?.total_books || 0, icon: '📚', color: '#e85d04', link: '/admin/books' },
        { label: 'Total Categories', value: data?.total_categories || 0, icon: '🗂️', color: '#ec4899', link: '/admin/categories' },
        { label: 'Total Users', value: data?.total_users || 0, icon: '👥', color: '#3b82f6', link: '/admin/users' },
        { label: 'Total Orders', value: data?.total_orders || 0, icon: '📦', color: '#8b5cf6', link: '/admin/orders' },
        { label: 'Total Revenue', value: `$${(data?.total_revenue || 0).toFixed(2)}`, icon: '💰', color: '#10b981', link: '/admin/reports' },
        { label: 'Low Stock Books', value: data?.low_stock_count || 0, icon: '⚠', color: '#f59e0b', link: '/admin/reports' },
    ];

    const statusClass = { processing: 'status-processing', shipping: 'status-shipping', completed: 'status-completed', cancelled: 'status-cancelled' };
    const statusLabel = { processing: 'Processing', shipping: 'Shipping', completed: 'Completed', cancelled: 'Cancelled' };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontWeight: 800, fontSize: '1.75rem' }}>📊 Dashboard</h1>
                <p style={{ color: '#6b7280' }}>Welcome back! Here's what's happening today.</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {stats.map(s => (
                    <Link key={s.label} to={s.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="stat-card" style={{ borderLeftColor: s.color, height: '100%', cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                            <span className="icon">{s.icon}</span>
                            <div className="label">{s.label}</div>
                            <div className="value" style={{ color: s.color }}>{s.value}</div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent Orders */}
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,.07)', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>📦 Recent Orders</h2>
                    <Link to="/admin/orders" className="btn btn-sm btn-outline">View All</Link>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            {(data?.recent_orders || []).map(order => (
                                <tr key={order.id}>
                                    <td><strong>#{order.id}</strong></td>
                                    <td>
                                        <div>{order.user?.name}</div>
                                        <div style={{ color: '#9ca3af', fontSize: '.78rem' }}>{order.user?.email}</div>
                                    </td>
                                    <td style={{ fontWeight: 700, color: '#e85d04' }}>${parseFloat(order.total_amount).toFixed(2)}</td>
                                    <td><span className={`status-badge ${statusClass[order.status]}`}>{statusLabel[order.status]}</span></td>
                                    <td style={{ color: '#9ca3af', fontSize: '.82rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button onClick={() => setSelectedOrder(order)} className="btn btn-sm btn-outline">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        </div>
    );
}
