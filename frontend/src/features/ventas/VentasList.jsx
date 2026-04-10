import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const VentasList = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      const response = await fetch('/api/ventas', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar las ventas');
      const data = await response.json();
      setVentas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
      try {
        const response = await fetch(`/api/ventas/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Error al eliminar');
        setVentas(ventas.filter((v) => v._id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="ventas-list-container">
      <div className="ventas-list-header">
        <h2>Gestión de Ventas</h2>
        <Link to="/ventas/new" className="btn btn-primary">
          Nueva Venta
        </Link>
      </div>
      {error && <div className="error-message">{error}</div>}
      <table className="table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Productos</th>
            <th>Total</th>
            <th>Método de Pago</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta._id}>
              <td>{new Date(venta.createdAt).toLocaleDateString()}</td>
              <td>{venta.usuario?.nombre || 'N/A'}</td>
              <td>{venta.productos?.length || 0} productos</td>
              <td>${venta.total?.toFixed(2)}</td>
              <td>{venta.metodoPago}</td>
              <td>{venta.estado}</td>
              <td>
                <Link to={`/ventas/${venta._id}`} className="btn btn-sm btn-info">
                  Ver
                </Link>
                <button
                  onClick={() => handleDelete(venta._id)}
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

export default VentasList;
