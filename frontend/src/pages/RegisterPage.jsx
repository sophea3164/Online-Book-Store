import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            const user = await register(form.name, form.email, form.phone, form.password);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>📚 BookStore</h1>
                    <p>Create your account</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name *</label>
                        <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="Dara Chan" required />
                    </div>
                    <div className="form-group">
                        <label>Email Address *</label>
                        <input className="input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input className="input" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="012 345 678" />
                    </div>
                    <div className="form-group">
                        <label>Password *</label>
                        <input className="input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" required />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password *</label>
                        <input className="input" type="password" name="confirm" value={form.confirm} onChange={handleChange} placeholder="Repeat your password" required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account →'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280', fontSize: '.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: '#e85d04', fontWeight: 600 }}>Login</Link>
                </p>
            </div>
        </div>
    );
}
