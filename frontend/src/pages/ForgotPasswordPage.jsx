import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            setToken(data.reset_token);
            toast.success('Reset token generated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Email not found');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>📚 BookStore</h1>
                    <p>Forgot your password?</p>
                </div>
                {!token ? (
                    <form onSubmit={handleSubmit}>
                        <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '.9rem' }}>Enter your email address and we'll send you a reset token.</p>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                            {loading ? 'Sending...' : 'Get Reset Token'}
                        </button>
                    </form>
                ) : (
                    <div>
                        <div style={{ background: '#d8f3dc', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                            <p style={{ color: '#2d6a4f', fontWeight: 600, marginBottom: '.5rem' }}>✅ Token generated!</p>
                            <p style={{ color: '#6b7280', fontSize: '.82rem', marginBottom: '1rem' }}>Copy your reset token:</p>
                            <code style={{ background: '#fff', padding: '.5rem 1rem', borderRadius: 8, fontSize: '.85rem', display: 'block', wordBreak: 'break-all' }}>{token}</code>
                        </div>
                        <Link to={`/reset-password?token=${token}`} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                            Reset Password →
                        </Link>
                    </div>
                )}
                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280', fontSize: '.9rem' }}>
                    <Link to="/login" style={{ color: '#e85d04', fontWeight: 600 }}>← Back to Login</Link>
                </p>
            </div>
        </div>
    );
}
