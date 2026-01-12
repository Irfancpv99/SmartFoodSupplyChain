import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { documentsAPI } from '../../services/api';

const VendorDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await documentsAPI.getAll();
      setDocuments(response.data.documents);
    } catch (err) {
      setError('Failed to load documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      verified: 'badge-success',
      pending: 'badge-warning',
      rejected: 'badge-danger',
    };
    return `badge ${badges[status] || 'badge-info'}`;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title">Vendor Dashboard</h2>
          <Link to="/vendor/upload">
            <button className="btn btn-primary">Upload New Document</button>
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ marginTop: '2rem' }}>
          <h3>Recent Documents</h3>
          
          {documents.length === 0 ? (
            <p style={{ marginTop: '1rem', color: '#666' }}>
              No documents uploaded yet. Click "Upload New Document" to get started.
            </p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>DDT Number</th>
                  <th>School</th>
                  <th>Date</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.ddt_number}</td>
                    <td>{doc.school_name}</td>
                    <td>{new Date(doc.document_date).toLocaleDateString()}</td>
                    <td>{JSON.parse(doc.products).length} items</td>
                    <td>
                      <span className={getStatusBadge(doc.status)}>
                        {doc.status}
                      </span>
                    </td>
                    <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
