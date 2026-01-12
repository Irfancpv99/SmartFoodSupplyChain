import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsAPI, schoolsAPI, vendorsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const UploadDocument = () => {
  const [schools, setSchools] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    ddt_number: '',
    school_id: '',
    vendor_id: '',
    document_date: new Date().toISOString().split('T')[0],
    products: [{ name: '', quantity: '', unit: '' }],
  });
  const [documentPhoto, setDocumentPhoto] = useState(null);
  const [documentPdf, setDocumentPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadSchools();
    loadVendors();
  }, []);

  const loadSchools = async () => {
    try {
      const response = await schoolsAPI.getAll();
      setSchools(response.data.schools);
    } catch (err) {
      console.error('Failed to load schools', err);
    }
  };

  const loadVendors = async () => {
    try {
      const response = await vendorsAPI.getAll();
      setVendors(response.data.vendors);
      // Auto-select vendor if user is a vendor
      if (user.vendor_id && response.data.vendors.length > 0) {
        setFormData(prev => ({ ...prev, vendor_id: user.vendor_id }));
      }
    } catch (err) {
      console.error('Failed to load vendors', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    newProducts[index][field] = value;
    setFormData(prev => ({ ...prev, products: newProducts }));
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { name: '', quantity: '', unit: '' }]
    }));
  };

  const removeProduct = (index) => {
    const newProducts = formData.products.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, products: newProducts }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!documentPhoto) {
      setError('Document photo is required');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('ddt_number', formData.ddt_number);
      data.append('school_id', formData.school_id);
      data.append('vendor_id', formData.vendor_id);
      data.append('document_date', formData.document_date);
      data.append('products', JSON.stringify(formData.products));
      data.append('document_photo', documentPhoto);
      
      if (documentPdf) {
        data.append('document_pdf', documentPdf);
      }

      const response = await documentsAPI.create(data);
      
      setSuccess(`Document uploaded successfully! Hash: ${response.data.hash.substring(0, 16)}...`);
      
      setTimeout(() => {
        navigate('/vendor');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Upload DDT/Invoice Document</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">DDT Number *</label>
              <input
                type="text"
                name="ddt_number"
                className="form-control"
                value={formData.ddt_number}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Document Date *</label>
              <input
                type="date"
                name="document_date"
                className="form-control"
                value={formData.document_date}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Vendor *</label>
              <select
                name="vendor_id"
                className="form-control"
                value={formData.vendor_id}
                onChange={handleInputChange}
                required
                disabled={loading || user.vendor_id}
              >
                <option value="">Select Vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">School *</label>
              <select
                name="school_id"
                className="form-control"
                value={formData.school_id}
                onChange={handleInputChange}
                required
                disabled={loading}
              >
                <option value="">Select School</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Products *</label>
            {formData.products.map((product, index) => (
              <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Product name"
                  value={product.name}
                  onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                  required
                  disabled={loading}
                  style={{ flex: 2 }}
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="Quantity"
                  value={product.quantity}
                  onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                  required
                  disabled={loading}
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Unit (kg, pcs)"
                  value={product.unit}
                  onChange={(e) => handleProductChange(index, 'unit', e.target.value)}
                  required
                  disabled={loading}
                  style={{ flex: 1 }}
                />
                {formData.products.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeProduct(index)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addProduct}
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              Add Product
            </button>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Document Photo * (JPEG/PNG, max 10MB)</label>
              <input
                type="file"
                className="form-control"
                accept="image/jpeg,image/png"
                onChange={(e) => setDocumentPhoto(e.target.files[0])}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">PDF Document (Optional, max 25MB)</label>
              <input
                type="file"
                className="form-control"
                accept="application/pdf"
                onChange={(e) => setDocumentPdf(e.target.files[0])}
                disabled={loading}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload Document'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/vendor')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDocument;
