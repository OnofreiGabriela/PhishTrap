import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import BaitedAttackers from './components/BaitedAttackers';
import SafeList from './components/SafeList';
import BlackList from './components/BlackList';
import ReportDetails from './components/ReportDetails';
import Login from './components/Login';
import axios from './api/api';

function App() {
  const [configExists, setConfigExists] = useState(null);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await axios.get('/check-config');
        setConfigExists(response.data.config_exists);
      } catch (error) {
        console.error('Error checking config:', error);
      }
    };
    checkConfig();
  }, []);

  if (configExists === null) {
    return <p style={{ fontSize: '16px', color: '#007bff' }}>⏳ Loading, please wait...</p>;
  }

  return (
    <Router>
      <Routes>
        {!configExists ? (
          <Route path="*" element={<Login />} />
        ) : (
          <>
            <Route
              path="*"
              element={
                <div>
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
                    <Route path="/login" element={<Navigate to="/" />} />
                  </Routes>
                </div>
              }
            />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
