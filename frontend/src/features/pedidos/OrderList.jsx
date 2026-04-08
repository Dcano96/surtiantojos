import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/pedidos', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar los pedidos');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      try {
        const response = await fetch(`/api/pedidos/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Error al eliminar');
        setOrders(orders.filter((order) => order.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const filteredOrders = filterStatus
    ? orders.filter((order) => order.estado === filterStatus)
    : orders;

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="order-list-container">
      <div className="order-list-header">
        <h2>Gestión de Pedidos</h2>
        <Link to="/pedidos/new" className="btn btn-primary">
          Nuevo Pedido
        </Link>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="filter-bar">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="enviado">Enviado</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id}>
              <td>#{order.numero}</td>
              <td>{order.cliente}</td>
              <td>{new Date(order.fecha).toLocaleDateString()}</td>
              <td>${order.total.toFixed(2)}</td>
              <td>{order.estado}</td>
              <td>
                <Link to={`/pedidos/${order.id}`} className="btn btn-sm btn-info">
                  Ver
                </Link>
                <Link to={`/pedidos/${order.id}/edit`} className="btn btn-sm btn-warning">
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(order.id)}
                  className="btn btn-sm btn-danger"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList;
