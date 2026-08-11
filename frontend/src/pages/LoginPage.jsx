import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(form.email, form.password);
            toast.success(`Welcome back, ${user.name}!`);
            navigate(user.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>📚 BookStore</h1>
                    <p>Sign in to your account</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input className="input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input className="input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
                    </div>
                    <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                        <Link to="/forgot-password" style={{ color: '#e85d04', fontSize: '.88rem' }}>Forgot password?</Link>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In →'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280', fontSize: '.9rem' }}>
                    Don't have account? <Link to="/register" style={{ color: '#e85d04', fontWeight: 600 }}>Register</Link>
                </p>
                <div style={{ marginTop: '1.5rem', background: '#f8f9fa', borderRadius: 10, padding: '.75rem 1rem', fontSize: '.82rem', color: '#6b7280' }}>
                    <strong>Demo accounts:</strong><br />
                    Admin: admin@bookstore.com / admin123<br />
                    Customer: customer@bookstore.com / password123
                </div>
            </div>
        </div>
    );
}
