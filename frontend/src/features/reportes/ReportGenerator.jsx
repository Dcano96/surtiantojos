import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ReportGenerator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'ventas',
    fechaInicio: '',
    fechaFin: '',
    incluirDetalles: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const response = await fetch('/api/reportes/generar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al generar reporte');
      const data = await response.json();
      navigate(`/reportes/${data.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="report-generator-container">
      <h2>Generar Reporte</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre del Reporte</label>
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
          <label htmlFor="tipo">Tipo de Reporte</label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="ventas">Ventas</option>
            <option value="productos">Productos</option>
            <option value="usuarios">Usuarios</option>
            <option value="categorias">Categorías</option>
            <option value="inventario">Inventario</option>
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fechaInicio">Fecha Inicio</label>
            <input
              type="date"
              id="fechaInicio"
              name="fechaInicio"
              value={formData.fechaInicio}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="fechaFin">Fecha Fin</label>
            <input
              type="date"
              id="fechaFin"
              name="fechaFin"
              value={formData.fechaFin}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="incluirDetalles">
            <input
              type="checkbox"
              id="incluirDetalles"
              name="incluirDetalles"
              checked={formData.incluirDetalles}
              onChange={handleChange}
              disabled={loading}
            />
            Incluir Detalles
          </label>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Generando...' : 'Generar Reporte'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/reportes')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportGenerator;
