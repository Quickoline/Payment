import React, { useState, useEffect } from 'react';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import paymentService from '../../services/paymentService';
import Sidebar from '../Sidebar';
import './PageLayout.css';
import ExportCSV from '../ExportCSV';
import { FiRefreshCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('payin'); // 'payin' | 'payout'
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    payment_gateway: '',
    payment_method: '',
    start_date: '',
    end_date: '',
    search: '',
    sort_by: 'createdAt',
    sort_order: 'desc'
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters.page, filters.limit, filters.status, filters.payment_gateway, filters.payment_method, filters.start_date, filters.end_date, filters.search, filters.sort_by, filters.sort_order, activeTab]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');

    try {
      // Determine status filter based on active tab
      let statusFilter = '';
      if (activeTab === 'payin') {
        statusFilter = 'paid'; // Only show paid transactions for payin
      } else if (activeTab === 'payout') {
        statusFilter = 'pending,refunded,failed,partial_refund'; // Show payout statuses
      }

      const updatedFilters = {
        ...filters,
        status: statusFilter
      };

      const data = await paymentService.getTransactions(updatedFilters);
      setTransactions(data.transactions || []);
      setPagination(data.pagination || {});
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters(prev => ({
      ...prev,
      page: 1 // Reset to first page when changing tabs
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    if (!amount) return '₹0.00';
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'success':
        return 'status-success';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      case 'cancelled':
        return 'status-cancelled';
      case 'refunded':
        return 'status-refunded';
      case 'partial_refund':
        return 'status-partial-refund';
      case 'created':
        return 'status-created';
      case 'expired':
        return 'status-expired';
      default:
        return 'status-pending';
    }
  };
  // Format data for CSV export
  const formatForExport = () => {
    return transactions.map(txn => ({
      'Transaction ID': txn.transaction_id,
      'Order ID': txn.order_id,
      'UTR': txn.utr || 'N/A',
      'Bank Transaction ID': txn.bank_transaction_id || 'N/A',
      'Amount': `₹${txn.amount}`,
      'Status': txn.status,
      'Payment Method': txn.payment_method || 'N/A',
      'Customer Name': txn.customer_name,
      'Customer Email': txn.customer_email,
      'Customer Phone': txn.customer_phone,
      'Description': txn.description || 'N/A',
      'Gateway': txn.payment_gateway,
      'Settlement Status': txn.settlement_status || 'unsettled',
      'Created At': txn.created_at,
      'Paid At': txn.paid_at || 'Not paid'
    }));
  };
  return (
    <div className="page-container with-sidebar">
      <Sidebar />
      <main className="page-main">
        <div className="page-header">
          <h1>Transactions</h1>
          <p>View and manage all payment transactions</p>

          <div className="header-actions">
            <button onClick={fetchTransactions} disabled={loading} className="refresh-btn">
              <FiRefreshCw className={loading ? 'spinning' : ''} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            {/* ✅ Export Button */}
            <ExportCSV
              data={formatForExport()}
              filename={`transactions_${new Date().toISOString().split('T')[0]}.csv`}
              className="primary-btn"
            />
          </div>
        </div>

        <div className="page-content">
          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'payin' ? 'active' : ''}`}
              onClick={() => handleTabChange('payin')}
            >
              Payin
            </button>
            <button
              className={`tab ${activeTab === 'payout' ? 'active' : ''}`}
              onClick={() => handleTabChange('payout')}
            >
              Payout
            </button>
          </div>

          {/* Filter bar */}
          <div className="filter-bar">
            <input
              className="filter-input"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search transactions..."
            />
            <input
              className="filter-date"
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              placeholder="Start Date"
            />
            <input
              className="filter-date"
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              placeholder="End Date"
            />
            <select
              className="filter-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="created">Created</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
              <option value="partial_refund">Partial Refund</option>
            </select>
            <select
              className="filter-select"
              value={filters.payment_method}
              onChange={(e) => handleFilterChange('payment_method', e.target.value)}
            >
              <option value="">All Methods</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Net Banking</option>
              <option value="wallet">Wallet</option>
            </select>
            <select
              className="filter-select"
              value={filters.sort_by}
              onChange={(e) => handleFilterChange('sort_by', e.target.value)}
            >
              <option value="createdAt">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>
            <select
              className="filter-select"
              value={filters.sort_order}
              onChange={(e) => handleFilterChange('sort_order', e.target.value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
            <button
              className="secondary-btn"
              onClick={fetchTransactions}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Apply Filters'}
            </button>
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
                        <th>Transaction ID</th>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Payment Method</th>
                        <th>Gateway</th>
                        <th>Updated At</th>
                        <th>Paid At</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction, index) => (
                        <tr
                          key={transaction.transaction_id || index}
                          className="clickable-row"
                          onClick={() => navigate(`/admin/transactions/${transaction.transaction_id}`)}
                          style={{ cursor: 'pointer' }}
                        >                          <td className="transaction-id">{transaction.transaction_id || '-'}</td>
                          <td className="order-id">{transaction.order_id || '-'}</td>
                          <td className="customer-info">
                            <div className="customer-name">{transaction.customer_name || '-'}</div>
                            <div className="customer-email">{transaction.customer_email || '-'}</div>
                            <div className="customer-phone">{transaction.customer_phone || '-'}</div>
                          </td>
                          <td className="amount">{formatAmount(transaction.amount)}</td>
                          <td>
                            <span className={`transaction-status ${getStatusClass(transaction.status)}`}>
                              {transaction.status || 'Pending'}
                            </span>
                          </td>
                          <td className="payment-method">{transaction.payment_method || '-'}</td>
                          <td className="gateway">{transaction.payment_gateway || '-'}</td>
                          <td className="date">{formatDate(transaction.updated_at || transaction.created_at)}</td>
                          <td className="date">{formatDate(transaction.paid_at)}</td>
                          <td className="description">{transaction.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon"><HiOutlineClipboardDocumentList /></div>
                  <h3>No Transactions Found</h3>
                  <p>No transactions match your current filters.</p>
                </div>
              )}

              {/* Pagination */}
              {pagination && Object.keys(pagination).length > 0 && (
                <div className="pagination">
                  <div className="pagination-info">
                    Showing {((pagination.current_page - 1) * pagination.limit) + 1} to {Math.min(pagination.current_page * pagination.limit, pagination.total_count)} of {pagination.total_count} transactions
                  </div>
                  <div className="pagination-controls">
                    <button
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={!pagination.has_prev_page || loading}
                      className="pagination-btn"
                    >
                      Previous
                    </button>
                    <span className="pagination-page">
                      Page {pagination.current_page} of {pagination.total_pages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={!pagination.has_next_page || loading}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
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