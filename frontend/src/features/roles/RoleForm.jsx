import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const RoleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    permisos: [],
  });
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPermissions();
    if (id) {
      fetchRole();
    }
  }, [id]);

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permisos', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar los permisos');
      const data = await response.json();
      setAvailablePermissions(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchRole = async () => {
    try {
      const response = await fetch(`/api/roles/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar el rol');
      const data = await response.json();
      setFormData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData((prev) => ({
      ...prev,
      permisos: prev.permisos.includes(permissionId)
        ? prev.permisos.filter((p) => p !== permissionId)
        : [...prev.permisos, permissionId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const method = id ? 'PUT' : 'POST';
      const endpoint = id ? `/api/roles/${id}` : '/api/roles';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al guardar');
      navigate('/roles');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="role-form-container">
      <h2>{id ? 'Editar Rol' : 'Nuevo Rol'}</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
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
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        
        <h3>Permisos</h3>
        <div className="permissions-grid">
          {availablePermissions.map((permission) => (
            <div key={permission.id} className="permission-item">
              <label>
                <input
                  type="checkbox"
                  checked={formData.permisos.includes(permission.id)}
                  onChange={() => handlePermissionToggle(permission.id)}
                  disabled={loading}
                />
                {permission.nombre}
              </label>
              <span className="permission-description">{permission.descripcion}</span>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/roles')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm;
