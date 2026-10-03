import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

function Properties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const fetchProperties = async () => {
    try {
      const response = await axiosClient.get('/properties');
      setProperties(response.data);
    } catch (err) {
      setError('Failed to load properties');
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axiosClient.post('/properties', {
        title,
        address,
        rentAmount: Number(rentAmount),
        depositAmount: Number(depositAmount),
        description,
      });
      setTitle('');
      setAddress('');
      setRentAmount('');
      setDepositAmount('');
      setDescription('');
      fetchProperties();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create property');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <h2>Properties</h2>

      {user?.role === 'landlord' && (
        <form onSubmit={handleCreate} style={{ marginBottom: '30px' }}>
          <h3>Add a Property</h3>
          <div>
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label>Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
          <div>
            <label>Rent Amount</label>
           <input type="number" step="any" value={rentAmount} onChange={(e) => setRentAmount(e.target.value)} required />
          </div>
          <div>
            <label>Deposit Amount</label>
            <input type="number" step="any" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} required />
          </div>
          <div>
            <label>Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">Create Property</button>
        </form>
      )}

      <h3>All Properties</h3>
      {properties.map((property) => (
        <div key={property._id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
          <strong>{property.title}</strong> — {property.address}
          <br />
          Rent: {property.rentAmount} | Deposit: {property.depositAmount}
          <br />
          Landlord: {property.landlord?.name}
          <br />
          <small>Property ID: {property._id}</small>
        </div>
      ))}
    </div>
  );
}

export default Properties;