import React, { useState, useEffect } from 'react';
import { 
  FiRefreshCw, 
  FiX,
  FiCheck,
  FiClock,
  FiAlertCircle,
  FiInfo,
  FiDollarSign,
  FiDownload,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiSend
} from 'react-icons/fi';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';
import paymentService from '../../services/paymentService';
import Sidebar from '../../components/Sidebar';
import ExportCSV from '../../components/ExportCSV';
import Toast from '../../components/ui/Toast';
// import './PayoutsManagement.css';

const PayoutsManagement = () => {
  const [payouts, setPayouts] = useState([]);
  const [payoutsSummary, setPayoutsSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'approve', 'reject', 'process', 'view'
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 20
  });

  // Form states for actions
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [processUtr, setProcessUtr] = useState('');
  const [processNotes, setProcessNotes] = useState('');

  useEffect(() => {
    fetchPayouts();
  }, [filters]);

  const fetchPayouts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await paymentService.getAllPayouts(filters);
      console.log('All payouts data:', data);
      setPayouts(data.payouts || []);
      setPayoutsSummary(data.summary || null);
    } catch (error) {
      setError(error.message);
      setToast({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatForExport = () => {
    if (!payouts || payouts.length === 0) {
      return [];
    }
    
    return payouts.map(payout => ({
      'Payout ID': payout.payoutId || 'N/A',
      'Merchant Name': payout.merchantName || 'N/A',
      'Merchant ID': payout.merchantId?._id || payout.merchantId || 'N/A',
      'Amount': payout.amount ? `₹${payout.amount}` : 'N/A',
      'Commission': payout.commission ? `₹${payout.commission}` : 'N/A',
      'Net Amount': payout.netAmount ? `₹${payout.netAmount}` : 'N/A',
      'Status': payout.status || 'N/A',
      'Transfer Mode': payout.transferMode === 'bank_transfer' ? 'Bank Transfer' : 'UPI',
      'Requested By': payout.requestedByName || 'N/A',
      'Requested At': formatDate(payout.requestedAt),
      'Approved By': payout.approvedByName || 'N/A',
      'Approved At': payout.approvedAt ? formatDate(payout.approvedAt) : 'N/A',
      'Completed At': payout.completedAt ? formatDate(payout.completedAt) : 'N/A',
      'UTR': payout.utr || 'N/A',
      'Notes': payout.adminNotes || 'N/A'
    }));
  };

  const handleApprovePayout = async () => {
    setActionLoading(true);
    try {
      await paymentService.approvePayout(selectedPayout.payoutId, approveNotes);
      setToast({ message: 'Payout approved successfully!', type: 'success' });
      setShowModal(false);
      setApproveNotes('');
      fetchPayouts();
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayout = async () => {
    if (!rejectReason.trim()) {
      setToast({ message: 'Rejection reason is required', type: 'error' });
      return;
    }

    setActionLoading(true);
    try {
      await paymentService.rejectPayout(selectedPayout.payoutId, rejectReason);
      setToast({ message: 'Payout rejected successfully', type: 'success' });
      setShowModal(false);
      setRejectReason('');
      fetchPayouts();
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcessPayout = async () => {
    if (!processUtr.trim()) {
      setToast({ message: 'UTR/Transaction reference is required', type: 'error' });
      return;
    }

    setActionLoading(true);
    try {
      await paymentService.processPayout(selectedPayout.payoutId, processUtr, processNotes);
      setToast({ message: 'Payout processed successfully!', type: 'success' });
      setShowModal(false);
      setProcessUtr('');
      setProcessNotes('');
      fetchPayouts();
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (type, payout) => {
    setModalType(type);
    setSelectedPayout(payout);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedPayout(null);
    setApproveNotes('');
    setRejectReason('');
    setProcessUtr('');
    setProcessNotes('');
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return <FiCheckCircle className="status-icon success" />;
      case 'failed':
      case 'cancelled':
      case 'rejected':
        return <FiXCircle className="status-icon error" />;
      case 'requested':
        return <FiAlertCircle className="status-icon warning" />;
      case 'pending':
      case 'processing':
        return <FiClock className="status-icon info" />;
      default:
        return <FiAlertCircle className="status-icon" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'badge-success';
      case 'failed':
      case 'cancelled':
      case 'rejected':
        return 'badge-error';
      case 'requested':
        return 'badge-warning';
      case 'pending':
      case 'processing':
        return 'badge-info';
      default:
        return 'badge-default';
    }
  };

  return (
    <div className="page-container with-sidebar">
      <Sidebar />
      <main className="page-main">
        <div className="page-header">
          <div>
            <h1><RiMoneyDollarCircleLine /> Payout Management</h1>
            <p>Approve, reject, and process merchant payout requests</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={fetchPayouts} 
              disabled={loading} 
              className="refresh-btn"
            >
              <FiRefreshCw className={loading ? 'spinning' : ''} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            
            {payouts.length > 0 && (
              <ExportCSV 
                data={formatForExport()} 
                filename={`all_payouts_${new Date().toISOString().split('T')[0]}.csv`}
                className="export-btn"
              />
            )}
          </div>
        </div>
        
        <div className="page-content">
          {error && (
            <div className="error-message">
              <FiAlertCircle /> {error}
            </div>
          )}

          {/* Summary Cards */}
          {payoutsSummary && (
            <div className="payout-summary-section">
              <h3><FiDollarSign /> Summary Statistics</h3>
              <div className="summary-cards-grid">
                <div className="summary-stat-card">
                  <div className="stat-icon"><RiMoneyDollarCircleLine /></div>
                  <div className="stat-content">
                    <div className="stat-value">{payoutsSummary.total_payout_requests || 0}</div>
                    <div className="stat-label">Total Requests</div>
                  </div>
                </div>

                <div className="summary-stat-card warning">
                  <div className="stat-icon"><FiClock /></div>
                  <div className="stat-content">
                    <div className="stat-value">{payoutsSummary.requested_payouts || 0}</div>
                    <div className="stat-label">Pending Approval</div>
                    <div className="stat-amount">{formatCurrency(payoutsSummary.total_pending)}</div>
                  </div>
                </div>

                <div className="summary-stat-card success">
                  <div className="stat-icon"><FiCheck /></div>
                  <div className="stat-content">
                    <div className="stat-value">{payoutsSummary.completed_payouts || 0}</div>
                    <div className="stat-label">Completed</div>
                    <div className="stat-amount">{formatCurrency(payoutsSummary.total_completed)}</div>
                  </div>
                </div>

                <div className="summary-stat-card error">
                  <div className="stat-icon"><FiXCircle /></div>
                  <div className="stat-content">
                    <div className="stat-value">{(payoutsSummary.rejected_payouts || 0) + (payoutsSummary.failed_payouts || 0)}</div>
                    <div className="stat-label">Rejected/Failed</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="filter-bar">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="requested">Requested</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payouts Table */}
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading payout requests...</p>
            </div>
          ) : payouts.length > 0 ? (
            <div className="table-container">
              <table className="payouts-table">
                <thead>
                  <tr>
                    <th>Payout ID</th>
                    <th>Merchant</th>
                    <th>Amount</th>
                    <th>Net Amount</th>
                    <th>Transfer Mode</th>
                    <th>Status</th>
                    <th>Requested</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.payoutId}>
                      <td>
                        <div className="payout-id-cell">
                          {payout.payoutId}
                        </div>
                      </td>
                      <td>
                        <div className="merchant-cell">
                          <div className="merchant-name">{payout.merchantName}</div>
                          <div className="merchant-email">{payout.requestedByName}</div>
                        </div>
                      </td>
                      <td>
                        <strong>{formatCurrency(payout.amount)}</strong>
                      </td>
                      <td>
                        <span className="net-amount">{formatCurrency(payout.netAmount)}</span>
                      </td>
                      <td>
                        <span className="transfer-mode-badge">
                          {payout.transferMode === 'bank_transfer' ? 'Bank' : 'UPI'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(payout.status)}`}>
                          {getStatusIcon(payout.status)}
                          {payout.status}
                        </span>
                      </td>
                      <td>
                        <div className="date-cell">
                          {formatDate(payout.requestedAt)}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => openModal('view', payout)}
                            className="action-btn view-btn"
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                          
                          {payout.status === 'requested' && (
                            <>
                              <button
                                onClick={() => openModal('approve', payout)}
                                className="action-btn approve-btn"
                                title="Approve"
                              >
                                <FiCheck />
                              </button>
                              <button
                                onClick={() => openModal('reject', payout)}
                                className="action-btn reject-btn"
                                title="Reject"
                              >
                                <FiX />
                              </button>
                            </>
                          )}
                          
                          {(payout.status === 'pending' || payout.status === 'processing') && (
                            <button
                              onClick={() => openModal('process', payout)}
                              className="action-btn process-btn"
                              title="Process & Complete"
                            >
                              <FiSend />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <RiMoneyDollarCircleLine className="empty-icon" />
              <h3>No Payout Requests</h3>
              <p>There are no payout requests at the moment.</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal for Actions */}
      {showModal && selectedPayout && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType === 'view' && 'Payout Details'}
                {modalType === 'approve' && 'Approve Payout'}
                {modalType === 'reject' && 'Reject Payout'}
                {modalType === 'process' && 'Process Payout'}
              </h3>
              <button onClick={closeModal} className="modal-close-btn">
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              {/* View Details */}
              {modalType === 'view' && (
                <div className="payout-details">
                  <div className="detail-row">
                    <span className="detail-label">Payout ID:</span>
                    <span className="detail-value">{selectedPayout.payoutId}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Merchant:</span>
                    <span className="detail-value">{selectedPayout.merchantName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value">{formatCurrency(selectedPayout.amount)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Commission:</span>
                    <span className="detail-value">{formatCurrency(selectedPayout.commission)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Net Amount:</span>
                    <span className="detail-value strong">{formatCurrency(selectedPayout.netAmount)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Transfer Mode:</span>
                    <span className="detail-value">
                      {selectedPayout.transferMode === 'bank_transfer' ? 'Bank Transfer' : 'UPI'}
                    </span>
                  </div>
                  {selectedPayout.beneficiaryDetails?.upiId && (
                    <div className="detail-row">
                      <span className="detail-label">UPI ID:</span>
                      <span className="detail-value">{selectedPayout.beneficiaryDetails.upiId}</span>
                    </div>
                  )}
                  {selectedPayout.beneficiaryDetails?.accountNumber && (
                    <>
                      <div className="detail-row">
                        <span className="detail-label">Account Number:</span>
                        <span className="detail-value">{selectedPayout.beneficiaryDetails.accountNumber}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">IFSC Code:</span>
                        <span className="detail-value">{selectedPayout.beneficiaryDetails.ifscCode}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Account Holder:</span>
                        <span className="detail-value">{selectedPayout.beneficiaryDetails.accountHolderName}</span>
                      </div>
                    </>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${getStatusBadgeClass(selectedPayout.status)}`}>
                      {selectedPayout.status}
                    </span>
                  </div>
                  {selectedPayout.utr && (
                    <div className="detail-row">
                      <span className="detail-label">UTR:</span>
                      <span className="detail-value">{selectedPayout.utr}</span>
                    </div>
                  )}
                  {selectedPayout.adminNotes && (
                    <div className="detail-row">
                      <span className="detail-label">Merchant Notes:</span>
                      <span className="detail-value">{selectedPayout.adminNotes}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Approve Form */}
              {modalType === 'approve' && (
                <div className="action-form">
                  <p>Are you sure you want to approve this payout request?</p>
                  <div className="payout-summary">
                    <div>Merchant: <strong>{selectedPayout.merchantName}</strong></div>
                    <div>Amount: <strong>{formatCurrency(selectedPayout.netAmount)}</strong></div>
                  </div>
                  <div className="form-group">
                    <label>Notes (Optional)</label>
                    <textarea
                      value={approveNotes}
                      onChange={(e) => setApproveNotes(e.target.value)}
                      placeholder="Add any notes for this approval..."
                      rows="3"
                    />
                  </div>
                </div>
              )}

              {/* Reject Form */}
              {modalType === 'reject' && (
                <div className="action-form">
                  <p>Please provide a reason for rejecting this payout:</p>
                  <div className="form-group">
                    <label>Rejection Reason *</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      rows="4"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Process Form */}
              {modalType === 'process' && (
                <div className="action-form">
                  <p>Mark this payout as completed by providing transaction details:</p>
                  <div className="payout-summary">
                    <div>Merchant: <strong>{selectedPayout.merchantName}</strong></div>
                    <div>Net Amount: <strong>{formatCurrency(selectedPayout.netAmount)}</strong></div>
                  </div>
                  <div className="form-group">
                    <label>UTR / Transaction Reference *</label>
                    <input
                      type="text"
                      value={processUtr}
                      onChange={(e) => setProcessUtr(e.target.value)}
                      placeholder="Enter UTR or transaction reference"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Notes (Optional)</label>
                    <textarea
                      value={processNotes}
                      onChange={(e) => setProcessNotes(e.target.value)}
                      placeholder="Add any additional notes..."
                      rows="3"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={closeModal} className="secondary-btn">
                Cancel
              </button>
              
              {modalType === 'approve' && (
                <button 
                  onClick={handleApprovePayout}
                  disabled={actionLoading}
                  className="primary-btn approve-btn"
                >
                  {actionLoading ? 'Approving...' : 'Approve Payout'}
                </button>
              )}
              
              {modalType === 'reject' && (
                <button 
                  onClick={handleRejectPayout}
                  disabled={actionLoading || !rejectReason.trim()}
                  className="primary-btn reject-btn"
                >
                  {actionLoading ? 'Rejecting...' : 'Reject Payout'}
                </button>
              )}
              
              {modalType === 'process' && (
                <button 
                  onClick={handleProcessPayout}
                  disabled={actionLoading || !processUtr.trim()}
                  className="primary-btn process-btn"
                >
                  {actionLoading ? 'Processing...' : 'Complete Payout'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Toast 
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default PayoutsManagement;
