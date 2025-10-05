import React, { useState, useEffect } from 'react';
import superadminPaymentService from '../../services/superadminPaymentService';
import Navbar from '../Navbar';
import './PageLayout.css';

const SuperadminTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ merchantId: '', merchantName: '', status: '', from: '', to: '' });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await superadminPaymentService.getAdminTransactions({
        merchantId: filters.merchantId || undefined,
        merchantName: filters.merchantName || undefined,
        status: filters.status || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      });
      setTransactions(data.transactions || data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="page-container">
      <Navbar />
      
      <main className="page-main">
        <div className="page-header">
          <div>
            <h1>📊 Admin Transactions</h1>
            <p>Filter by merchant and status to audit payments</p>
          </div>
          <div className="header-actions">
            <button onClick={fetchTransactions} disabled={loading} className="refresh-btn">
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
        <div className="create-form-card">
          <form className="payment-form" onSubmit={(e) => { e.preventDefault(); fetchTransactions(); }}>
            <div className="form-row">
              <div className="form-group">
                <label>Merchant ID</label>
                <input value={filters.merchantId} onChange={(e) => handleFilterChange('merchantId', e.target.value)} placeholder="Merchant ObjectId" />
              </div>
              <div className="form-group">
                <label>Merchant Name</label>
                <input value={filters.merchantName} onChange={(e) => handleFilterChange('merchantName', e.target.value)} placeholder="Rajesh Electronics" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                  <option value="">Any</option>
                  <option value="created">Created</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="form-group">
                <label>From</label>
                <input type="date" value={filters.from} onChange={(e) => handleFilterChange('from', e.target.value)} />
              </div>
              <div className="form-group">
                <label>To</label>
                <input type="date" value={filters.to} onChange={(e) => handleFilterChange('to', e.target.value)} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="primary-btn">Apply Filters</button>
              <button type="button" className="secondary-btn" onClick={() => { setFilters({ merchantId: '', merchantName: '', status: '', from: '', to: '' }); fetchTransactions(); }}>Clear</button>
            </div>
          </form>
        </div>
        
        <div className="page-content">
          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading admin transactions...</p>
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
                            <span className="detail-label">Merchant:</span>
                            <span className="detail-value">{transaction.merchantName || transaction.businessName || 'N/A'}</span>
                          </div>
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
                          {transaction.commission && (
                            <div className="detail-row">
                              <span className="detail-label">Commission:</span>
                              <span className="detail-value">₹{transaction.commission}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No Admin Transactions Found</h3>
                  <p>No admin transactions have been recorded yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuperadminTransactionsPage;
