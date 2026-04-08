import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const RoleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRole();
  }, [id]);

  const fetchRole = async () => {
    try {
      const response = await fetch(`/api/roles/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar el rol');
      const data = await response.json();
      setRole(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!role) return <div className="error-message">Rol no encontrado</div>;

  return (
    <div className="role-detail-container">
      <div className="detail-header">
        <h2>{role.nombre}</h2>
        <div className="detail-actions">
          <button onClick={() => navigate(`/roles/${id}/edit`)} className="btn btn-warning">
            Editar
          </button>
          <button onClick={() => navigate('/roles')} className="btn btn-secondary">
            Volver
          </button>
        </div>
      </div>
      <div className="detail-content">
        <div className="detail-row">
          <span className="label">Descripción:</span>
          <span>{role.descripcion}</span>
        </div>
        <div className="detail-row">
          <span className="label">Es Default:</span>
          <span>{role.esDefault ? 'Sí' : 'No'}</span>
        </div>
        <div className="detail-row">
          <span className="label">Usuarios:</span>
          <span>{role.usuariosCount || 0}</span>
        </div>

        <h3>Permisos ({role.permisos ? role.permisos.length : 0})</h3>
        {role.permisos && role.permisos.length > 0 ? (
          <ul className="permissions-list">
            {role.permisos.map((permission, index) => (
              <li key={index}>{permission.nombre}</li>
            ))}
          </ul>
        ) : (
          <p>No tiene permisos asignados</p>
        )}

        <div className="detail-row">
          <span className="label">Fecha de Creación:</span>
          <span>{new Date(role.fechaCreacion).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default RoleDetail;
