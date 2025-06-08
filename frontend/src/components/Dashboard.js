import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/api';
import { useLocation, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [baitSendingMap, setBaitSendingMap] = useState({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);
  const navigate = useNavigate();

  const fetchAnalyzedEmails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/email/fetch-analyze');
      if (response.data.error && response.data.error.includes('Missing email credentials')) {
        alert('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        setEmails([...response.data]);
      }
    } catch (err) {
      console.error('Error fetching analyzed emails:', err);
      alert('Failed to fetch emails. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

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
      //await fetchAnalyzedEmails();
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
      //await fetchAnalyzedEmails();
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
  }, [location.pathname, fetchAnalyzedEmails]);

  const sendBaitResponse = async (email) => {
    setBaitSendingMap(prev => ({ ...prev, [email.from + email.ip]: true }));
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
    } finally {
      setBaitSendingMap(prev => ({ ...prev, [email.from + email.ip]: false }));
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post('/logout');
      if (response.data.success) {
        navigate('/login');
        window.location.reload();
      } else {
        alert('Failed to log out.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('An error occurred during logout.');
    }
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Emails from the Last 24 Hours</h2>
        <button className="btn btn-danger" onClick={handleLogout}>Log Out</button>
      </div>

      <p className="text-muted mb-4">
        This list shows all emails received in the past 24 hours, regardless of read status. Each one has been automatically analyzed for phishing.
      </p>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : emails.length === 0 ? (
        <p>No recent emails found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>From</th>
                <th>Subject</th>
                <th>IP Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email, idx) => (
                <tr key={idx}>
                  <td>{email.from}</td>
                  <td>{email.subject}</td>
                  <td>{email.ip}</td>
                  <td>
                    {email.phishing ? (
                      <span className="badge bg-danger">Phishing</span>
                    ) : (
                      <span className="badge bg-success">Safe</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      {email.phishing ? (
                        <>
                          <button className="btn btn-success" onClick={() => reportAsSafe(email)}>
                            Mark Safe
                          </button>
                          <button className="btn btn-primary" onClick={() => reportPhishingToDNSC(email)}>
                            Report DNSC
                          </button>
                          <button
                            className="btn btn-warning"
                            onClick={() => sendBaitResponse(email)}
                            disabled={baitSendingMap[email.from + email.ip]}
                          >
                            {baitSendingMap[email.from + email.ip] ? 'Sending...' : 'Send Bait'}
                          </button>
                        </>
                      ) : (
                        <button className="btn btn-warning" onClick={() => markAsPhishing(email)}>
                          Mark Phishing
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Simple Bootstrap modal */}
      {showReportModal && reportData && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Report to DNSC</h5>
                <button type="button" className="btn-close" onClick={() => setShowReportModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>From:</strong> {reportData.from}</p>
                <p><strong>Subject:</strong> {reportData.subject}</p>
                <p><strong>IP Address:</strong> {reportData.ip}</p>
                <div className="bg-light p-2 rounded" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  <pre>{reportData.body}</pre>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Cancel</button>
                <a className="btn btn-primary" href="https://pnrisc.dnsc.ro/" target="_blank" rel="noopener noreferrer">
                  Open DNSC Form
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
