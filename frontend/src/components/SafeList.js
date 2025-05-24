import React, { useEffect, useState } from 'react';
import axios from '../api/api';

const SafeList = () => {
  const [safeList, setSafeList] = useState([]);

  const fetchSafeList = async () => {
    try {
      const response = await axios.get('/get-safe-list');
      setSafeList(response.data);
    } catch (error) {
      console.error('Failed to load safe list:', error);
    }
  };

  const removeFromSafe = async (sender, ip) => {
    try {
      await axios.post('/remove-from-safe', { sender, ip });
      fetchSafeList();  // Refresh after removal
    } catch (error) {
      console.error('Failed to remove from safe list:', error);
    }
  };

  useEffect(() => {
    fetchSafeList();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Safe-listed Senders</h2>
      {safeList.length === 0 ? (
        <p>No safe-listed senders.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px' }}>Sender</th>
              <th style={{ padding: '8px' }}>IP Address</th>
              <th style={{ padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {safeList.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '8px' }}>{item.sender}</td>
                <td style={{ padding: '8px' }}>{item.ip}</td>
                <td style={{ padding: '8px' }}>
                  <button
                    onClick={() => removeFromSafe(item.sender, item.ip)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SafeList;
