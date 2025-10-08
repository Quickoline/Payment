// API Constants

export const BASE_URL = 'https://api.ninex-group.com/api';
 e8a86750ce2fd74751f7819ec49f19569a5a7b98

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
  ADMIN_TRANSACTIONS: `${BASE_URL}/payments/admin/transactions`,
  ADMIN_PAYOUT: `${BASE_URL}/payments/admin/payout`,
  ADMIN_PAYOUTS: `${BASE_URL}/payments/admin/payouts`,
};

export const USER_ROLES = {
  ADMIN: 'admin',
  SUPERADMIN: 'superAdmin',
};
