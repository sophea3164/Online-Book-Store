import { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import api from '../services/api';

export default function KHQRPaymentModal({ orderId, amount, onSuccess, onClose }) {
  const [qrData, setQrData] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | waiting | paid | failed
  const pollRef = useRef(null);

  useEffect(() => {
    api.post('/payments/khqr/generate', { orderId })
      .then(res => {
        setQrData(res.data);
        setStatus('waiting');
        startPolling(res.data.md5);
      })
      .catch(() => setStatus('failed'));

    return () => clearInterval(pollRef.current);
  }, [orderId]);

  const startPolling = (md5) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.post('/payments/khqr/status', { md5, orderId });
        if (res.data.paid) {
          clearInterval(pollRef.current);
          setStatus('paid');
          setTimeout(onSuccess, 1500);
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000); // Poll every 3 seconds
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-4">
          <img src="/khqr-logo.png" alt="KHQR" className="h-10 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-gray-800">Pay with KHQR</h2>
          <p className="text-gray-500 text-sm">Scan with your banking app</p>
        </div>

        {status === 'loading' && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          </div>
        )}

        {status === 'waiting' && qrData && (
          <>
            <div className="bg-gray-50 rounded-xl p-4 flex justify-center mb-4">
              <QRCode value={qrData.qrString} size={200} />
            </div>
            <p className="text-center text-lg font-bold text-blue-600 mb-1">
              ${parseFloat(amount).toFixed(2)} USD
            </p>
            <p className="text-center text-xs text-gray-400 mb-4">Waiting for payment...</p>
            {qrData.deeplink && (
              <a
                href={qrData.deeplink}
                className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg text-sm mb-3"
              >
                Open in Banking App
              </a>
            )}
          </>
        )}

        {status === 'paid' && (
          <div className="text-center py-8">
            <div className="text-6xl mb-3">✅</div>
            <p className="text-green-600 font-bold text-xl">Payment Successful!</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">❌</div>
            <p className="text-red-500">Failed to generate QR. Please try again.</p>
          </div>
        )}

        <button onClick={onClose} className="w-full mt-2 text-gray-400 text-sm hover:text-gray-600">
          Cancel
        </button>
      </div>
    </div>
  );
}