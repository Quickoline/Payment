import React, { useState, useEffect } from 'react';
import paymentService from '../../services/paymentService';
import Navbar from '../Navbar';
import './PageLayout.css';

const BalancePage = () => {
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
    <div className="page-container">
      <Navbar />
      
      <main className="page-main">
        <div className="page-header">
          <h1>💳 Payins</h1>
          <p>View your account balance and financial overview</p>
          <button onClick={fetchBalance} disabled={loading} className="refresh-btn">
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        <div className="page-content">
          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading balance information...</p>
            </div>
          ) : balance ? (
            <div className="balance-container">
              <div className="balance-cards">
                <div className="balance-card primary">
                  <div className="balance-icon">💰</div>
                  <div className="balance-amount">
                    ₹{balance.availableBalance || balance.balance || '0.00'}
                  </div>
                  <div className="balance-label">Available Balance</div>
                </div>
                
                {balance.pendingBalance && (
                  <div className="balance-card secondary">
                    <div className="balance-icon">⏳</div>
                    <div className="balance-amount">
                      ₹{balance.pendingBalance}
                    </div>
                    <div className="balance-label">Pending Balance</div>
                  </div>
                )}
                
                {balance.totalBalance && (
                  <div className="balance-card tertiary">
                    <div className="balance-icon">📊</div>
                    <div className="balance-amount">
                      ₹{balance.totalBalance}
                    </div>
                    <div className="balance-label">Total Balance</div>
                  </div>
                )}
              </div>
              
              <div className="balance-details">
                <h3>Account Information</h3>
                <div className="details-grid">
                  <div className="detail-card">
                    <div className="detail-icon">📈</div>
                    <div className="detail-content">
                      <div className="detail-label">Account Status</div>
                      <div className="detail-value">{balance.status || 'Active'}</div>
                    </div>
                  </div>
                  
                  <div className="detail-card">
                    <div className="detail-icon">🕒</div>
                    <div className="detail-content">
                      <div className="detail-label">Last Updated</div>
                      <div className="detail-value">{balance.lastUpdated || new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="detail-card">
                    <div className="detail-icon">🏦</div>
                    <div className="detail-content">
                      <div className="detail-label">Account Type</div>
                      <div className="detail-value">{balance.accountType || 'Business'}</div>
                    </div>
                  </div>
                  
                  <div className="detail-card">
                    <div className="detail-icon">🔒</div>
                    <div className="detail-content">
                      <div className="detail-label">Security Level</div>
                      <div className="detail-value">{balance.securityLevel || 'High'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">💳</div>
              <h3>Unable to Load Balance</h3>
              <p>There was an issue loading your balance information.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BalancePage;
