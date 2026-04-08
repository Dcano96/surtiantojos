import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/productos/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar el producto');
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!product) return <div className="error-message">Producto no encontrado</div>;

  return (
    <div className="product-detail-container">
      <div className="detail-header">
        <h2>{product.nombre}</h2>
        <div className="detail-actions">
          <button onClick={() => navigate(`/productos/${id}/edit`)} className="btn btn-warning">
            Editar
          </button>
          <button onClick={() => navigate('/productos')} className="btn btn-secondary">
            Volver
          </button>
        </div>
      </div>
      <div className="detail-content">
        <div className="detail-row">
          <span className="label">Descripción:</span>
          <span>{product.descripcion}</span>
        </div>
        <div className="detail-row">
          <span className="label">Categoría:</span>
          <span>{product.categoria}</span>
        </div>
        <div className="detail-row">
          <span className="label">Precio:</span>
          <span>${product.precio.toFixed(2)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Stock:</span>
          <span>{product.stock}</span>
        </div>
        <div className="detail-row">
          <span className="label">Estado:</span>
          <span>{product.activo ? 'Activo' : 'Inactivo'}</span>
        </div>
        <div className="detail-row">
          <span className="label">Fecha de Creación:</span>
          <span>{new Date(product.fechaCreacion).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
