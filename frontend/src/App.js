import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import BaitedAttackers from './components/BaitedAttackers';
import SafeList from './components/SafeList';
import BlackList from './components/BlackList';
import ReportDetails from './components/ReportDetails';
import Login from './components/Login';
import axios from './api/api';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">⏳ Loading, please wait...</p>
      </div>
    );
  }

  return (
    <Router>
      {!configExists ? (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      ) : (
        <div>
          <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
              <Link className="navbar-brand" to="/">PhishTrap</Link>
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    <Link className="nav-link" to="/">Dashboard</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/attackers">Baited Attackers</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/safelist">Safe List</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/blacklist">Blacklist</Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          <div className="container mt-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/attackers" element={<BaitedAttackers />} />
              <Route path="/safelist" element={<SafeList />} />
              <Route path="/blacklist" element={<BlackList />} />
              <Route path="/report/:token" element={<ReportDetails />} />
              <Route path="/login" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
