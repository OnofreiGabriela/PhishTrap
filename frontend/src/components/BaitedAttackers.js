import React, { useEffect, useState } from 'react';
import axios from '../api/api';

const BaitedAttackers = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('/get-baited-attackers');
        setLogs(response.data);
      } catch (error) {
        console.error('Failed to load baited attackers:', error);
      }
    };

    fetchLogs();
  }, []);

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
    <div style={{ padding: '20px' }}>
      <h2>Baited Attackers</h2>
      {logs.length === 0 ? (
        <p>No tracking data found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px' }}>Event</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Token</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>IP Address</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>User Agent</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Timestamp</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td style={{ padding: '8px' }}>{log.event || 'link_clicked'}</td>
                <td style={{ padding: '8px' }}>{log.token}</td>
                <td style={{ padding: '8px' }}>{log.ip}</td>
                <td style={{ padding: '8px' }}>{log.user_agent}</td>
                <td style={{ padding: '8px' }}>{log.timestamp}</td>
                <td style={{ padding: '8px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => window.open(`/report/${log.token}`, '_blank')}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      View Report
                    </button>
                    <button
                      onClick={() => deleteEntry(log.token)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BaitedAttackers;
