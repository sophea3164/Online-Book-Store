import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import OrderDetailsModal from '../../components/OrderDetailsModal';

const statusClass = { processing: 'status-processing', shipping: 'status-shipping', completed: 'status-completed', cancelled: 'status-cancelled' };
const statusOptions = ['processing', 'completed'];

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ pages: 1, total: 0 });
    const [selectedOrder, setSelectedOrder] = useState(null);

    const load = async (p = 1) => {
        setLoading(true);
        try {
            const params = { limit: 15, page: p };
            if (filter) params.status = filter;
            const { data } = await api.get('/admin/orders', { params });
            setOrders(data.data);
            setPagination(data.pagination);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { load(page); }, [page, filter]);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/admin/orders/${id}/status`, { status });
            toast.success('Order status updated');
            load(page);
        } catch { toast.error('Update failed'); }
    };

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontWeight: 800, fontSize: '1.75rem' }}>📦 Order Management</h1>
                <p style={{ color: '#6b7280' }}>{pagination.total} total orders</p>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                {['', 'processing', 'completed'].map(s => (
                    <button key={s} onClick={() => { setFilter(s); setPage(1); }} className="btn btn-sm"
                        style={filter === s ? { background: '#e85d04', color: '#fff' } : { background: '#f1f5f9', color: '#334155' }}>
                        {s === '' ? 'All Orders' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? <div className="spinner" /> : (
                <>
                    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,.07)', overflow: 'hidden' }}>
                        <div className="table-wrap">
                            <table>
                                <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id}>
                                            <td><strong>#{order.id}</strong></td>
                                            <td>
                                                <div style={{ fontWeight: 600, fontSize: '.88rem' }}>{order.user?.name}</div>
                                                <div style={{ color: '#9ca3af', fontSize: '.75rem' }}>{order.user?.email}</div>
                                                <div style={{ color: '#9ca3af', fontSize: '.75rem' }}>📞 {order.shipping_phone}</div>
                                            </td>
                                            <td style={{ fontSize: '.82rem', color: '#6b7280' }}>
                                                {order.items?.slice(0, 2).map(i => <div key={i.id}>{i.book?.title} x{i.quantity}</div>)}
                                                {order.items?.length > 2 && <div>+{order.items.length - 2} more</div>}
                                            </td>
                                            <td style={{ fontWeight: 700, color: '#e85d04' }}>${parseFloat(order.total_amount).toFixed(2)}</td>
                                            <td><span className="badge badge-primary">{order.payment_method === 'cod' ? 'COD' : 'Online'}</span></td>
                                            <td><span className={`status-badge ${statusClass[order.status]}`}>{order.status}</span></td>
                                            <td style={{ color: '#9ca3af', fontSize: '.8rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                                                    <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                                                        style={{ padding: '.35rem .65rem', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: '.82rem', cursor: 'pointer', background: '#fff' }}>
                                                        {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                                    </select>
                                                    <button onClick={() => setSelectedOrder(order)} className="btn btn-sm btn-outline">View</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {pagination.pages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', marginTop: '1.5rem' }}>
                            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPage(p)} className="btn btn-sm" style={p === page ? { background: '#e85d04', color: '#fff' } : { background: '#f1f5f9', color: '#334155' }}>{p}</button>
                            ))}
                        </div>
                    )}
                </>
            )}
            {/* Order Details Modal */}
            <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        </div>
    );
}
