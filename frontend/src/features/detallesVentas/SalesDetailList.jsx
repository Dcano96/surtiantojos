import React, { useState, useEffect } from 'react';

const SalesDetailList = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState({ fechaInicio: '', fechaFin: '', estado: '' });

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      const response = await fetch('/api/ventas', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar los detalles de ventas');
      const data = await response.json();
      setVentas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ventasFiltradas = ventas.filter((v) => {
    if (filtro.estado && v.estado !== filtro.estado) return false;
    if (filtro.fechaInicio && new Date(v.createdAt) < new Date(filtro.fechaInicio)) return false;
    if (filtro.fechaFin && new Date(v.createdAt) > new Date(filtro.fechaFin)) return false;
    return true;
  });

  const totalVentas = ventasFiltradas.reduce((sum, v) => sum + (v.total || 0), 0);
  const ventasCompletadas = ventasFiltradas.filter((v) => v.estado === 'completada').length;
  const ventasAnuladas = ventasFiltradas.filter((v) => v.estado === 'anulada').length;

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="sales-detail-container">
      <div className="sales-detail-header">
        <h2>Detalles de Ventas</h2>
      </div>
      {error && <div className="error-message">{error}</div>}

      <div className="filter-bar" style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div>
          <label>Desde: </label>
          <input type="date" value={filtro.fechaInicio}
            onChange={(e) => setFiltro((p) => ({ ...p, fechaInicio: e.target.value }))} />
        </div>
        <div>
          <label>Hasta: </label>
          <input type="date" value={filtro.fechaFin}
            onChange={(e) => setFiltro((p) => ({ ...p, fechaFin: e.target.value }))} />
        </div>
        <select value={filtro.estado} onChange={(e) => setFiltro((p) => ({ ...p, estado: e.target.value }))}>
          <option value="">Todos los estados</option>
          <option value="completada">Completada</option>
          <option value="anulada">Anulada</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ padding: '12px 20px', background: 'rgba(255,107,43,0.08)', borderRadius: '12px', flex: 1, minWidth: '150px' }}>
          <div style={{ fontSize: '12px', color: '#636578' }}>Total Ventas</div>
          <div style={{ fontSize: '22px', fontWeight: 700 }}>${totalVentas.toFixed(2)}</div>
        </div>
        <div style={{ padding: '12px 20px', background: 'rgba(0,200,120,0.08)', borderRadius: '12px', flex: 1, minWidth: '150px' }}>
          <div style={{ fontSize: '12px', color: '#636578' }}>Completadas</div>
          <div style={{ fontSize: '22px', fontWeight: 700 }}>{ventasCompletadas}</div>
        </div>
        <div style={{ padding: '12px 20px', background: 'rgba(232,50,26,0.08)', borderRadius: '12px', flex: 1, minWidth: '150px' }}>
          <div style={{ fontSize: '12px', color: '#636578' }}>Anuladas</div>
          <div style={{ fontSize: '22px', fontWeight: 700 }}>{ventasAnuladas}</div>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Productos</th>
            <th>Método de Pago</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {ventasFiltradas.map((venta) => (
            <tr key={venta._id}>
              <td>{new Date(venta.createdAt).toLocaleDateString()}</td>
              <td>{venta.usuario?.nombre || 'N/A'}</td>
              <td>{venta.productos?.length || 0} productos</td>
              <td>{venta.metodoPago}</td>
              <td>${venta.total?.toFixed(2)}</td>
              <td>{venta.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesDetailList;
