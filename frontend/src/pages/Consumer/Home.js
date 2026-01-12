import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

const ConsumerHome = () => {
  const [scanning, setScanning] = useState(false);
  const [manualMenuId, setManualMenuId] = useState('');
  const navigate = useNavigate();

  const startScanning = () => {
    setScanning(true);
    
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: 250 },
        false
      );

      scanner.render(
        (decodedText) => {
          scanner.clear();
          handleScanSuccess(decodedText);
        },
        (error) => {
          // Ignore scan errors (continuous scanning)
        }
      );
    }, 100);
  };

  const handleScanSuccess = (decodedText) => {
    // Extract menu ID from URL
    const match = decodedText.match(/menu\/(\d+)/);
    if (match) {
      const menuId = match[1];
      navigate(`/verify/menu/${menuId}`);
    } else {
      alert('Invalid QR code. Please scan a valid menu QR code.');
      setScanning(false);
    }
  };

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (manualMenuId) {
      navigate(`/verify/menu/${manualMenuId}`);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <h2 className="card-title">Verify Menu</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Scan the QR code on your school menu or enter the menu ID to verify the food source and traceability.
        </p>

        {!scanning ? (
          <>
            <button 
              className="btn btn-primary"
              onClick={startScanning}
              style={{ width: '100%', marginBottom: '2rem', padding: '1rem', fontSize: '1.1rem' }}
            >
              📷 Scan QR Code
            </button>

            <div style={{ textAlign: 'left' }}>
              <p style={{ textAlign: 'center', color: '#999', margin: '2rem 0 1rem' }}>
                - OR -
              </p>

              <form onSubmit={handleManualVerify}>
                <div className="form-group">
                  <label className="form-label">Enter Menu ID</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g., 123"
                    value={manualMenuId}
                    onChange={(e) => setManualMenuId(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  Verify Menu
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <div id="qr-reader" style={{ width: '100%' }}></div>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setScanning(false);
                window.location.reload();
              }}
              style={{ marginTop: '1rem' }}
            >
              Cancel Scanning
            </button>
          </>
        )}

        <div style={{ 
          marginTop: '3rem', 
          padding: '1.5rem', 
          backgroundColor: '#f0f8ff', 
          borderRadius: '8px',
          textAlign: 'left'
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>ℹ️ About Food Traceability</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#555' }}>
            Every menu in our Smart Food Supply Chain system is verified using blockchain technology. 
            When you scan a QR code or enter a menu ID, you can see:
          </p>
          <ul style={{ fontSize: '0.9rem', lineHeight: '1.8', color: '#555', marginLeft: '1.5rem' }}>
            <li>Complete list of ingredients in each dish</li>
            <li>Delivery documents (DDT) for each ingredient</li>
            <li>Vendor information and contact details</li>
            <li>Blockchain verification status</li>
          </ul>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#555', marginTop: '1rem' }}>
            This ensures transparency and food safety for all students.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsumerHome;
