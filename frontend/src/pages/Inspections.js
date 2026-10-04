import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

function InspectionCard({ inspection, onChanged, onError }) {
  const { user } = useAuth();
  const [label, setLabel] = useState('');
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [busy, setBusy] = useState(false);

  const handleUpload = async () => {
    if (!file || !label.trim()) {
      onError('Choose a photo and type a label');
      return;
    }
    setBusy(true);
    onError('');
    try {
      const formData = new FormData();
      formData.append('photos', file);
      formData.append('labels', label.trim());
      await axiosClient.post(`/inspections/${inspection._id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLabel('');
      setFile(null);
      setFileKey(fileKey + 1);
      onChanged();
    } catch (err) {
      onError(err.response?.data?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const handleApprove = async () => {
    onError('');
    try {
      await axiosClient.patch(`/inspections/${inspection._id}/approve`);
      onChanged();
    } catch (err) {
      onError(err.response?.data?.message || 'Approve failed');
    }
  };

  const handleDispute = async () => {
    const reason = prompt('Enter a reason for disputing this inspection:');
    if (!reason) return;
    onError('');
    try {
      await axiosClient.patch(`/inspections/${inspection._id}/dispute`, { reason });
      onChanged();
    } catch (err) {
      onError(err.response?.data?.message || 'Dispute failed');
    }
  };

  const alreadyApproved =
    (user?.role === 'tenant' && inspection.tenantApproved) ||
    (user?.role === 'landlord' && inspection.landlordApproved);

  return (
    <div className="card">
      <strong>{inspection.type}</strong>
      <br />
      Status: {inspection.status}
      <br />
      Tenant approved: {inspection.tenantApproved ? 'Yes' : 'No'} | Landlord approved:{' '}
      {inspection.landlordApproved ? 'Yes' : 'No'}
      {inspection.disputeReason && (
        <>
          <br />
          Dispute reason: {inspection.disputeReason}
        </>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
        {inspection.photos.map((p) => (
          <div key={p._id} style={{ fontSize: '12px' }}>
            <img src={p.url} alt={p.label} style={{ width: '90px', height: '70px', objectFit: 'cover' }} />
            <br />
            {p.label}
          </div>
        ))}
      </div>

      {inspection.status === 'pending' && (
        <div style={{ marginTop: '10px' }}>
          <input placeholder="Label (e.g. wall)" value={label} onChange={(e) => setLabel(e.target.value)} />
          <input key={fileKey} type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={handleUpload} disabled={busy}>
            {busy ? 'Uploading...' : 'Upload Photo'}
          </button>
        </div>
      )}

      {inspection.status === 'pending' && inspection.photos.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <button onClick={handleApprove} disabled={alreadyApproved}>
            {alreadyApproved ? 'You approved' : 'Approve'}
          </button>
          <button onClick={handleDispute}>Dispute</button>
        </div>
      )}
    </div>
  );
}

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
    setError('');
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
        <InspectionCard
          key={i._id}
          inspection={i}
          onChanged={() => loadInspections(selectedId)}
          onError={setError}
        />
      ))}
    </div>
  );
}

export default Inspections;