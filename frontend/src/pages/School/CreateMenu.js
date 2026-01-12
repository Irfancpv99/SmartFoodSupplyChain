import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menusAPI, documentsAPI, schoolsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CreateMenu = () => {
  const [schools, setSchools] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [formData, setFormData] = useState({
    school_id: '',
    menu_date: new Date().toISOString().split('T')[0],
    menu_type: 'daily',
    items: [
      {
        name: '',
        ingredients: [
          { name: '', document_ids: [] }
        ]
      }
    ],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const response = await schoolsAPI.getAll();
        setSchools(response.data.schools);
        // Auto-select school if user is school admin
        if (user.school_id && response.data.schools.length > 0) {
          setFormData(prev => ({ ...prev, school_id: user.school_id }));
        }
      } catch (err) {
        console.error('Failed to load schools', err);
      }
    };

    const loadDocuments = async () => {
      try {
        const response = await documentsAPI.getAll();
        setDocuments(response.data.documents.filter(d => d.status === 'verified'));
      } catch (err) {
        console.error('Failed to load documents', err);
      }
    };

    loadSchools();
    loadDocuments();
  }, [user.school_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (itemIndex, field, value) => {
    const newItems = [...formData.items];
    newItems[itemIndex][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleIngredientChange = (itemIndex, ingredientIndex, field, value) => {
    const newItems = [...formData.items];
    newItems[itemIndex].ingredients[ingredientIndex][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleDocumentSelection = (itemIndex, ingredientIndex, documentId) => {
    const newItems = [...formData.items];
    const ingredient = newItems[itemIndex].ingredients[ingredientIndex];
    
    if (ingredient.document_ids.includes(documentId)) {
      ingredient.document_ids = ingredient.document_ids.filter(id => id !== documentId);
    } else {
      ingredient.document_ids = [...ingredient.document_ids, documentId];
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { name: '', ingredients: [{ name: '', document_ids: [] }] }
      ]
    }));
  };

  const removeItem = (itemIndex) => {
    const newItems = formData.items.filter((_, i) => i !== itemIndex);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addIngredient = (itemIndex) => {
    const newItems = [...formData.items];
    newItems[itemIndex].ingredients.push({ name: '', document_ids: [] });
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const removeIngredient = (itemIndex, ingredientIndex) => {
    const newItems = [...formData.items];
    newItems[itemIndex].ingredients = newItems[itemIndex].ingredients.filter(
      (_, i) => i !== ingredientIndex
    );
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await menusAPI.create(formData);
      setSuccess('Menu created successfully!');
      
      setTimeout(() => {
        navigate('/school/menus');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create menu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Create Menu</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">School *</label>
              <select
                name="school_id"
                className="form-control"
                value={formData.school_id}
                onChange={handleInputChange}
                required
                disabled={loading || user.school_id}
              >
                <option value="">Select School</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Menu Date *</label>
              <input
                type="date"
                name="menu_date"
                className="form-control"
                value={formData.menu_date}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Menu Type *</label>
            <select
              name="menu_type"
              className="form-control"
              value={formData.menu_type}
              onChange={handleInputChange}
              required
              disabled={loading}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Menu Items *</label>
            
            {formData.items.map((item, itemIndex) => (
              <div key={itemIndex} style={{ 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                padding: '1rem', 
                marginBottom: '1rem',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0 }}>Menu Item {itemIndex + 1}</h4>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeItem(itemIndex)}
                      disabled={loading}
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                    >
                      Remove Item
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Dish name (e.g., Pasta al Pomodoro)"
                    value={item.name}
                    onChange={(e) => handleItemChange(itemIndex, 'name', e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <label className="form-label">Ingredients</label>
                {item.ingredients.map((ingredient, ingredientIndex) => (
                  <div key={ingredientIndex} style={{ 
                    marginBottom: '1rem',
                    paddingLeft: '1rem',
                    borderLeft: '3px solid #3498db'
                  }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ingredient name (e.g., Tomatoes)"
                        value={ingredient.name}
                        onChange={(e) => handleIngredientChange(itemIndex, ingredientIndex, 'name', e.target.value)}
                        required
                        disabled={loading}
                        style={{ flex: 1 }}
                      />
                      {item.ingredients.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => removeIngredient(itemIndex, ingredientIndex)}
                          disabled={loading}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div style={{ marginLeft: '1rem' }}>
                      <label style={{ fontSize: '0.875rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
                        Link DDT Documents (select at least one):
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '150px', overflowY: 'auto' }}>
                        {documents.length === 0 ? (
                          <p style={{ fontSize: '0.875rem', color: '#999' }}>No verified documents available</p>
                        ) : (
                          documents.map(doc => (
                            <label key={doc.id} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              fontSize: '0.875rem',
                              padding: '0.25rem',
                              cursor: 'pointer'
                            }}>
                              <input
                                type="checkbox"
                                checked={ingredient.document_ids.includes(doc.id)}
                                onChange={() => handleDocumentSelection(itemIndex, ingredientIndex, doc.id)}
                                disabled={loading}
                                style={{ marginRight: '0.5rem' }}
                              />
                              DDT {doc.ddt_number} - {doc.vendor_name} ({new Date(doc.document_date).toLocaleDateString()})
                            </label>
                          ))
                        )}
                      </div>
                      {ingredient.document_ids.length === 0 && (
                        <p style={{ fontSize: '0.75rem', color: '#e74c3c', marginTop: '0.25rem' }}>
                          ⚠ At least one DDT must be selected
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => addIngredient(itemIndex)}
                  disabled={loading}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  Add Ingredient
                </button>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-primary"
              onClick={addItem}
              disabled={loading}
            >
              Add Menu Item
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Menu'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/school/menus')}
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

export default CreateMenu;
