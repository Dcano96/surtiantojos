import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const VentasDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVenta();
  }, [id]);

  const fetchVenta = async () => {
    try {
      const response = await fetch(`/api/ventas/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar la venta');
      const data = await response.json();
      setVenta(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!venta) return <div className="error-message">Venta no encontrada</div>;

  return (
    <div className="venta-detail-container">
      <div className="detail-header">
        <h2>Detalle de Venta</h2>
        <div className="detail-actions">
          <button onClick={() => navigate('/ventas')} className="btn btn-secondary">Volver</button>
        </div>
      </div>
      <div className="detail-content">
        <div className="detail-row">
          <span className="label">Fecha:</span>
          <span>{new Date(venta.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="detail-row">
          <span className="label">Cliente:</span>
          <span>{venta.usuario?.nombre || 'N/A'}</span>
        </div>
        <div className="detail-row">
          <span className="label">Método de Pago:</span>
          <span>{venta.metodoPago}</span>
        </div>
        <div className="detail-row">
          <span className="label">Estado:</span>
          <span>{venta.estado}</span>
        </div>
        <div className="detail-row">
          <span className="label">Total:</span>
          <span>${venta.total?.toFixed(2)}</span>
        </div>
        {venta.notas && (
          <div className="detail-row">
            <span className="label">Notas:</span>
            <span>{venta.notas}</span>
          </div>
        )}

        <h3>Productos</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {venta.productos?.map((p, index) => (
              <tr key={index}>
                <td>{p.producto?.nombre || 'N/A'}</td>
                <td>{p.cantidad}</td>
                <td>${p.precio?.toFixed(2)}</td>
                <td>${(p.cantidad * p.precio)?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VentasDetail;
