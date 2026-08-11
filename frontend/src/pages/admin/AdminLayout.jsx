import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { to: '/admin', label: '📊 Dashboard', end: true },
    { to: '/admin/categories', label: '🗂️ Categories' },
    { to: '/admin/books', label: '📚 Books' },
    { to: '/admin/users', label: '👥 Users' },
    { to: '/admin/orders', label: '📦 Orders' },
    { to: '/admin/reports', label: '📈 Reports' },
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="logo">📚 BookStore Admin</div>
                <div style={{ padding: '.75rem 0', borderBottom: '1px solid rgba(255,255,255,.1)', margin: '0 1.5rem' }}>
                    <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Logged in as</p>
                    <p style={{ color: '#f4a261', fontWeight: 700, fontSize: '.9rem' }}>{user?.name}</p>
                </div>
                <nav style={{ marginTop: '.5rem' }}>
                    {navItems.map(item => (
                        <NavLink key={item.to} to={item.to} end={item.end}
                            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div style={{ position: 'absolute', bottom: '1.5rem', left: 0, right: 0, padding: '0 1.5rem' }}>
                    <button onClick={handleLogout} className="btn btn-sm" style={{ width: '100%', background: 'rgba(255,255,255,.1)', color: '#fff', justifyContent: 'center' }}>
                        🚪 Logout
                    </button>
                </div>
            </aside>
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
}
