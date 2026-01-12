import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { verifyAPI } from '../../services/api';

const VerifyMenu = () => {
  const { id } = useParams();
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMenuData();
  }, [id]);

  const loadMenuData = async () => {
    try {
      const response = await verifyAPI.verifyMenu(id);
      setMenuData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify menu');
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

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <h2 className="card-title">❌ Verification Failed</h2>
          <div className="alert alert-error">{error}</div>
        </div>
      </div>
    );
  }

  if (!menuData) {
    return null;
  }

  const { menu, school, documents, verification } = menuData;
  const menuItems = menu.items;

  const getVerificationIcon = () => {
    if (verification.verified && verification.public_chain) {
      return <span className="status-icon verified">✓</span>;
    } else if (verification.verified && verification.private_chain) {
      return <span className="status-icon pending">⏳</span>;
    } else {
      return <span className="status-icon unverified">✗</span>;
    }
  };

  const getVerificationMessage = () => {
    if (verification.verified && verification.public_chain) {
      return 'Verified on Public Blockchain';
    } else if (verification.verified && verification.private_chain) {
      return 'Verified - Pending Public Chain Anchoring';
    } else {
      return 'Not Verified';
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="verification-status">
          {getVerificationIcon()}
          <h2 style={{ margin: '0 0 0.5rem 0' }}>{getVerificationMessage()}</h2>
        </div>
        
        {verification.verified && (
          <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
            <p>Blockchain Hash: <code style={{ fontSize: '0.8rem' }}>{verification.hash?.substring(0, 32)}...</code></p>
            {verification.tx_hash && (
              <p>Transaction: <code style={{ fontSize: '0.8rem' }}>{verification.tx_hash.substring(0, 20)}...</code></p>
            )}
            <p>Verified {verification.verification_count} times</p>
          </div>
        )}
      </div>

      {/* School Information */}
      <div className="card">
        <h3 className="card-title">School Information</h3>
        <div className="grid grid-2">
          <div>
            <p><strong>School:</strong> {school.name}</p>
            <p><strong>Address:</strong> {school.address}</p>
          </div>
          <div>
            <p><strong>Region:</strong> {school.region}</p>
            <p><strong>Menu Date:</strong> {new Date(menu.menu_date).toLocaleDateString('it-IT', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="card">
        <h3 className="card-title">Menu - {menu.menu_type === 'daily' ? 'Daily' : 'Weekly'}</h3>
        
        {menuItems.map((item, index) => (
          <div key={index} style={{ 
            marginBottom: '2rem',
            padding: '1.5rem',
            border: '2px solid #3498db',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
          }}>
            <h4 style={{ 
              color: '#2c3e50', 
              marginBottom: '1rem',
              fontSize: '1.3rem',
              borderBottom: '2px solid #3498db',
              paddingBottom: '0.5rem'
            }}>
              {item.name}
            </h4>
            
            <div style={{ marginLeft: '1rem' }}>
              <h5 style={{ color: '#34495e', marginBottom: '0.75rem' }}>Ingredients:</h5>
              {item.ingredients && item.ingredients.map((ingredient, idx) => {
                // Find linked documents for this ingredient
                const linkedDocs = documents.filter(doc => 
                  doc.menu_item_name === item.name && 
                  doc.ingredient_name === ingredient.name
                );

                return (
                  <div key={idx} style={{ 
                    marginBottom: '1rem',
                    paddingLeft: '1rem',
                    borderLeft: '3px solid #27ae60'
                  }}>
                    <p style={{ 
                      fontWeight: 'bold', 
                      color: '#27ae60',
                      marginBottom: '0.5rem'
                    }}>
                      • {ingredient.name}
                    </p>
                    
                    {linkedDocs.length > 0 && (
                      <div style={{ 
                        marginLeft: '1rem',
                        fontSize: '0.9rem',
                        color: '#555'
                      }}>
                        {linkedDocs.map((doc, docIdx) => (
                          <div key={docIdx} style={{ 
                            marginBottom: '0.5rem',
                            padding: '0.75rem',
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                          }}>
                            <p style={{ margin: '0.25rem 0' }}>
                              <strong>DDT:</strong> {doc.ddt_number}
                            </p>
                            <p style={{ margin: '0.25rem 0' }}>
                              <strong>Vendor:</strong> {doc.vendor_name}
                            </p>
                            <p style={{ margin: '0.25rem 0' }}>
                              <strong>Date:</strong> {new Date(doc.document_date).toLocaleDateString()}
                            </p>
                            {doc.document_hash && (
                              <p style={{ margin: '0.25rem 0', fontSize: '0.8rem', color: '#666' }}>
                                <strong>Hash:</strong> <code>{doc.document_hash.substring(0, 16)}...</code>
                              </p>
                            )}
                            {doc.public_chain_anchored_at && (
                              <span className="badge badge-success" style={{ marginTop: '0.25rem' }}>
                                ✓ Blockchain Verified
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* All Vendors */}
      <div className="card">
        <h3 className="card-title">Supplier Information</h3>
        
        {/* Get unique vendors */}
        {Array.from(new Set(documents.map(d => d.vendor_name))).map((vendorName, index) => {
          const vendorDoc = documents.find(d => d.vendor_name === vendorName);
          return (
            <div key={index} style={{ 
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{vendorName}</h4>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                <strong>VAT:</strong> {vendorDoc.vendor_vat || 'N/A'}
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                <strong>Address:</strong> {vendorDoc.vendor_address || 'N/A'}
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                <strong>Contact:</strong> {vendorDoc.vendor_email || 'N/A'}
              </p>
            </div>
          );
        })}
      </div>

      {/* QR Code */}
      {menu.qr_code_url && (
        <div className="card qr-container">
          <h3 className="card-title">Menu QR Code</h3>
          <img 
            src={menu.qr_code_url} 
            alt="Menu QR Code" 
            className="qr-code"
          />
          <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
            Scan this code to verify this menu
          </p>
        </div>
      )}

      {/* Footer Info */}
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        color: '#666',
        fontSize: '0.9rem'
      }}>
        <p>
          This menu has been verified using blockchain technology to ensure food traceability and safety.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          Published: {new Date(menu.published_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default VerifyMenu;
