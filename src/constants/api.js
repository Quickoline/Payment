// API Constants

export const BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  LOGIN: `${BASE_URL}/auth/login`,
  SIGNUP: `${BASE_URL}/auth/signup`,
  CREATE_API_KEY: `${BASE_URL}/create`,
  GET_API_KEY: `${BASE_URL}/get`,
  
  // Payment Endpoints
  TRANSACTIONS: `${BASE_URL}/payments/transactions`,
  PAYOUTS: `${BASE_URL}/payments/merchant/payouts`,
  BALANCE: `${BASE_URL}/payments/merchant/balance`,
  CREATE_LINK: `${BASE_URL}/razorpay/create-payment-link`,
  PAYMENT_STATUS: (orderId) => `${BASE_URL}/payments/status/${orderId}`,
  REFUND: (orderId) => `${BASE_URL}/payments/refund/${orderId}`,
  PAYOUT_REQUEST: `${BASE_URL}/payments/merchant/payout/request`,
  
  // Superadmin Payment Endpoints
  // Admin endpoints
  PAYOUTS: `${BASE_URL}/payments/merchant/payouts`,
  PAYOUT_REQUEST: `${BASE_URL}/payments/merchant/payout/request`,
  BALANCE: `${BASE_URL}/payments/merchant/balance`,
  PAYOUT_CANCEL: (payoutId) => `${BASE_URL}/payments/merchant/payout/${payoutId}/cancel`,
  
  // ✅ SuperAdmin endpoints
  ADMIN_PAYOUTS_ALL: `${BASE_URL}/payments/admin/payouts/all`,
  ADMIN_TRANSACTIONS: `${BASE_URL}/payments/admin/transactions`,
  ADMIN_PAYOUT_APPROVE: (payoutId) => `${BASE_URL}/payments/admin/payout/${payoutId}/approve`,
  ADMIN_PAYOUT_REJECT: (payoutId) => `${BASE_URL}/payments/admin/payout/${payoutId}/reject`,
  ADMIN_PAYOUT_PROCESS: (payoutId) => `${BASE_URL}/payments/admin/payout/${payoutId}/process`,

  // Webhook Endpoints
  WEBHOOK_CONFIGURE: `${BASE_URL}/payments/merchant/webhook/configure`,
  WEBHOOK_CONFIG: `${BASE_URL}/payments/merchant/webhook/config`,
  WEBHOOK_TEST: `${BASE_URL}/payments/merchant/webhook/test`,
  WEBHOOK_DELETE: `${BASE_URL}/payments/merchant/webhook`,
};

export const USER_ROLES = {
  ADMIN: 'admin',
  SUPERADMIN: 'superAdmin',
};
