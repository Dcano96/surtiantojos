import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/pedidos/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar el pedido');
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!order) return <div className="error-message">Pedido no encontrado</div>;

  return (
    <div className="order-detail-container">
      <div className="detail-header">
        <h2>Pedido #{order.numero}</h2>
        <div className="detail-actions">
          <button onClick={() => navigate(`/pedidos/${id}/edit`)} className="btn btn-warning">
            Editar
          </button>
          <button onClick={() => navigate('/pedidos')} className="btn btn-secondary">
            Volver
          </button>
        </div>
      </div>
      <div className="detail-content">
        <div className="detail-row">
          <span className="label">Cliente:</span>
          <span>{order.cliente}</span>
        </div>
        <div className="detail-row">
          <span className="label">Fecha:</span>
          <span>{new Date(order.fecha).toLocaleDateString()}</span>
        </div>
        <div className="detail-row">
          <span className="label">Estado:</span>
          <span>{order.estado}</span>
        </div>
        <div className="detail-row">
          <span className="label">Total:</span>
          <span>${order.total.toFixed(2)}</span>
        </div>

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
            {order.productos && order.productos.map((producto, index) => (
              <tr key={index}>
                <td>{producto.nombre}</td>
                <td>{producto.cantidad}</td>
                <td>${producto.precio.toFixed(2)}</td>
                <td>${(producto.cantidad * producto.precio).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderDetail;
