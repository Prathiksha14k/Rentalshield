import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <h2>Dashboard</h2>
      <p>Welcome, {user?.name} ({user?.role})</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Dashboard;