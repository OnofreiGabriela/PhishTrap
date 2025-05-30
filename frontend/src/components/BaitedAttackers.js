import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const BaitedAttackers = () => {
  const [logs, setLogs] = useState([]);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await axios.get('/get-baited-attackers');
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to load baited attackers:', error);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const deleteEntry = async (token) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await axios.delete(`/delete-baited-attacker/${token}`);
      setLogs((prevLogs) => prevLogs.filter((log) => log.token !== token));
    } catch (error) {
      console.error('Failed to delete attacker entry:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Baited Attackers</h2>
      {logs.length === 0 ? (
        <div className="alert alert-info text-center">No tracking data found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Event</th>
                <th>Token</th>
                <th>IP Address</th>
                <th>User Agent</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index}>
                  <td>{log.event || 'link_clicked'}</td>
                  <td>{log.token}</td>
                  <td>{log.ip}</td>
                  <td>{log.user_agent}</td>
                  <td>{log.timestamp}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => window.open(`/report/${log.token}`, '_blank')}
                        className="btn btn-success btn-sm"
                      >
                        View Report
                      </button>
                      <button
                        onClick={() => deleteEntry(log.token)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BaitedAttackers;
