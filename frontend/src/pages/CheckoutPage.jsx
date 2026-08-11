import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import KHQRPaymentModal from '../components/KHQRPaymentModal';

export default function CheckoutPage() {
    const { cart, fetchCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        shipping_address: user?.address || '',
        shipping_city: user?.city || '',
        shipping_phone: user?.phone || '',
        payment_method: 'cod',
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1); // 1=form 2=confirm 3=success
    const [orderId, setOrderId] = useState(null);
    const [showKHQR, setShowKHQR] = useState(false);
    const [amountToPay, setAmountToPay] = useState(0);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleUseDefault = () => {
        setForm(f => ({
            ...f,
            shipping_address: user?.address || '',
            shipping_city: user?.city || '',
            shipping_phone: user?.phone || ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.shipping_address || !form.shipping_phone) { toast.error('Please fill in all required fields'); return; }
        setStep(2);
    };

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            const { data } = await api.post('/orders', form);
            setOrderId(data.data.id);
            setAmountToPay(cart.total);
            
            if (form.payment_method === 'online') {
                setShowKHQR(true);
            } else {
                await fetchCart();
                setStep(3);
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Order failed');
            setStep(1);
        } finally { setSubmitting(false); }
    };

    if (!cart.items.length && step !== 3) return (
        <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
            <h2>Your cart is empty</h2>
            <Link to="/books" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Books</Link>
        </div>
    );

    if (step === 3) return (
        <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ fontWeight: 800, color: '#2d6a4f', marginBottom: '.5rem' }}>Order Placed Successfully!</h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Order #{orderId} has been placed. We'll process it shortly!</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to={`/orders/${orderId}`} className="btn btn-primary btn-lg">View Invoice</Link>
                <Link to="/orders" className="btn btn-outline btn-lg">My Orders</Link>
            </div>
        </div>
    );

    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
            <h1 style={{ fontWeight: 800, marginBottom: '2rem' }}>💳 Checkout</h1>

            {/* Progress */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
                {['Shipping Info', 'Confirm Order'].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: step > i ? '#e85d04' : step === i + 1 ? '#e85d04' : '#e5e7eb', color: step >= i + 1 ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.85rem' }}>{i + 1}</div>
                        <span style={{ fontWeight: 600, color: step >= i + 1 ? '#1a1a2e' : '#9ca3af', fontSize: '.9rem' }}>{s}</span>
                        {i === 0 && <div style={{ width: 40, height: 2, background: step > 1 ? '#e85d04' : '#e5e7eb' }} />}
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
                <div>
                    {step === 1 && (
                        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,.07)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontWeight: 700, margin: 0 }}>📍 Shipping Information</h2>
                                {user?.address && (
                                    <button type="button" onClick={handleUseDefault} className="btn btn-sm btn-outline" title="Use my saved address">
                                        🔄 Use Default Address
                                    </button>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Shipping Address *</label>
                                <input className="input" name="shipping_address" value={form.shipping_address} onChange={handleChange} placeholder="House number, Street, Village, Sangkat..." required />
                            </div>
                            <div className="form-group">
                                <label>City / Province</label>
                                <input className="input" name="shipping_city" value={form.shipping_city} onChange={handleChange} placeholder="Phnom Penh, Siem Reap..." />
                            </div>
                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input className="input" type="tel" name="shipping_phone" value={form.shipping_phone} onChange={handleChange} placeholder="012 345 678" required />
                            </div>

                            <h2 style={{ fontWeight: 700, marginBottom: '1rem', marginTop: '1.5rem' }}>💰 Payment Method</h2>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {[{ val: 'cod', label: '💵 Cash on Delivery', desc: 'Pay when you receive' }, { val: 'online', label: '💳 Online Payment', desc: 'ABA, Wing, etc.' }].map(pm => (
                                    <label key={pm.val} style={{ flex: 1, border: `2px solid ${form.payment_method === pm.val ? '#e85d04' : '#e5e7eb'}`, borderRadius: 12, padding: '1rem', cursor: 'pointer', background: form.payment_method === pm.val ? '#fef3ec' : '#fff' }}>
                                        <input type="radio" name="payment_method" value={pm.val} checked={form.payment_method === pm.val} onChange={handleChange} style={{ marginRight: '.5rem' }} />
                                        <strong>{pm.label}</strong>
                                        <p style={{ color: '#6b7280', fontSize: '.82rem', marginTop: '.25rem' }}>{pm.desc}</p>
                                    </label>
                                ))}
                            </div>

                            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                <label>Notes (optional)</label>
                                <textarea className="input" name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Special instructions..." />
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: '.5rem' }}>Continue to Confirm →</button>
                        </form>
                    )}

                    {step === 2 && (
                        <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,.07)' }}>
                            <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>✅ Confirm Your Order</h2>
                            <div style={{ background: '#f8f9fa', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
                                <p><strong>📍 Address:</strong> {form.shipping_address}, {form.shipping_city}</p>
                                <p><strong>📞 Phone:</strong> {form.shipping_phone}</p>
                                <p><strong>💰 Payment:</strong> {form.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                                {form.notes && <p><strong>📝 Notes:</strong> {form.notes}</p>}
                            </div>

                            {form.payment_method === 'online' && (
                                <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
                                    <strong>💳 Online Payment Instructions:</strong>
                                    <p style={{ fontSize: '.88rem', marginTop: '.3rem', color: '#92400e' }}>Please transfer to: ABA Bank #001234567 (BookStore Ltd.) and send screenshot to 012 345 678</p>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button onClick={() => setStep(1)} className="btn btn-outline">← Back</button>
                                <button onClick={handleConfirm} className="btn btn-primary btn-lg" disabled={submitting} style={{ flex: 1, justifyContent: 'center' }}>
                                    {submitting ? 'Placing Order...' : '🎉 Place Order'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary sidebar */}
                <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,.08)', position: 'sticky', top: 80 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Order Summary</h3>
                    {cart.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', gap: '.75rem', marginBottom: '.75rem', alignItems: 'center' }}>
                            <img src={item.book.image_url?.startsWith('http') ? item.book.image_url : `http://localhost:3001${item.book.image_url}`} alt={item.book.title} style={{ width: 44, height: 60, objectFit: 'cover', borderRadius: 6 }} onError={e => { e.target.src = 'https://via.placeholder.com/44x60'; }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '.85rem', fontWeight: 600, lineHeight: 1.3 }}>{item.book.title}</div>
                                <div style={{ fontSize: '.78rem', color: '#6b7280' }}>x{item.quantity}</div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '.9rem' }}>${(item.quantity * parseFloat(item.book.price)).toFixed(2)}</div>
                        </div>
                    ))}
                    <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.15rem' }}>
                        <span>Total</span>
                        <span style={{ color: '#e85d04' }}>${cart.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            {showKHQR && (
                <KHQRPaymentModal 
                    orderId={orderId} 
                    amount={amountToPay} 
                    onSuccess={async () => {
                        setShowKHQR(false);
                        await fetchCart();
                        setStep(3);
                    }} 
                    onClose={() => {
                        setShowKHQR(false);
                        // If they cancel payment, we might want to still show order success but unpaid,
                        // or take them to the order details page. For now, let's just go to success step
                        // but maybe we shouldn't clear the cart? Actually order is already created.
                        fetchCart().then(() => setStep(3)); 
                    }} 
                />
            )}
        </div>
    );
}
