import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
    });
    const [updating, setUpdating] = useState(false);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await updateProfile(form);
            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', maxWidth: '600px' }}>
            <h1 style={{ fontWeight: 800, marginBottom: '2rem' }}>👤 My Profile</h1>

            <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,.07)' }}>
                <form onSubmit={handleSubmit}>
                    <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.25rem' }}>Personal Information</h2>

                    <div className="form-group">
                        <label>Full Name *</label>
                        <input className="input" name="name" value={form.name} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input className="input" value={user?.email || ''} disabled style={{ background: '#f8f9fa', color: '#6b7280', cursor: 'not-allowed' }} />
                        <p style={{ fontSize: '.8rem', color: '#9ca3af', marginTop: '.25rem' }}>Email cannot be changed.</p>
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input className="input" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="012 345 678" />
                    </div>

                    <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', marginTop: '2rem', fontSize: '1.25rem', borderTop: '1.5px solid #e5e7eb', paddingTop: '1.5rem' }}>Default Shipping Address</h2>
                    <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '.9rem' }}>Save your address here to auto-fill at checkout.</p>

                    <div className="form-group">
                        <label>Street Address</label>
                        <input className="input" name="address" value={form.address} onChange={handleChange} placeholder="House number, Street, Village, Sangkat..." />
                    </div>

                    <div className="form-group">
                        <label>City / Province</label>
                        <input className="input" name="city" value={form.city} onChange={handleChange} placeholder="Phnom Penh, Siem Reap..." />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={updating} style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>
                        {updating ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}
