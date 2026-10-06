import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

function Claims() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [agreements, setAgreements] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [adminAgreementId, setAdminAgreementId] = useState('');
  const [reports, setReports] = useState([]);
  const [aiReportId, setAiReportId] = useState('');
  const [description, setDescription] = useState('');
  const [claimedAmount, setClaimedAmount] = useState('');
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState('');
  const [deciding, setDeciding] = useState(false);

  const currentId = isAdmin ? adminAgreementId.trim() : selectedId;

  useEffect(() => {
    if (isAdmin) return;
    const loadAgreements = async () => {
      try {
        const response = await axiosClient.get('/agreements/mine');
        setAgreements(response.data.filter((a) => a.status === 'active'));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load agreements');
      }
    };
    loadAgreements();
  }, [isAdmin]);

  const fetchClaims = async (id) => {
    if (!id) return;
    setError('');
    try {
      const response = await axiosClient.get(`/claims/agreement/${id}`);
      setClaims(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load claims');
    }
  };

  const fetchReports = async (id) => {
    try {
      const response = await axiosClient.get(`/ai-reports/agreement/${id}`);
      setReports(response.data);
    } catch (err) {
      setReports([]);
    }
  };

  const handleSelect = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    setClaims([]);
    setReports([]);
    setAiReportId('');
    setError('');
    if (id) {
      fetchClaims(id);
      if (user?.role === 'landlord') fetchReports(id);
    }
  };

  const handleCreateClaim = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedId) {
      setError('Select an agreement first');
      return;
    }
    try {
      await axiosClient.post('/claims', {
        agreementId: selectedId,
        description,
        claimedAmount: Number(claimedAmount),
        aiReportId: aiReportId || undefined,
      });
      setDescription('');
      setClaimedAmount('');
      setAiReportId('');
      alert('Claim created successfully');
      fetchClaims(selectedId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create claim');
    }
  };

  const handleRespond = async (claimId, response) => {
    let note = '';
    if (response === 'dispute') {
      note = prompt('Enter a reason for disputing this claim:');
      if (!note) return;
    }
    try {
      await axiosClient.patch(`/claims/${claimId}/respond`, { response, note });
      fetchClaims(currentId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to respond to claim');
    }
  };

  const handleDecide = async (claimId, decision, claimedAmountForClaim) => {
    if (deciding) return;
    let adminDecidedAmount = 0;
    if (decision === 'accept') {
      adminDecidedAmount = prompt(`Enter amount to award landlord (max ${claimedAmountForClaim}):`);
      if (!adminDecidedAmount) return;
    }
    const adminNotes = prompt('Enter admin notes (optional):') || '';
    setDeciding(true);
    try {
      await axiosClient.patch(`/claims/${claimId}/decide`, {
        decision,
        adminDecidedAmount: Number(adminDecidedAmount),
        adminNotes,
      });
      fetchClaims(currentId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decide claim');
    } finally {
      setDeciding(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <h2>Claims</h2>

      {isAdmin ? (
        <div>
          <h3>View Claims for an Agreement</h3>
          <input
            placeholder="Agreement ID"
            value={adminAgreementId}
            onChange={(e) => setAdminAgreementId(e.target.value)}
          />
          <button onClick={() => fetchClaims(adminAgreementId.trim())}>Load Claims</button>
        </div>
      ) : (
        <div>
          <label>Agreement</label>
          <select value={selectedId} onChange={handleSelect}>
            <option value="">Select an agreement</option>
            {agreements.map((a) => (
              <option key={a._id} value={a._id}>
                {a.property?.title} ({a._id.slice(-6)})
              </option>
            ))}
          </select>
        </div>
      )}

      {user?.role === 'landlord' && selectedId && (
        <form onSubmit={handleCreateClaim} style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h3>File a Claim</h3>
          <div>
            <label>Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div>
            <label>Claimed Amount</label>
            <input type="number" step="any" value={claimedAmount} onChange={(e) => setClaimedAmount(e.target.value)} required />
          </div>
          <div>
            <label>AI Report (optional)</label>
            <select value={aiReportId} onChange={(e) => setAiReportId(e.target.value)}>
              <option value="">None</option>
              {reports.map((r) => (
                <option key={r._id} value={r._id}>
                  {new Date(r.createdAt).toLocaleString()} - {r.results.length} photo(s),{' '}
                  {r.results.filter((x) => x.flaggedForReview).length} flagged
                </option>
              ))}
            </select>
          </div>
          <button type="submit">File Claim</button>
        </form>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {claims.map((claim) => (
        <div key={claim._id} className="card">
          <strong>{claim.description}</strong>
          <br />
          Claimed Amount: {claim.claimedAmount}
          <br />
          Status: <span className={`status status-${claim.status}`}>{claim.status}</span>
          <br />
          Tenant Response: {claim.tenantResponse}
          <br />
          Admin Decision: {claim.adminDecision || 'none'} {claim.adminDecidedAmount !== null && `(${claim.adminDecidedAmount})`}
          <br />
          {claim.aiReport && typeof claim.aiReport === 'object' && (
            <>
              AI evidence:{' '}
              {claim.aiReport.results
                ?.map((r) => `${r.label} ${r.similarityScore}${r.flaggedForReview ? ' (flagged)' : ''}`)
                .join(', ')}
              <br />
            </>
          )}
          {claim.blockchainTxHash && (
            <small>
              On-chain tx:{' '}
              <a
                href={`https://sepolia.etherscan.io/tx/${claim.blockchainTxHash}`}
                target="_blank"
                rel="noreferrer"
              >
                {claim.blockchainTxHash.slice(0, 20)}...
              </a>
            </small>
          )}
          <br />

          {user?.role === 'tenant' && claim.status === 'pending' && (
            <div style={{ marginTop: '8px' }}>
              <button onClick={() => handleRespond(claim._id, 'accept')}>Accept</button>{' '}
              <button onClick={() => handleRespond(claim._id, 'dispute')}>Dispute</button>
            </div>
          )}

          {isAdmin && claim.status === 'admin-review' && (
            <div style={{ marginTop: '8px' }}>
              <button disabled={deciding} onClick={() => handleDecide(claim._id, 'accept', claim.claimedAmount)}>Accept Claim</button>{' '}
              <button disabled={deciding} onClick={() => handleDecide(claim._id, 'reject')}>Reject Claim</button>
              {deciding && <p>Sending transaction to Sepolia. Wait 15 to 30 seconds.</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Claims;