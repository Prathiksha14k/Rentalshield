import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

function Claims() {
  const { user } = useAuth();
  const [agreementId, setAgreementId] = useState('');
  const [description, setDescription] = useState('');
  const [claimedAmount, setClaimedAmount] = useState('');
  const [claims, setClaims] = useState([]);
  const [lookupAgreementId, setLookupAgreementId] = useState('');
  const [error, setError] = useState('');

  const [deciding, setDeciding] = useState(false);

  const fetchClaimsForAgreement = async () => {
    setError('');
    try {
      const response = await axiosClient.get(`/claims/agreement/${lookupAgreementId}`);
      setClaims(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load claims');
    }
  };

  const handleCreateClaim = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axiosClient.post('/claims', {
        agreementId,
        description,
        claimedAmount: Number(claimedAmount),
      });
      setAgreementId('');
      setDescription('');
      setClaimedAmount('');
      alert('Claim created successfully');
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
      fetchClaimsForAgreement();
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
    fetchClaimsForAgreement();
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to decide claim');
  } finally {
    setDeciding(false);
  }
};

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <h2>Claims</h2>

      {user?.role === 'landlord' && (
        <form onSubmit={handleCreateClaim} style={{ marginBottom: '30px' }}>
          <h3>File a Claim</h3>
          <div>
            <label>Agreement ID</label>
            <input value={agreementId} onChange={(e) => setAgreementId(e.target.value)} required />
          </div>
          <div>
            <label>Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div>
            <label>Claimed Amount</label>
            <input type="number" step="any" value={claimedAmount} onChange={(e) => setClaimedAmount(e.target.value)} required />
          </div>
          <button type="submit">File Claim</button>
        </form>
      )}

      <h3>View Claims for an Agreement</h3>
      <div>
        <input
          placeholder="Agreement ID"
          value={lookupAgreementId}
          onChange={(e) => setLookupAgreementId(e.target.value)}
        />
        <button onClick={fetchClaimsForAgreement}>Load Claims</button>
      </div>

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

          {user?.role === 'admin' && claim.status === 'admin-review' && (
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