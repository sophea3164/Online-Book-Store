import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const statusClass = { processing: 'status-processing', shipping: 'status-shipping', completed: 'status-completed', cancelled: 'status-cancelled' };
const statusLabel = { processing: '⏳ Processing', shipping: '🚚 Shipping', completed: '✅ Completed', cancelled: '❌ Cancelled' };

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { api.get('/orders').then(r => setOrders(r.data.data)).catch(() => { }).finally(() => setLoading(false)); }, []);

    if (loading) return <div className="spinner" />;

    if (!orders.length) return (
        <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
            <h2 style={{ fontWeight: 800, marginBottom: '.5rem' }}>No orders yet</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Start shopping to place your first order!</p>
            <Link to="/books" className="btn btn-primary btn-lg">Browse Books</Link>
        </div>
    );

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <h1>📦 My Orders</h1>
                    <p>{orders.length} orders total</p>
                </div>
            </div>
            <div className="container" style={{ paddingBottom: '4rem' }}>
                {orders.map(order => (
                    <div key={order.id} style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,.07)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.4rem' }}>
                                    <strong style={{ fontSize: '1rem' }}>Order #{order.id}</strong>
                                    <span className={`status-badge ${statusClass[order.status]}`}>{statusLabel[order.status]}</span>
                                </div>
                                <p style={{ color: '#6b7280', fontSize: '.85rem' }}>📅 {new Date(order.createdAt || order.created_at).toLocaleString()}</p>
                                <p style={{ color: '#6b7280', fontSize: '.85rem', marginTop: '.2rem' }}>💰 {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e85d04' }}>${parseFloat(order.total_amount).toFixed(2)}</div>
                                <div style={{ fontSize: '.82rem', color: '#9ca3af' }}>{order.items?.length} item(s)</div>
                                <Link to={`/orders/${order.id}`} className="btn btn-outline btn-sm" style={{ marginTop: '.5rem' }}>View Details</Link>
                            </div>
                        </div>
                        {/* Mini items list */}
                        <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                            {order.items?.slice(0, 4).map(item => (
                                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: '#f8f9fa', borderRadius: 8, padding: '.3rem .75rem', fontSize: '.82rem' }}>
                                    <span>{item.book?.title}</span>
                                    <span style={{ color: '#9ca3af' }}>x{item.quantity}</span>
                                </div>
                            ))}
                            {order.items?.length > 4 && <span style={{ fontSize: '.82rem', color: '#9ca3af', padding: '.3rem .5rem' }}>+{order.items.length - 4} more</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
