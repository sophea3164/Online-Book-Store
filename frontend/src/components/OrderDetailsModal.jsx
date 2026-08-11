import React from 'react';

const statusClass = { processing: 'status-processing', shipping: 'status-shipping', completed: 'status-completed', cancelled: 'status-cancelled' };

export default function OrderDetailsModal({ order, onClose }) {
    if (!order) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 700, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,.2)' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Order Details #{order.id}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
                </div>
                <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '.5rem', color: '#374151' }}>Shipping Details</h3>
                            <p style={{ margin: 0, color: '#4b5563', fontSize: '.9rem' }}><strong>Name:</strong> {order.user?.name}</p>
                            <p style={{ margin: 0, color: '#4b5563', fontSize: '.9rem' }}><strong>Address:</strong> {order.shipping_address}</p>
                            {order.shipping_city && <p style={{ margin: 0, color: '#4b5563', fontSize: '.9rem' }}><strong>City:</strong> {order.shipping_city}</p>}
                            <p style={{ margin: 0, color: '#4b5563', fontSize: '.9rem' }}><strong>Phone:</strong> {order.shipping_phone}</p>
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '.5rem', color: '#374151' }}>Order Summary</h3>
                            <p style={{ margin: 0, color: '#4b5563', fontSize: '.9rem' }}><strong>Date:</strong> {new Date(order.createdAt || order.created_at).toLocaleString()}</p>
                            <p style={{ margin: 0, color: '#4b5563', fontSize: '.9rem' }}><strong>Status:</strong> <span className={`status-badge ${statusClass[order.status]}`}>{order.status}</span></p>
                            <p style={{ margin: 0, color: '#4b5563', fontSize: '.9rem' }}><strong>Payment:</strong> {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                            {order.notes && <p style={{ margin: 0, color: '#4b5563', fontSize: '.9rem' }}><strong>Notes:</strong> {order.notes}</p>}
                        </div>
                    </div>

                    <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', color: '#374151' }}>Purchased Items</h3>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#f9fafb', fontSize: '.85rem', color: '#6b7280' }}>
                                <tr><th style={{ padding: '.75rem 1rem' }}>Book</th><th style={{ padding: '.75rem 1rem' }}>Qty</th><th style={{ padding: '.75rem 1rem' }}>Price</th><th style={{ padding: '.75rem 1rem' }}>Subtotal</th></tr>
                            </thead>
                            <tbody>
                                {order.items?.map(item => (
                                    <tr key={item.id} style={{ borderTop: '1px solid #e5e7eb', fontSize: '.9rem' }}>
                                        <td style={{ padding: '.75rem 1rem', fontWeight: 600 }}>{item.book?.title}</td>
                                        <td style={{ padding: '.75rem 1rem' }}>x{item.quantity}</td>
                                        <td style={{ padding: '.75rem 1rem', color: '#6b7280' }}>${parseFloat(item.unit_price).toFixed(2)}</td>
                                        <td style={{ padding: '.75rem 1rem', fontWeight: 600 }}>${(item.quantity * parseFloat(item.unit_price)).toFixed(2)}</td>
                                    </tr>
                                ))}
                                {(!order.items || order.items.length === 0) && (
                                    <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>No items found for this order.</td></tr>
                                )}
                            </tbody>
                            <tfoot style={{ background: '#fef3ec' }}>
                                <tr>
                                    <td colSpan="3" style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, fontSize: '1.05rem' }}>Total Amount:</td>
                                    <td style={{ padding: '1rem', fontWeight: 800, color: '#e85d04', fontSize: '1.1rem' }}>${parseFloat(order.total_amount).toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', background: '#f9fafb', borderRadius: '0 0 16px 16px' }}>
                    <button onClick={onClose} className="btn btn-outline" style={{ background: '#fff' }}>Close</button>
                </div>
            </div>
        </div>
    );
}
