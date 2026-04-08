import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const OrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    numero: '',
    cliente: '',
    fecha: new Date().toISOString().split('T')[0],
    productos: [],
    total: 0,
    estado: 'pendiente',
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
    if (id) {
      fetchOrder();
    }
  }, [id]);

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
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/pedidos/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar el pedido');
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

  const handleAddProduct = () => {
    setFormData((prev) => ({
      ...prev,
      productos: [...prev.productos, { productoId: '', cantidad: 1, precio: 0 }],
    }));
  };

  const handleRemoveProduct = (index) => {
    setFormData((prev) => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index),
    }));
  };

  const handleProductChange = (index, field, value) => {
    setFormData((prev) => {
      const newProductos = [...prev.productos];
      newProductos[index][field] = field === 'cantidad' ? parseInt(value) : value;
      return {
        ...prev,
        productos: newProductos,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const method = id ? 'PUT' : 'POST';
      const endpoint = id ? `/api/pedidos/${id}` : '/api/pedidos';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al guardar');
      navigate('/pedidos');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="order-form-container">
      <h2>{id ? 'Editar Pedido' : 'Nuevo Pedido'}</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="numero">Número de Pedido</label>
            <input
              type="text"
              id="numero"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cliente">Cliente</label>
            <input
              type="text"
              id="cliente"
              name="cliente"
              value={formData.cliente}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha">Fecha</label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado</option>
              <option value="enviado">Enviado</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <h3>Productos</h3>
        <div className="products-section">
          {formData.productos.map((producto, index) => (
            <div key={index} className="product-row">
              <select
                value={producto.productoId}
                onChange={(e) => handleProductChange(index, 'productoId', e.target.value)}
                disabled={loading}
              >
                <option value="">Selecciona un producto</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Cantidad"
                value={producto.cantidad}
                onChange={(e) => handleProductChange(index, 'cantidad', e.target.value)}
                min="1"
                disabled={loading}
              />
              <input
                type="number"
                placeholder="Precio"
                value={producto.precio}
                onChange={(e) => handleProductChange(index, 'precio', e.target.value)}
                step="0.01"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => handleRemoveProduct(index)}
                className="btn btn-sm btn-danger"
              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddProduct}
            className="btn btn-secondary"
            disabled={loading}
          >
            Agregar Producto
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="total">Total</label>
          <input
            type="number"
            id="total"
            name="total"
            value={formData.total}
            onChange={handleChange}
            step="0.01"
            required
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/pedidos')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
