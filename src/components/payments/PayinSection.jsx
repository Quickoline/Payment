import React, { useState, useEffect } from 'react';
import { FiCreditCard, FiTrendingUp, FiDollarSign, FiPercent, FiInfo } from 'react-icons/fi';
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

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="payment-section">
      <div className="section-header">
        <div className="header-content">
          <h3><FiDollarSign /> Balance Overview</h3>
          <p className="header-subtitle">Complete revenue and commission breakdown</p>
        </div>
        <button onClick={fetchBalance} disabled={loading} className="refresh-btn">
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading balance information...</p>
        </div>
      ) : balance ? (
        <div className="balance-display">
          {/* Main Balance Cards */}
          <div className="balance-cards-grid">
            <div className="balance-card primary">
              <div className="card-icon available">
                <FiDollarSign />
              </div>
              <div className="card-content">
                <div className="balance-label">Available Balance</div>
                <div className="balance-amount">{formatCurrency(balance.availableBalance)}</div>
                <div className="balance-description">
                  Ready to withdraw
                </div>
              </div>
            </div>
            
            <div className="balance-card secondary">
              <div className="card-icon revenue">
                <FiTrendingUp />
              </div>
              <div className="card-content">
                <div className="balance-label">Total Revenue</div>
                <div className="balance-amount">{formatCurrency(balance.totalBalance)}</div>
                <div className="balance-description">
                  Gross payment received
                </div>
              </div>
            </div>

            <div className="balance-card tertiary">
              <div className="card-icon pending">
                <FiCreditCard />
              </div>
              <div className="card-content">
                <div className="balance-label">Pending Payouts</div>
                <div className="balance-amount">{formatCurrency(balance.pendingBalance)}</div>
                <div className="balance-description">
                  Awaiting processing
                </div>
              </div>
            </div>

            <div className="balance-card quaternary">
              <div className="card-icon commission">
                <FiPercent />
              </div>
              <div className="card-content">
                <div className="balance-label">Commission Deducted</div>
                <div className="balance-amount">{formatCurrency(balance.commissionDeducted)}</div>
                <div className="balance-description">
                  {balance.commissionRate || 'Gateway charges'}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="balance-breakdown">
            <h4><FiInfo /> Detailed Breakdown</h4>
            
            <div className="breakdown-grid">
              <div className="breakdown-item">
                <span className="breakdown-label">Total Revenue:</span>
                <span className="breakdown-value">{formatCurrency(balance.totalBalance)}</span>
              </div>
              
              <div className="breakdown-item">
                <span className="breakdown-label">Total Refunded:</span>
                <span className="breakdown-value negative">
                  - {formatCurrency(balance.raw?.balance?.total_refunded || 0)}
                </span>
              </div>
              
              <div className="breakdown-item highlight">
                <span className="breakdown-label">Commission Deducted:</span>
                <span className="breakdown-value negative">
                  - {formatCurrency(balance.commissionDeducted)}
                </span>
              </div>
              
              <div className="breakdown-item">
                <span className="breakdown-label">Net Revenue:</span>
                <span className="breakdown-value">{formatCurrency(balance.netRevenue)}</span>
              </div>
              
              <div className="breakdown-item">
                <span className="breakdown-label">Total Paid Out:</span>
                <span className="breakdown-value negative">
                  - {formatCurrency(balance.totalPaidOut)}
                </span>
              </div>
              
              <div className="breakdown-item">
                <span className="breakdown-label">Pending Payouts:</span>
                <span className="breakdown-value negative">
                  - {formatCurrency(balance.pendingBalance)}
                </span>
              </div>
              
              <div className="breakdown-item total">
                <span className="breakdown-label">Available Balance:</span>
                <span className="breakdown-value success">
                  {formatCurrency(balance.availableBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Commission Structure Info */}
          {balance.raw?.balance?.commission_structure && (
            <div className="commission-info">
              <h4><FiPercent /> Commission Structure</h4>
              <div className="commission-details">
                <div className="commission-item">
                  <strong>Payin:</strong> {balance.raw.balance.commission_structure.payin}
                </div>
                <div className="commission-item">
                  <strong>Minimum Charge:</strong> {balance.raw.balance.commission_structure.minimum_charge}
                </div>
                <div className="commission-item">
                  <strong>Payout (₹500-₹1000):</strong> {balance.raw.balance.commission_structure.payout_500_to_1000}
                </div>
                <div className="commission-item">
                  <strong>Payout (Above ₹1000):</strong> {balance.raw.balance.commission_structure.payout_above_1000}
                </div>
              </div>
            </div>
          )}

          {/* Transaction Summary */}
          {balance.transactionSummary && Object.keys(balance.transactionSummary).length > 0 && (
            <div className="transaction-summary">
              <h4><FiTrendingUp /> Transaction Summary</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Total Transactions:</span>
                  <span className="summary-value">
                    {balance.transactionSummary.total_transactions || 0}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Completed Payouts:</span>
                  <span className="summary-value">
                    {balance.transactionSummary.total_payouts_completed || 0}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Pending Requests:</span>
                  <span className="summary-value">
                    {balance.transactionSummary.pending_payout_requests || 0}
                  </span>
                </div>
                {balance.transactionSummary.avg_commission_per_transaction && (
                  <div className="summary-item">
                    <span className="summary-label">Avg Commission/Txn:</span>
                    <span className="summary-value">
                      {formatCurrency(balance.transactionSummary.avg_commission_per_transaction)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payout Eligibility */}
          {balance.payoutEligibility && (
            <div className="payout-eligibility">
              <h4><FiCreditCard /> Payout Information</h4>
              <div className="eligibility-grid">
                <div className="eligibility-item">
                  <span className="eligibility-label">Status:</span>
                  <span className={`eligibility-badge ${balance.payoutEligibility.can_request_payout ? 'eligible' : 'not-eligible'}`}>
                    {balance.payoutEligibility.can_request_payout ? 'Eligible for Payout' : 'Not Eligible'}
                  </span>
                </div>
                <div className="eligibility-item">
                  <span className="eligibility-label">Minimum Payout:</span>
                  <span className="eligibility-value">
                    {formatCurrency(balance.payoutEligibility.minimum_payout_amount)}
                  </span>
                </div>
                <div className="eligibility-item">
                  <span className="eligibility-label">Maximum Payout:</span>
                  <span className="eligibility-value">
                    {formatCurrency(balance.payoutEligibility.maximum_payout_amount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Merchant Info */}
          {balance.merchant && (
            <div className="merchant-info">
              <div className="info-item">
                <span className="info-label">Merchant Name:</span>
                <span className="info-value">{balance.merchant.merchantName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{balance.merchant.merchantEmail}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Updated:</span>
                <span className="info-value">{new Date().toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon"><FiCreditCard /></div>
          <p>Unable to fetch balance information</p>
          <button onClick={fetchBalance} className="retry-btn">Try Again</button>
        </div>
      )}
    </div>
  );
};

export default PayinSection;
