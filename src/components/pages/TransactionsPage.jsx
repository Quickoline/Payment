import React, { useState, useEffect } from 'react';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import paymentService from '../../services/paymentService';
import Sidebar from '../Sidebar';
import './PageLayout.css';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('payin'); // 'payin' | 'payout'
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('all');
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
    <div className="page-container with-sidebar">
      <Sidebar />
      <main className="page-main">
        <div className="page-header">
          <h1>Transactions</h1>
          <p>View and manage all payment transactions</p>
          <button onClick={fetchTransactions} disabled={loading} className="refresh-btn">
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        <div className="page-content">
          {/* Tabs */}
          <div className="tabs">
            <button className={`tab ${activeTab === 'payin' ? 'active' : ''}`} onClick={() => setActiveTab('payin')}>Payin</button>
            <button className={`tab ${activeTab === 'payout' ? 'active' : ''}`} onClick={() => setActiveTab('payout')}>Payout</button>
          </div>

          {/* Filter bar */}
          <div className="filter-bar">
            <input className="filter-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." />
            <input className="filter-date" type="datetime-local" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <input className="filter-date" type="datetime-local" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <button className="secondary-btn" onClick={fetchTransactions} disabled={loading}>{loading ? 'Loading...' : 'Export'}</button>
          </div>
          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading transactions...</p>
            </div>
          ) : (
            <div className="transactions-container">
              {transactions.length > 0 ? (
                <div className="table-card">
                  <table className="tx-table">
                    <thead>
                      <tr>
                        <th>Transaction Time</th>
                        <th>ID</th>
                        <th>Transaction Ref ID</th>
                        <th>Status</th>
                        <th>Status Description</th>
                        <th>RRN</th>
                        <th>Name</th>
                        <th>Payer Name</th>
                        <th>Payer ID</th>
                        <th>Amount</th>
                        <th>Charge</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t, i) => (
                        <tr key={i}>
                          <td>{t.createdAt || new Date().toLocaleString()}</td>
                          <td>{t.id || t.orderId || `TXN-${i + 1}`}</td>
                          <td>{t.referenceId || '-'}</td>
                          <td><span className={`transaction-status status-${(t.status || 'pending').toLowerCase()}`}>{t.status || 'Pending'}</span></td>
                          <td>{t.statusDescription || '-'}</td>
                          <td>{t.rrn || '-'}</td>
                          <td>{t.customerName || '-'}</td>
                          <td>{t.payerName || '-'}</td>
                          <td>{t.payerId || '-'}</td>
                          <td>₹{t.amount || '0.00'}</td>
                          <td>{t.charge || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon"><HiOutlineClipboardDocumentList /></div>
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
