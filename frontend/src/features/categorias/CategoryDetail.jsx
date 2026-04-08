import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/categorias/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar la categoría');
      const data = await response.json();
      setCategory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!category) return <div className="error-message">Categoría no encontrada</div>;

  return (
    <div className="category-detail-container">
      <div className="detail-header">
        <h2>{category.nombre}</h2>
        <div className="detail-actions">
          <button onClick={() => navigate(`/categorias/${id}/edit`)} className="btn btn-warning">
            Editar
          </button>
          <button onClick={() => navigate('/categorias')} className="btn btn-secondary">
            Volver
          </button>
        </div>
      </div>
      <div className="detail-content">
        <div className="detail-row">
          <span className="label">Descripción:</span>
          <span>{category.descripcion}</span>
        </div>
        <div className="detail-row">
          <span className="label">Productos:</span>
          <span>{category.productosCount || 0}</span>
        </div>
        <div className="detail-row">
          <span className="label">Estado:</span>
          <span>{category.activo ? 'Activo' : 'Inactivo'}</span>
        </div>
        <div className="detail-row">
          <span className="label">Fecha de Creación:</span>
          <span>{new Date(category.fechaCreacion).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail;
