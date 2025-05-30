import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const ReportDetails = () => {
  const { token } = useParams();
  const [log, setLog] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const response = await axios.get('/get-baited-attackers');
        const found = response.data.find((item) => item.token === token);
        setLog(found);
      } catch (error) {
        console.error('Failed to load report:', error);
      }
    };

    fetchLog();
  }, [token]);

  const handleCopy = () => {
    if (log && log.original_email) {
      navigator.clipboard
        .writeText(log.original_email)
        .then(() => setCopyStatus('Copied!'))
        .catch(() => setCopyStatus('Failed to copy.'));
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  if (!log) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading report details...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Phishing Report Details</h2>
      <div className="card shadow-sm p-4">
        <p>
          <strong>Token:</strong> {log.token}
        </p>
        <p>
          <strong>IP Address:</strong> {log.ip}
        </p>
        <p>
          <strong>User Agent:</strong> {log.user_agent}
        </p>
        <p>
          <strong>Timestamp:</strong> {log.timestamp}
        </p>
        <p>
          <strong>Location:</strong> {log.country || '-'}, {log.region || '-'}
        </p>

        <div className="mb-3">
          <strong>Original Email:</strong>
          <div
            className="bg-light p-3 rounded overflow-auto"
            style={{ maxHeight: '300px' }}
          >
            <pre className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
              {log.original_email || 'No original content recorded.'}
            </pre>
          </div>
        </div>

        <div className="d-flex align-items-center mb-3">
          <button
            onClick={handleCopy}
            className="btn btn-info me-3"
          >
            Copy Email Content
          </button>
          <span>{copyStatus}</span>
        </div>

        <a
          href="https://pnrisc.dnsc.ro/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Open DNSC Site
        </a>
      </div>
    </div>
  );
};

export default ReportDetails;
