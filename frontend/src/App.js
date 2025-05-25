import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import BaitedAttackers from './components/BaitedAttackers';
import SafeList from './components/SafeList';
import BlackList from './components/BlackList';
import ReportDetails from './components/ReportDetails';

function App() {
  return (
    <Router>
      <nav style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
        <Link to="/" style={{ marginRight: '10px' }}>Dashboard</Link>
        <Link to="/attackers" style={{ marginRight: '10px' }}>Baited Attackers</Link>
        <Link to="/safelist" style={{ marginRight: '10px' }}>Safe-listed Senders</Link>
        <Link to="/blacklist" style={{ marginRight: '10px' }}>Blacklisted Senders</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/attackers" element={<BaitedAttackers />} />
        <Route path="/safelist" element={<SafeList />} />
        <Route path="/blacklist" element={<BlackList />} />
        <Route path="/report/:token" element={<ReportDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
