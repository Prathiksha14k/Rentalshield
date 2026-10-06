import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_INFO = {
  tenant: {
    intro: 'Rent a property, record its condition, and respond to claims on your deposit.',
    actions: [
      { to: '/properties', title: 'Properties', text: 'Browse properties and copy a Property ID.' },
      { to: '/agreements', title: 'Agreements', text: 'Request an agreement and approve it.' },
      { to: '/inspections', title: 'Inspections', text: 'Upload move-in and move-out photos.' },
      { to: '/claims', title: 'Claims', text: 'Accept or dispute a claim against your deposit.' },
    ],
  },
  landlord: {
    intro: 'List properties, record inspections, and claim damages with AI evidence.',
    actions: [
      { to: '/properties', title: 'Properties', text: 'Add and manage your properties.' },
      { to: '/agreements', title: 'Agreements', text: 'Approve or reject rental requests.' },
      { to: '/inspections', title: 'Inspections', text: 'Run the AI damage check on photos.' },
      { to: '/claims', title: 'Claims', text: 'File a claim and attach an AI report.' },
    ],
  },
  admin: {
    intro: 'Review disputed claims and release the deposit on-chain.',
    actions: [
      { to: '/agreements', title: 'Agreements', text: 'See all agreements.' },
      { to: '/inspections', title: 'Inspections', text: 'View inspection photos (view only).' },
      { to: '/claims', title: 'Claims', text: 'Decide disputed claims. This releases funds on Sepolia.' },
    ],
  },
};

function Dashboard() {
  const { user } = useAuth();
  const info = ROLE_INFO[user?.role];

  return (
    <div style={{ maxWidth: '700px', margin: '50px auto' }}>
      <h2>Dashboard</h2>
      <p>
        Welcome, {user?.name} ({user?.role})
      </p>

      {info && (
        <>
          <p style={{ color: 'var(--muted)' }}>{info.intro}</p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px',
            }}
          >
            {info.actions.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="card"
                style={{ display: 'block', color: 'inherit', textDecoration: 'none', marginTop: 0 }}
              >
                <strong>{a.title}</strong>
                <br />
                {a.text}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;