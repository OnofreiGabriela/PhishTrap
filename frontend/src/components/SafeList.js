import React, { useEffect, useState } from 'react';
import axios from '../api/api';
import 'bootstrap/dist/css/bootstrap.min.css';

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
      fetchSafeList();
    } catch (error) {
      console.error('Failed to remove from safe list:', error);
    }
  };

  useEffect(() => {
    fetchSafeList();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Safe-listed Senders</h2>
      {safeList.length === 0 ? (
        <div className="alert alert-info">No safe-listed senders.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Sender</th>
                <th>IP Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeList.map((item, index) => (
                <tr key={index}>
                  <td>{item.sender}</td>
                  <td>{item.ip}</td>
                  <td>
                    <button
                      onClick={() => removeFromSafe(item.sender, item.ip)}
                      className="btn btn-sm btn-danger"
                    >
                      Remove
                    </button>
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

export default SafeList;
