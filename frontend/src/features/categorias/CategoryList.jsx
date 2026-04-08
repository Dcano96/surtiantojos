import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categorias', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar las categorías');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      try {
        const response = await fetch(`/api/categorias/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Error al eliminar');
        setCategories(categories.filter((category) => category.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="category-list-container">
      <div className="category-list-header">
        <h2>Gestión de Categorías</h2>
        <Link to="/categorias/new" className="btn btn-primary">
          Nueva Categoría
        </Link>
      </div>
      {error && <div className="error-message">{error}</div>}
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Productos</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.nombre}</td>
              <td>{category.descripcion}</td>
              <td>{category.productosCount || 0}</td>
              <td>{category.activo ? 'Activo' : 'Inactivo'}</td>
              <td>
                <Link to={`/categorias/${category.id}`} className="btn btn-sm btn-info">
                  Ver
                </Link>
                <Link to={`/categorias/${category.id}/edit`} className="btn btn-sm btn-warning">
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(category.id)}
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

export default CategoryList;
