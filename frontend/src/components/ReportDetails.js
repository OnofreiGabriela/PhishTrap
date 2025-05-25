import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/api';

const ReportDetails = () => {
  const { token } = useParams();
  const [log, setLog] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');

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

  const handleCopy = () => {
    if (log && log.original_email) {
      navigator.clipboard.writeText(log.original_email)
        .then(() => setCopyStatus('Copied!'))
        .catch(() => setCopyStatus('Failed to copy.'));
      setTimeout(() => setCopyStatus(''), 2000); // clear message after 2 sec
    }
  };

  if (!log) {
    return <p>Loading report details...</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Phishing Report Details</h2>
      <p><strong>Token:</strong> {log.token}</p>
      <p><strong>IP Address:</strong> {log.ip}</p>
      <p><strong>User Agent:</strong> {log.user_agent}</p>
      <p><strong>Timestamp:</strong> {log.timestamp}</p>
      <p><strong>Location:</strong> {log.country || '-'}, {log.region || '-'}</p>

      <p><strong>Original Email:</strong></p>
      <div style={{
        padding: '10px',
        backgroundColor: '#f1f1f1',
        borderRadius: '4px',
        maxHeight: '40vh',
        overflowY: 'auto'
      }}>
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {log.original_email || 'No original content recorded.'}
        </pre>
      </div>

      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <button
          onClick={handleCopy}
          style={{
            padding: '8px 12px',
            backgroundColor: '#17a2b8',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Copy Email Content
        </button>
        <span>{copyStatus}</span>
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
