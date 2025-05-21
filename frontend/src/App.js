import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import BaitedAttackers from './components/BaitedAttackers';

function App() {
  return (
    <Router>
      <nav style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
        <Link to="/" style={{ marginRight: '10px' }}>Dashboard</Link>
        <Link to="/attackers">Baited Attackers</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/attackers" element={<BaitedAttackers />} />
      </Routes>
    </Router>
  );
}

export default App;
