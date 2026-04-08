import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reportes/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar el reporte');
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
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
  if (error) return <div className="error-message">{error}</div>;
  if (!report) return <div className="error-message">Reporte no encontrado</div>;

  return (
    <div className="report-detail-container">
      <div className="detail-header">
        <h2>{report.nombre}</h2>
        <div className="detail-actions">
          <button onClick={handleDownload} className="btn btn-success">
            Descargar
          </button>
          <button onClick={() => navigate('/reportes')} className="btn btn-secondary">
            Volver
          </button>
        </div>
      </div>
      <div className="detail-content">
        <div className="detail-row">
          <span className="label">Tipo:</span>
          <span>{report.tipo}</span>
        </div>
        <div className="detail-row">
          <span className="label">Fecha de Generación:</span>
          <span>{new Date(report.fechaGeneracion).toLocaleDateString()}</span>
        </div>
        <div className="detail-row">
          <span className="label">Creado por:</span>
          <span>{report.creadoPor}</span>
        </div>
        <div className="detail-row">
          <span className="label">Fecha Inicio:</span>
          <span>{report.fechaInicio ? new Date(report.fechaInicio).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div className="detail-row">
          <span className="label">Fecha Fin:</span>
          <span>{report.fechaFin ? new Date(report.fechaFin).toLocaleDateString() : 'N/A'}</span>
        </div>
        
        {report.datos && (
          <>
            <h3>Datos del Reporte</h3>
            <div className="report-data">
              <pre>{JSON.stringify(report.datos, null, 2)}</pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportDetail;
