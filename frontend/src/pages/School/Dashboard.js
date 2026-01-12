import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { menusAPI, documentsAPI } from '../../services/api';

const SchoolDashboard = () => {
  const [menus, setMenus] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalMenus: 0,
    publishedMenus: 0,
    totalDocuments: 0,
    verifiedDocuments: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [menusRes, docsRes] = await Promise.all([
        menusAPI.getAll(),
        documentsAPI.getAll(),
      ]);

      const menuData = menusRes.data.menus;
      const docData = docsRes.data.documents;

      setMenus(menuData.slice(0, 5)); // Show only recent 5
      setDocuments(docData.slice(0, 5));

      setStats({
        totalMenus: menuData.length,
        publishedMenus: menuData.filter(m => m.status === 'published').length,
        totalDocuments: docData.length,
        verifiedDocuments: docData.filter(d => d.status === 'verified').length,
      });
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
      <h2 style={{ marginBottom: '2rem' }}>School Administration Dashboard</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats Cards */}
      <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem' }}>
            Total Menus
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3498db' }}>
            {stats.totalMenus}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem' }}>
            Published Menus
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#27ae60' }}>
            {stats.publishedMenus}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem' }}>
            Verified Documents
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#9b59b6' }}>
            {stats.verifiedDocuments}/{stats.totalDocuments}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 className="card-title">Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/school/menus/create">
            <button className="btn btn-primary">Create New Menu</button>
          </Link>
          <Link to="/school/menus">
            <button className="btn btn-secondary">View All Menus</button>
          </Link>
        </div>
      </div>

      {/* Recent Menus */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 className="card-title">Recent Menus</h3>
        {menus.length === 0 ? (
          <p style={{ color: '#666' }}>No menus created yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Status</th>
                <th>Items</th>
                <th>Published</th>
              </tr>
            </thead>
            <tbody>
              {menus.map((menu) => (
                <tr key={menu.id}>
                  <td>{new Date(menu.menu_date).toLocaleDateString()}</td>
                  <td>
                    <span className="badge badge-info">{menu.menu_type}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${menu.status === 'published' ? 'success' : 'warning'}`}>
                      {menu.status}
                    </span>
                  </td>
                  <td>{JSON.parse(menu.items).length} items</td>
                  <td>
                    {menu.published_at 
                      ? new Date(menu.published_at).toLocaleDateString()
                      : '-'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Documents */}
      <div className="card">
        <h3 className="card-title">Recent Delivery Documents</h3>
        {documents.length === 0 ? (
          <p style={{ color: '#666' }}>No documents received yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>DDT Number</th>
                <th>Vendor</th>
                <th>Date</th>
                <th>Products</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.ddt_number}</td>
                  <td>{doc.vendor_name}</td>
                  <td>{new Date(doc.document_date).toLocaleDateString()}</td>
                  <td>{JSON.parse(doc.products).length} items</td>
                  <td>
                    <span className={`badge badge-${doc.status === 'verified' ? 'success' : 'warning'}`}>
                      {doc.status}
                    </span>
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

export default SchoolDashboard;
