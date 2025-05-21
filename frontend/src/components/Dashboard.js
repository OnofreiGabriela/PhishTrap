import React, { useEffect, useState } from 'react';
import axios from '../api/api';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
  const [emails, setEmails] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);

  const fetchAnalyzedEmails = async () => {
    try {
      const response = await axios.get('/email/fetch-analyze');
      setEmails([...response.data]);
    } catch (err) {
      console.error('Error fetching analyzed emails:', err);
    }
  };

  const reportAsSafe = async (emailToUpdate) => {
    try {
      setEmails((prevEmails) =>
        prevEmails.map((email) =>
          email.from === emailToUpdate.from && email.ip === emailToUpdate.ip
            ? { ...email, phishing: false }
            : email
        )
      );
      await axios.post('/email/mark-safe', {
        from: emailToUpdate.from,
        ip: emailToUpdate.ip
      });
      await fetchAnalyzedEmails();
    } catch (err) {
      console.error('Error marking email as safe:', err);
    }
  };

  const markAsPhishing = async (emailToUpdate) => {
    try {
      setEmails((prevEmails) =>
        prevEmails.map((email) =>
          email.from === emailToUpdate.from && email.ip === emailToUpdate.ip
            ? { ...email, phishing: true }
            : email
        )
      );
      await axios.post('/email/mark-phishing', {
        from: emailToUpdate.from,
        ip: emailToUpdate.ip
      });
      await fetchAnalyzedEmails();
    } catch (err) {
      console.error('Error marking email as phishing:', err);
    }
  };

  const reportPhishingToDNSC = (email) => {
    setReportData(email);
    setShowReportModal(true);
  };
  
  const location = useLocation();
  useEffect(() => {
    fetchAnalyzedEmails();
  }, [location.pathname]);

  const sendBaitResponse = async (email) => {
    console.log("Sending bait with:", {
      from: email.from,
      ip: email.ip,
      body: email.body
    });
  
    try {
      await axios.post('/send-bait', {
        from: email.from,
        ip: email.ip,
        body: email.body,
      });
      alert("Bait response sent!");
    } catch (err) {
      console.error("Failed to send bait:", err);
      alert("Failed to send bait.");
    }
  };
  

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
        Emails from the Last 24 Hours (Scanned for Phishing)
      </h2>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '30px' }}>
        This list shows all emails received in the past 24 hours, regardless of read status.
        Each one has been automatically analyzed for phishing.
      </p>

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
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Ip Address</th>
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
                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                          {email.ip !== "NOT FOUND" && (
                            <button
                              onClick={() => reportAsSafe(email)}
                              style={{ /* styling here */ }}
                            >
                              Mark as Safe
                            </button>
                          )}
                          <button
                            onClick={() => reportPhishingToDNSC(email)}
                            style={{ /* styling here */ }}
                          >
                            Report to DNSC
                          </button>
                          <button
                            onClick={() => sendBaitResponse(email)}
                            style={{
                              padding: '5px 10px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              backgroundColor: '#ffc107',
                              color: 'black',
                              border: 'none',
                              borderRadius: '4px',
                            }}
                          >
                            Send Bait
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span style={{ color: 'green' }}>✅ Safe</span><br />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                          <button
                            onClick={() => markAsPhishing(email)}
                            style={{
                              padding: '5px 10px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              backgroundColor: '#ff8800',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px'
                            }}
                          >
                            Mark as Phishing
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && reportData && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '8px',
            width: '500px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}>
            <h3>Report to DNSC</h3>
            <p><strong>From:</strong> {reportData.from}</p>
            <p><strong>Subject:</strong> {reportData.subject}</p>
            <p><strong>IP Address:</strong> {reportData.ip}</p>
            <p><strong>Content:</strong></p>
            <div style={{ maxHeight: '150px', overflowY: 'auto', padding: '10px', backgroundColor: '#f1f1f1', borderRadius: '4px' }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>{reportData.body}</pre>
            </div>
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setShowReportModal(false)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Cancel
              </button>
              <a
                href="https://pnrisc.dnsc.ro/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px'
                }}
              >
                Open DNSC Form
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
