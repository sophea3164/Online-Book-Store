import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ token: searchParams.get('token') || '', new_password: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.new_password !== form.confirm) { toast.error('Passwords do not match'); return; }
        if (form.new_password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token: form.token, new_password: form.new_password });
            toast.success('Password reset successfully! Please login.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>📚 BookStore</h1>
                    <p>Set a new password</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Reset Token</label>
                        <input className="input" name="token" value={form.token} onChange={handleChange} placeholder="Paste your reset token" required />
                    </div>
                    <div className="form-group">
                        <label>New Password</label>
                        <input className="input" type="password" name="new_password" value={form.new_password} onChange={handleChange} placeholder="At least 6 characters" required />
                    </div>
                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input className="input" type="password" name="confirm" value={form.confirm} onChange={handleChange} placeholder="Repeat new password" required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280', fontSize: '.9rem' }}>
                    <Link to="/login" style={{ color: '#e85d04', fontWeight: 600 }}>← Back to Login</Link>
                </p>
            </div>
        </div>
    );
}
