import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { menusAPI } from '../../services/api';

const MenuList = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publishingId, setPublishingId] = useState(null);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      const response = await menusAPI.getAll();
      setMenus(response.data.menus);
    } catch (err) {
      setError('Failed to load menus');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (menuId) => {
    if (!window.confirm('Are you sure you want to publish this menu?')) {
      return;
    }

    setPublishingId(menuId);
    setError('');

    try {
      await menusAPI.publish(menuId);
      alert('Menu published successfully!');
      loadMenus(); // Reload to get updated status
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to publish menu';
      const missing = err.response?.data?.missing;
      
      if (missing && missing.length > 0) {
        const details = missing.map(m => 
          `${m.item} - ${m.ingredient}: ${m.message}`
        ).join('\n');
        alert(`Cannot publish menu:\n\n${details}`);
      } else {
        alert(errorMsg);
      }
      setError(errorMsg);
    } finally {
      setPublishingId(null);
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
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title">Menus</h2>
          <Link to="/school/menus/create">
            <button className="btn btn-primary">Create New Menu</button>
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {menus.length === 0 ? (
          <p style={{ marginTop: '2rem', color: '#666' }}>
            No menus created yet. Click "Create New Menu" to get started.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>School</th>
                <th>Status</th>
                <th>Items</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {menus.map((menu) => {
                const items = JSON.parse(menu.items);
                return (
                  <tr key={menu.id}>
                    <td>{new Date(menu.menu_date).toLocaleDateString()}</td>
                    <td>
                      <span className="badge badge-info">{menu.menu_type}</span>
                    </td>
                    <td>{menu.school_name}</td>
                    <td>
                      <span className={`badge badge-${
                        menu.status === 'published' ? 'success' : 
                        menu.status === 'draft' ? 'warning' : 'info'
                      }`}>
                        {menu.status}
                      </span>
                    </td>
                    <td>{items.length} items</td>
                    <td>
                      {menu.published_at 
                        ? new Date(menu.published_at).toLocaleDateString()
                        : '-'
                      }
                    </td>
                    <td>
                      {menu.status === 'draft' && (
                        <button
                          className="btn btn-success"
                          onClick={() => handlePublish(menu.id)}
                          disabled={publishingId === menu.id}
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                        >
                          {publishingId === menu.id ? 'Publishing...' : 'Publish'}
                        </button>
                      )}
                      {menu.status === 'published' && (
                        <Link to={`/verify/menu/${menu.id}`}>
                          <button 
                            className="btn btn-secondary"
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                          >
                            View
                          </button>
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MenuList;
