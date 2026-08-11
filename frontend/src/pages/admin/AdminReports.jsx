import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../../services/api';

export default function AdminReports() {
    const [tab, setTab] = useState('sales');
    const [salesData, setSalesData] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const loadSales = async () => {
        setLoading(true);
        try {
            const params = {};
            if (dateRange.start) params.start_date = dateRange.start;
            if (dateRange.end) params.end_date = dateRange.end;
            const { data } = await api.get('/admin/reports/sales', { params });
            setSalesData(data.data);
        } catch { } finally { setLoading(false); }
    };

    const loadRevenue = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/reports/revenue');
            setRevenueData(data.data.reverse());
        } catch { } finally { setLoading(false); }
    };

    const loadLowStock = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/reports/low-stock?threshold=10');
            setLowStock(data.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => {
        if (tab === 'sales') loadSales();
        else if (tab === 'revenue') loadRevenue();
        else if (tab === 'stock') loadLowStock();
    }, [tab]);

    const API_BASE = 'http://localhost:3001';

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontWeight: 800, fontSize: '1.75rem' }}>📈 Reports</h1>
                <p style={{ color: '#6b7280' }}>Business insights and analytics</p>
            </div>

            {/* Tab bar */}
            <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0' }}>
                {[['sales', '📊 Sales Report'], ['revenue', '💰 Revenue Trend'], ['stock', '⚠ Low Stock']].map(([t, l]) => (
                    <button key={t} onClick={() => setTab(t)} className="btn btn-sm"
                        style={{ borderRadius: '8px 8px 0 0', borderBottom: tab === t ? '3px solid #e85d04' : '3px solid transparent', fontWeight: 700, background: 'none', color: tab === t ? '#e85d04' : '#6b7280' }}>
                        {l}
                    </button>
                ))}
            </div>

            {loading && <div className="spinner" />}

            {/* Sales Report */}
            {!loading && tab === 'sales' && (
                <div>
                    <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '.82rem', color: '#6b7280' }}>Start Date</label>
                            <input type="date" className="input" style={{ height: 38, padding: '.4rem .75rem' }} value={dateRange.start} onChange={e => setDateRange(d => ({ ...d, start: e.target.value }))} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '.82rem', color: '#6b7280' }}>End Date</label>
                            <input type="date" className="input" style={{ height: 38, padding: '.4rem .75rem' }} value={dateRange.end} onChange={e => setDateRange(d => ({ ...d, end: e.target.value }))} />
                        </div>
                        <button onClick={loadSales} className="btn btn-primary btn-sm" style={{ height: 38 }}>Apply</button>
                    </div>

                    {salesData && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                                <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,.07)', borderLeft: '4px solid #e85d04' }}>
                                    <div style={{ color: '#6b7280', fontSize: '.82rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Total Revenue</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#e85d04', marginTop: '.25rem' }}>${salesData.total_revenue?.toFixed(2)}</div>
                                </div>
                                <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,.07)', borderLeft: '4px solid #10b981' }}>
                                    <div style={{ color: '#6b7280', fontSize: '.82rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Total Orders</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '.25rem' }}>{salesData.total_orders}</div>
                                </div>
                            </div>

                            {salesData.book_sales?.length > 0 && (
                                <>
                                    <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,.07)', marginBottom: '2rem' }}>
                                        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Top Selling Books (Revenue)</h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={salesData.book_sales.slice(0, 10)} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="title" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                                                <YAxis />
                                                <Tooltip formatter={v => `$${v.toFixed(2)}`} />
                                                <Bar dataKey="revenue" fill="#e85d04" radius={[6, 6, 0, 0]} name="Revenue ($)" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,.07)', overflow: 'hidden' }}>
                                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #e5e7eb' }}>
                                            <h3 style={{ fontWeight: 700 }}>Sales by Book</h3>
                                        </div>
                                        <div className="table-wrap">
                                            <table>
                                                <thead><tr><th>Book</th><th>Units Sold</th><th>Revenue</th></tr></thead>
                                                <tbody>
                                                    {salesData.book_sales.map(b => (
                                                        <tr key={b.book_id}>
                                                            <td style={{ fontWeight: 600 }}>{b.title}</td>
                                                            <td>{b.qty}</td>
                                                            <td style={{ fontWeight: 700, color: '#e85d04' }}>${b.revenue.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Revenue Trend */}
            {!loading && tab === 'revenue' && (
                <div>
                    <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,.07)', marginBottom: '2rem' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Monthly Revenue (Last 12 Months)</h3>
                        {revenueData.length === 0 ? <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>No revenue data yet</p> : (
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={v => `$${parseFloat(v).toFixed(2)}`} />
                                    <Line type="monotone" dataKey="revenue" stroke="#e85d04" strokeWidth={3} dot={{ fill: '#e85d04', r: 5 }} name="Revenue ($)" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {revenueData.length > 0 && (
                        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,.07)', overflow: 'hidden' }}>
                            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #e5e7eb' }}><h3 style={{ fontWeight: 700 }}>Monthly Breakdown</h3></div>
                            <div className="table-wrap">
                                <table>
                                    <thead><tr><th>Month</th><th>Orders</th><th>Revenue</th></tr></thead>
                                    <tbody>
                                        {revenueData.map(r => (
                                            <tr key={r.month}>
                                                <td style={{ fontWeight: 600 }}>{r.month}</td>
                                                <td>{r.order_count}</td>
                                                <td style={{ fontWeight: 700, color: '#e85d04' }}>${parseFloat(r.revenue).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Low Stock */}
            {!loading && tab === 'stock' && (
                <div>
                    <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 12, padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
                        <strong>⚠ Low Stock Alert:</strong> The following books have 10 or fewer copies remaining.
                    </div>

                    {lowStock.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                            <h3>All books are well-stocked!</h3>
                        </div>
                    ) : (
                        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,.07)', overflow: 'hidden' }}>
                            <div className="table-wrap">
                                <table>
                                    <thead><tr><th>Book</th><th>Category</th><th>Price</th><th>Stock Left</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {lowStock.map(book => {
                                            const img = book.image_url?.startsWith('http') ? book.image_url : `${API_BASE}${book.image_url}`;
                                            return (
                                                <tr key={book.id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                                                            <img src={img} alt={book.title} style={{ width: 36, height: 50, objectFit: 'cover', borderRadius: 4 }} onError={e => { e.target.src = 'https://via.placeholder.com/36x50'; }} />
                                                            <div>
                                                                <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{book.title}</div>
                                                                <div style={{ color: '#6b7280', fontSize: '.78rem' }}>{book.author}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><span className="badge badge-primary">{book.category?.name || '—'}</span></td>
                                                    <td style={{ fontWeight: 700, color: '#e85d04' }}>${parseFloat(book.price).toFixed(2)}</td>
                                                    <td>
                                                        <span className={`badge ${book.stock === 0 ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '1rem', fontWeight: 800 }}>
                                                            {book.stock}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${book.stock === 0 ? 'status-cancelled' : 'status-shipping'}`}>
                                                            {book.stock === 0 ? '❌ Out of Stock' : '⚠ Low Stock'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
