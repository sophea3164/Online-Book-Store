const crypto = require('crypto');

// KHQR (Cambodian QR Code) follows EMVCo QR Code spec
// Bakong KHQR API integration

const KHQR_BASE_URL = 'https://api-bakong.nbc.gov.kh/v1';

/**
 * Generate KHQR payment string using Bakong API
 */
async function generateKHQR({ amount, currency = 'USD', orderId, merchantName, merchantId }) {
  const axios = require('axios');

  // MOCK LOGIC FOR LOCAL TESTING
  if (!process.env.BAKONG_API_TOKEN || process.env.BAKONG_API_TOKEN === 'your_bakong_token_here') {
    return {
      success: true,
      qrString: `mock_qr_string_for_order_${orderId}_amount_${amount}`,
      md5: `mock_md5_${orderId}`,
      deeplink: `https://mock-bank.com/pay?amount=${amount}`,
    };
  }

  const payload = {
    currency: currency === 'KHR' ? 116 : 840,
    amount: parseFloat(amount),
    merchantName: merchantName || process.env.MERCHANT_NAME || 'Online Book Store',
    merchantId: merchantId || process.env.BAKONG_MERCHANT_ID,
    acquiringBank: process.env.BAKONG_ACQUIRING_BANK || '',
    externalId: `ORDER_${orderId}_${Date.now()}`,
    description: `Payment for Order #${orderId}`,
    billNumber: String(orderId),
  };

  try {
    const response = await axios.post(
      `${KHQR_BASE_URL}/generate_deeplink`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.BAKONG_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      qrString: response.data.data?.qrString,
      md5: response.data.data?.md5,
      deeplink: response.data.data?.shortLink,
    };
  } catch (err) {
    console.error('KHQR generation error:', err.response?.data || err.message);
    throw new Error('Failed to generate KHQR');
  }
}

/**
 * Check KHQR payment status via Bakong API
 */
async function checkKHQRStatus(md5Hash) {
  const axios = require('axios');

  // MOCK LOGIC FOR LOCAL TESTING
  if (!process.env.BAKONG_API_TOKEN || process.env.BAKONG_API_TOKEN === 'your_bakong_token_here') {
    // In actual production, you would check by actual md5!
    // Since we mock generate, we mock check too. Let's return success immediately for mock flow.
    return {
      responseCode: 0,
      responseMessage: 'Success',
      data: { status: 'PAID' }
    };
  }

  const response = await axios.post(
    `${KHQR_BASE_URL}/check_transaction_by_md5`,
    { md5: md5Hash },
    {
      headers: {
        'Authorization': `Bearer ${process.env.BAKONG_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

module.exports = { generateKHQR, checkKHQRStatus };