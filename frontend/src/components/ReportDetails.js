import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/api';

const ReportDetails = () => {
  const { token } = useParams();
  const [log, setLog] = useState(null);

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const response = await axios.get('/get-baited-attackers');
        const found = response.data.find(item => item.token === token);
        setLog(found);
      } catch (error) {
        console.error('Failed to load report:', error);
      }
    };

    fetchLog();
  }, [token]);

  if (!log) {
    return <p>Loading report details...</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Phishing Report Details</h2>
      <p><strong>Token:</strong> {log.token}</p>
      <p><strong>IP Address:</strong> {log.ip}</p>
      <p><strong>User Agent:</strong> {log.user_agent}</p>
      <p><strong>Timestamp:</strong> {log.timestamp}</p>
      <p><strong>Original Email:</strong></p>
      <div style={{ padding: '10px', backgroundColor: '#f1f1f1', borderRadius: '4px' }}>
        <pre>{log.original_email || 'No original content recorded.'}</pre>
      </div>
      <div style={{ marginTop: '20px' }}>
        <a
          href="https://pnrisc.dnsc.ro/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          Open DNSC Site
        </a>
      </div>
    </div>
  );
};

export default ReportDetails;
