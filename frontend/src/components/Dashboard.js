import React, { useEffect, useState } from 'react';
import axios from '../api/api';

const Dashboard = () => {
  const [content, setContent] = useState('');
  const [result, setResult] = useState(null);
  const [emails, setEmails] = useState([]);

  const checkEmail = async () => {
    try {
      const response = await axios.post('/email/check', { content });
      setResult(response.data.phishing);
    } catch (err) {
      console.error('Error checking email content:', err);
    }
  };

  const fetchAnalyzedEmails = async () => {
    try {
      const response = await axios.get('/email/fetch-analyze');
      setEmails(response.data);
    } catch (err) {
      console.error('Error fetching analyzed emails:', err);
    }
  };
  const reportAsSafe = async (email) => {
    try {
      await axios.post('/email/mark-safe', {
        from: email.from,
        ip: email.ip
      });
      fetchAnalyzedEmails();
    } catch (err) {
      console.error('Error marking email as safe:', err);
    }
  };

  useEffect(() => {
    fetchAnalyzedEmails();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
        Emails from the Last 24 Hours (Scanned for Phishing)
      </h2>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '30px' }}>
        This list shows all emails received in the past 24 hours, regardless of read status.
        Each one has been automatically analyzed for phishing.
      </p>

      {/* Manual Check Section */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}> Manual Check</h3>
        <textarea
          rows={8}
          cols={60}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder='Paste email content here...'
          style={{ padding: '10px', fontSize: '14px' }}
        />
        <br />
        <button
          onClick={checkEmail}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            fontSize: '14px',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Check
        </button>
        {result !== null && (
          <p style={{ marginTop: '10px', fontSize: '16px' }}>
            {result ? '⚠️ Phishing Detected!' : '✅ Email Appears Safe'}
          </p>
        )}
      </div>

      {/* Scanned Emails Table */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}> Auto-Scanned Inbox</h3>
        {emails.length === 0 ? (
          <p>No recent emails found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>From</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Subject</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc'}}>Ip Address</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '8px' }}>{email.from}</td>
                  <td style={{ padding: '8px' }}>{email.subject}</td>
                  <td style={{ padding: '8px' }}>{email.ip}</td>
                  <td style={{ padding: '8px' }}>
                    {email.phishing ? (
                      <>
                        <span style={{ color: 'red' }}>⚠️ Possible Phishing Detected</span><br />
                        {email.ip !== "NOT FOUND" && (
                          <button
                            onClick={() => reportAsSafe(email)}
                            style={{
                              marginTop: '5px',
                              padding: '5px 10px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                            }}
                          >
                            Mark as Safe
                          </button>
                        )}
                      </>
                    ) : (
                      <span style={{ color: 'green' }}>✅ Safe</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
