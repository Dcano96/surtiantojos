import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true,
  });
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/categorias/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar la categoría');
      const data = await response.json();
      setFormData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const method = id ? 'PUT' : 'POST';
      const endpoint = id ? `/api/categorias/${id}` : '/api/categorias';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al guardar');
      navigate('/categorias');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="category-form-container">
      <h2>{id ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="activo">
            <input
              type="checkbox"
              id="activo"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              disabled={loading}
            />
            Activo
          </label>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/categorias')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
