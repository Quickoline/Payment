import React, { useState, useEffect } from 'react';
import paymentService from '../../services/paymentService';
import './PaymentSection.css';

const PayinSection = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await paymentService.getBalance();
      setBalance(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-section">
      <div className="section-header">
        <h3>💳 Balance</h3>
        <button onClick={fetchBalance} disabled={loading} className="refresh-btn">
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-state">Loading balance...</div>
      ) : balance ? (
        <div className="balance-display">
          <div className="balance-card">
            <div className="balance-amount">
              ₹{balance.availableBalance || balance.balance || '0.00'}
            </div>
            <div className="balance-label">Available Balance</div>
          </div>
          
          {balance.pendingBalance && (
            <div className="balance-card secondary">
              <div className="balance-amount">
                ₹{balance.pendingBalance}
              </div>
              <div className="balance-label">Pending Balance</div>
            </div>
          )}
          
          {balance.totalBalance && (
            <div className="balance-card secondary">
              <div className="balance-amount">
                ₹{balance.totalBalance}
              </div>
              <div className="balance-label">Total Balance</div>
            </div>
          )}
          
          <div className="balance-details">
            <div className="detail-item">
              <span className="detail-label">Account Status:</span>
              <span className="detail-value">{balance.status || 'Active'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Last Updated:</span>
              <span className="detail-value">{balance.lastUpdated || new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">💳</div>
          <p>Unable to fetch balance information</p>
        </div>
      )}
    </div>
  );
};

export default PayinSection;
