import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

function Inspections() {
  const [agreements, setAgreements] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [inspections, setInspections] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAgreements = async () => {
      try {
        const response = await axiosClient.get('/agreements/mine');
        setAgreements(response.data.filter((a) => a.status === 'active'));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load agreements');
      }
    };
    loadAgreements();
  }, []);

  const loadInspections = async (agreementId) => {
    setError('');
    try {
      const response = await axiosClient.get(`/inspections/agreement/${agreementId}`);
      setInspections(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inspections');
    }
  };

  const handleSelect = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    setInspections([]);
    if (id) loadInspections(id);
  };

  const handleCreate = async (type) => {
    setError('');
    try {
      await axiosClient.post('/inspections', { agreementId: selectedId, type });
      loadInspections(selectedId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create inspection');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <h2>Inspections</h2>

      <label>Agreement</label>
      <select value={selectedId} onChange={handleSelect}>
        <option value="">Select an agreement</option>
        {agreements.map((a) => (
          <option key={a._id} value={a._id}>
            {a.property?.title} ({a._id.slice(-6)})
          </option>
        ))}
      </select>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {selectedId && (
        <div style={{ marginTop: '12px' }}>
          <button onClick={() => handleCreate('move-in')}>Create Move-in</button>
          <button onClick={() => handleCreate('move-out')}>Create Move-out</button>
        </div>
      )}

      {inspections.map((i) => (
        <div key={i._id} className="card">
          <strong>{i.type}</strong>
          <br />
          Status: {i.status}
          <br />
          Photos: {i.photos.length}
          <br />
          Tenant approved: {i.tenantApproved ? 'Yes' : 'No'} | Landlord approved: {i.landlordApproved ? 'Yes' : 'No'}
        </div>
      ))}
    </div>
  );
}

export default Inspections;