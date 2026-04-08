import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar los roles');
      const data = await response.json();
      setRoles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      try {
        const response = await fetch(`/api/roles/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Error al eliminar');
        setRoles(roles.filter((role) => role.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="role-list-container">
      <div className="role-list-header">
        <h2>Gestión de Roles</h2>
        <Link to="/roles/new" className="btn btn-primary">
          Nuevo Rol
        </Link>
      </div>
      {error && <div className="error-message">{error}</div>}
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Permisos</th>
            <th>Usuarios</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.nombre}</td>
              <td>{role.descripcion}</td>
              <td>{role.permisos ? role.permisos.length : 0}</td>
              <td>{role.usuariosCount || 0}</td>
              <td>
                <Link to={`/roles/${role.id}`} className="btn btn-sm btn-info">
                  Ver
                </Link>
                <Link to={`/roles/${role.id}/edit`} className="btn btn-sm btn-warning">
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(role.id)}
                  className="btn btn-sm btn-danger"
                  disabled={role.esDefault}
                  title={role.esDefault ? 'No se puede eliminar un rol por defecto' : ''}
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

export default RoleList;
