import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        padding: '12px 24px',
        borderBottom: '1px solid #ccc',
      }}
    >
      <strong>RentalShield</strong>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/properties">Properties</Link>
      <Link to="/agreements">Agreements</Link>
      <Link to="/claims">Claims</Link>
      <span style={{ marginLeft: 'auto' }}>
        {user?.name} ({user?.role})
      </span>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}

export default Navbar;