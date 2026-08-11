import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import StarRating from '../components/StarRating';

const API_BASE = 'http://localhost:3001';
const statusClass = { processing: 'status-processing', shipping: 'status-shipping', completed: 'status-completed', cancelled: 'status-cancelled' };
const statusLabel = { processing: '⏳ Processing', shipping: '🚚 Shipping', completed: '✅ Completed', cancelled: '❌ Cancelled' };

export default function OrderDetailPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { api.get(`/orders/${id}`).then(r => setOrder(r.data.data)).catch(() => { }).finally(() => setLoading(false)); }, [id]);

    if (loading) return <div className="spinner" />;
    if (!order) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}><h2>Order not found</h2><Link to="/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Orders</Link></div>;

    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
            <Link to="/orders" style={{ color: '#e85d04', fontWeight: 600 }}>← Back to Orders</Link>

            {/* Invoice header */}
            <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', color: '#fff', borderRadius: 16, padding: '2rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f4a261', marginBottom: '.25rem' }}>📚 BookStore</div>
                        <div style={{ opacity: .7, fontSize: '.85rem' }}>Phnom Penh, Cambodia | info@bookstore.kh</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>INVOICE</div>
                        <div style={{ opacity: .7 }}>Order #{order.id}</div>
                        <div style={{ opacity: .7, fontSize: '.85rem' }}>{new Date(order.createdAt || order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Customer info */}
                <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#6b7280', fontSize: '.82rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Bill To</h3>
                    <p style={{ fontWeight: 700 }}>{order.user?.name}</p>
                    <p style={{ color: '#6b7280', fontSize: '.88rem' }}>{order.user?.email}</p>
                    <p style={{ color: '#6b7280', fontSize: '.88rem' }}>{order.user?.phone}</p>
                </div>

                {/* Shipping info */}
                <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#6b7280', fontSize: '.82rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Ship To</h3>
                    <p style={{ fontWeight: 700 }}>{order.shipping_address}</p>
                    {order.shipping_city && <p style={{ color: '#6b7280', fontSize: '.88rem' }}>{order.shipping_city}</p>}
                    <p style={{ color: '#6b7280', fontSize: '.88rem' }}>📞 {order.shipping_phone}</p>
                    <p style={{ color: '#6b7280', fontSize: '.88rem', marginTop: '.5rem' }}>Payment: <strong>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</strong></p>
                </div>
            </div>

            {/* Status timeline */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.07)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700 }}>Order Status:</span>
                    <span className={`status-badge ${statusClass[order.status]}`}>{statusLabel[order.status]}</span>
                </div>
                {/* Timeline */}
                <div style={{ display: 'flex', gap: 0, marginTop: '1.5rem', alignItems: 'center' }}>
                    {['processing', 'completed'].map((s, i) => {
                        const idx = ['processing', 'completed'].indexOf(order.status);
                        const done = i <= idx && order.status !== 'cancelled';
                        return (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 1 ? 1 : 'auto' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.3rem' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? '#e85d04' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: done ? '#fff' : '#9ca3af', fontWeight: 700, fontSize: '.85rem' }}>
                                        {done ? '✓' : i + 1}
                                    </div>
                                    <span style={{ fontSize: '.75rem', fontWeight: 600, color: done ? '#1a1a2e' : '#9ca3af', textTransform: 'capitalize' }}>{s}</span>
                                </div>
                                {i < 1 && <div style={{ flex: 1, height: 3, background: i < idx && order.status !== 'cancelled' ? '#e85d04' : '#e5e7eb', margin: '0 .5rem', marginBottom: '1.2rem' }} />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Items table */}
            <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.07)', overflow: 'hidden', marginBottom: '2rem' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #e5e7eb' }}>
                    <h3 style={{ fontWeight: 700 }}>📖 Order Items</h3>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>Book</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
                        <tbody>
                            {order.items?.map(item => {
                                const img = item.book?.image_url?.startsWith('http') ? item.book.image_url : `${API_BASE}${item.book?.image_url}`;
                                return (
                                    <tr key={item.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                                                <img src={img} alt={item.book?.title} style={{ width: 44, height: 60, objectFit: 'cover', borderRadius: 6 }} onError={e => { e.target.src = 'https://via.placeholder.com/44x60'; }} />
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{item.book?.title}</div>
                                                    <div style={{ color: '#6b7280', fontSize: '.82rem' }}>by {item.book?.author}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                                        <td>{item.quantity}</td>
                                        <td style={{ fontWeight: 700 }}>${(item.quantity * parseFloat(item.unit_price)).toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: '1.25rem 1.5rem', borderTop: '2px dashed #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '3rem' }}>
                    <span style={{ fontWeight: 700, color: '#6b7280' }}>Total Amount</span>
                    <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#e85d04' }}>${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
            </div>

            {order.notes && (
                <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 12, padding: '1rem 1.5rem', marginBottom: '2rem' }}>
                    <strong>📝 Notes:</strong> {order.notes}
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/orders" className="btn btn-outline">← All Orders</Link>
            </div>
        </div>
    );
}
