import React, { useState, useEffect } from 'react';
import paymentService from '../../services/paymentService';
import Navbar from '../Navbar';
import './PageLayout.css';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await paymentService.getTransactions();
      setTransactions(data.transactions || data || []);
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
          <h1>📊 Transactions</h1>
          <p>View and manage all payment transactions</p>
          <button onClick={fetchTransactions} disabled={loading} className="refresh-btn">
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        <div className="page-content">
          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading transactions...</p>
            </div>
          ) : (
            <div className="transactions-container">
              {transactions.length > 0 ? (
                <div className="transactions-grid">
                  {transactions.map((transaction, index) => (
                    <div key={index} className="transaction-card">
                      <div className="transaction-header">
                        <div className="transaction-id">
                          ID: {transaction.id || transaction.orderId || `TXN-${index + 1}`}
                        </div>
                        <div className={`transaction-status status-${(transaction.status || 'pending').toLowerCase()}`}>
                          {transaction.status || 'Pending'}
                        </div>
                      </div>
                      
                      <div className="transaction-body">
                        <div className="transaction-amount">
                          ₹{transaction.amount || '0.00'}
                        </div>
                        <div className="transaction-details">
                          <div className="detail-row">
                            <span className="detail-label">Customer:</span>
                            <span className="detail-value">{transaction.customerName || 'N/A'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{transaction.customerEmail || 'N/A'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Date:</span>
                            <span className="detail-value">{transaction.createdAt || new Date().toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No Transactions Found</h3>
                  <p>No transactions have been recorded yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TransactionsPage;
