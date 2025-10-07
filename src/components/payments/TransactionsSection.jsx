import React, { useState, useEffect } from 'react';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import paymentService from '../../services/paymentService';
import './PaymentSection.css';

const TransactionsSection = () => {
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
    <div className="payment-section">
      <div className="section-header">
      <h3>Transactions</h3>
        <button onClick={fetchTransactions} disabled={loading} className="refresh-btn">
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-state">Loading transactions...</div>
      ) : (
        <div className="transactions-list">
          {transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <div key={index} className="transaction-item">
                <div className="transaction-info">
                  <div className="transaction-id">ID: {transaction.id || transaction.orderId || `TXN-${index + 1}`}</div>
                  <div className="transaction-amount">₹{transaction.amount || '0.00'}</div>
                  <div className="transaction-status">{transaction.status || 'Pending'}</div>
                </div>
                <div className="transaction-details">
                  <div className="customer-name">{transaction.customerName || 'N/A'}</div>
                  <div className="transaction-date">{transaction.createdAt || new Date().toLocaleDateString()}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
          <div className="empty-icon"><HiOutlineClipboardDocumentList /></div>
              <p>No transactions found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionsSection;
