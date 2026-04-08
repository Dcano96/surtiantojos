import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/productos', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar los productos');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        const response = await fetch(`/api/productos/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Error al eliminar');
        setProducts(products.filter((product) => product.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const filteredProducts = products.filter((product) =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h2>Gestión de Productos</h2>
        <Link to="/productos/new" className="btn btn-primary">
          Nuevo Producto
        </Link>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.nombre}</td>
              <td>{product.categoria}</td>
              <td>${product.precio.toFixed(2)}</td>
              <td>{product.stock}</td>
              <td>{product.activo ? 'Activo' : 'Inactivo'}</td>
              <td>
                <Link to={`/productos/${product.id}`} className="btn btn-sm btn-info">
                  Ver
                </Link>
                <Link to={`/productos/${product.id}/edit`} className="btn btn-sm btn-warning">
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
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

export default ProductList;
