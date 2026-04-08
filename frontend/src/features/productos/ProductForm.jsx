import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    precio: 0,
    stock: 0,
    activo: true,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categorias', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar las categorías');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/productos/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar el producto');
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
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const method = id ? 'PUT' : 'POST';
      const endpoint = id ? `/api/productos/${id}` : '/api/productos';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al guardar');
      navigate('/productos');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <h2>{id ? 'Editar Producto' : 'Nuevo Producto'}</h2>
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
          <label htmlFor="categoria">Categoría</label>
          <select
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="precio">Precio</label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            step="0.01"
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="stock">Stock</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
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
            onClick={() => navigate('/productos')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
