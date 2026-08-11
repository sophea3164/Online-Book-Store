import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ pages: 1, total: 0 });

    const load = async (p = 1) => {
        setLoading(true);
        try {
            const params = { limit: 15, page: p };
            if (search) params.search = search;
            const { data } = await api.get('/admin/users', { params });
            setUsers(data.data);
            setPagination(data.pagination);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { load(page); }, [page, search]);

    const toggleStatus = async (user) => {
        try {
            await api.put(`/admin/users/${user.id}/status`);
            toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
            load(page);
        } catch { toast.error('Failed to update status'); }
    };

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontWeight: 800, fontSize: '1.75rem' }}>👥 User Management</h1>
                <p style={{ color: '#6b7280' }}>{pagination.total} total users</p>
            </div>

            <div style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                <input className="input" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>

            {loading ? <div className="spinner" /> : (
                <>
                    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,.07)', overflow: 'hidden' }}>
                        <div className="table-wrap">
                            <table>
                                <thead><tr><th>User</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#e85d04,#f4a261)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                                                        <div style={{ color: '#6b7280', fontSize: '.78rem' }}>{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ color: '#6b7280', fontSize: '.88rem' }}>{u.phone || '—'}</td>
                                            <td><span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>{u.role}</span></td>
                                            <td>
                                                <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                    {u.is_active ? '✅ Active' : '❌ Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ color: '#9ca3af', fontSize: '.82rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                            <td>
                                                {u.role !== 'admin' && (
                                                    <button onClick={() => toggleStatus(u)} className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-outline'}`}>
                                                        {u.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                )}
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
        </div>
    );
}
