import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

function Agreements() {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState([]);
  const [propertyId, setPropertyId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const fetchAgreements = async () => {
    try {
      const response = await axiosClient.get('/agreements/mine');
      setAgreements(response.data);
    } catch (err) {
      setError('Failed to load agreements');
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  const handleRequest = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axiosClient.post('/agreements', { propertyId, startDate, endDate });
      setPropertyId('');
      setStartDate('');
      setEndDate('');
      fetchAgreements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request agreement');
    }
  };

  const handleApprove = async (id) => {
    try {
      await axiosClient.patch(`/agreements/${id}/approve`);
      fetchAgreements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve agreement');
    }
  };

  const handleReject = async (id) => {
    try {
      await axiosClient.patch(`/agreements/${id}/reject`);
      fetchAgreements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject agreement');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <h2>Agreements</h2>

      {user?.role === 'tenant' && (
        <form onSubmit={handleRequest} style={{ marginBottom: '30px' }}>
          <h3>Request a Rental Agreement</h3>
          <div>
            <label>Property ID</label>
            <input value={propertyId} onChange={(e) => setPropertyId(e.target.value)} required />
          </div>
          <div>
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </div>
          <div>
            <label>End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">Request Agreement</button>
        </form>
      )}

      <h3>My Agreements</h3>
      {agreements.map((agreement) => (
        <div key={agreement._id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
          <strong>{agreement.property?.title}</strong> — {agreement.property?.address}
          <br />
          Tenant: {agreement.tenant?.name} | Landlord: {agreement.landlord?.name}
          <br />
          Status: {agreement.status}
          <br />
          Tenant Approved: {agreement.tenantApproved ? 'Yes' : 'No'} | Landlord Approved: {agreement.landlordApproved ? 'Yes' : 'No'}
          <br />
          <small>Agreement ID: {agreement._id}</small>
          <br />
          {agreement.status === 'pending' && (
            <div style={{ marginTop: '8px' }}>
              <button onClick={() => handleApprove(agreement._id)}>Approve</button>{' '}
              {user?.role === 'landlord' && (
                <button onClick={() => handleReject(agreement._id)}>Reject</button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Agreements;