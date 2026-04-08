import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reportes', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar los reportes');
      const data = await response.json();
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      try {
        const response = await fetch(`/api/reportes/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Error al eliminar');
        setReports(reports.filter((report) => report.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await fetch(`/api/reportes/${id}/download`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al descargar');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="report-list-container">
      <div className="report-list-header">
        <h2>Gestión de Reportes</h2>
        <Link to="/reportes/new" className="btn btn-primary">
          Generar Reporte
        </Link>
      </div>
      {error && <div className="error-message">{error}</div>}
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Fecha de Generación</th>
            <th>Creado por</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.nombre}</td>
              <td>{report.tipo}</td>
              <td>{new Date(report.fechaGeneracion).toLocaleDateString()}</td>
              <td>{report.creadoPor}</td>
              <td>
                <Link to={`/reportes/${report.id}`} className="btn btn-sm btn-info">
                  Ver
                </Link>
                <button
                  onClick={() => handleDownload(report.id)}
                  className="btn btn-sm btn-success"
                >
                  Descargar
                </button>
                <button
                  onClick={() => handleDelete(report.id)}
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

export default ReportList;
