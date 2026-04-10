import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const VentasForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productos: [],
    total: 0,
    metodoPago: 'efectivo',
    estado: 'completada',
    notas: '',
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
    if (id) fetchVenta();
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

  const fetchVenta = async () => {
    try {
      const response = await fetch(`/api/ventas/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Error al cargar la venta');
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = () => {
    setFormData((prev) => ({
      ...prev,
      productos: [...prev.productos, { producto: '', cantidad: 1, precio: 0 }],
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
      const total = newProductos.reduce((sum, p) => sum + (p.cantidad * p.precio), 0);
      return { ...prev, productos: newProductos, total };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      const body = { ...formData, usuario: usuario?._id || usuario?.id };
      const method = id ? 'PUT' : 'POST';
      const endpoint = id ? `/api/ventas/${id}` : '/api/ventas';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Error al guardar');
      navigate('/ventas');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="venta-form-container">
      <h2>{id ? 'Editar Venta' : 'Nueva Venta'}</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="metodoPago">Método de Pago</label>
            <select id="metodoPago" name="metodoPago" value={formData.metodoPago} onChange={handleChange} disabled={loading}>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="estado">Estado</label>
            <select id="estado" name="estado" value={formData.estado} onChange={handleChange} disabled={loading}>
              <option value="completada">Completada</option>
              <option value="anulada">Anulada</option>
            </select>
          </div>
        </div>

        <h3>Productos</h3>
        <div className="products-section">
          {formData.productos.map((producto, index) => (
            <div key={index} className="product-row">
              <select
                value={producto.producto}
                onChange={(e) => handleProductChange(index, 'producto', e.target.value)}
                disabled={loading}
              >
                <option value="">Selecciona un producto</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.nombre}</option>
                ))}
              </select>
              <input type="number" placeholder="Cantidad" value={producto.cantidad}
                onChange={(e) => handleProductChange(index, 'cantidad', e.target.value)} min="1" disabled={loading} />
              <input type="number" placeholder="Precio" value={producto.precio}
                onChange={(e) => handleProductChange(index, 'precio', e.target.value)} step="0.01" disabled={loading} />
              <button type="button" onClick={() => handleRemoveProduct(index)} className="btn btn-sm btn-danger">Eliminar</button>
            </div>
          ))}
          <button type="button" onClick={handleAddProduct} className="btn btn-secondary" disabled={loading}>Agregar Producto</button>
        </div>

        <div className="form-group">
          <label htmlFor="total">Total</label>
          <input type="number" id="total" name="total" value={formData.total} readOnly step="0.01" />
        </div>

        <div className="form-group">
          <label htmlFor="notas">Notas</label>
          <textarea id="notas" name="notas" value={formData.notas} onChange={handleChange} disabled={loading} />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" onClick={() => navigate('/ventas')} className="btn btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default VentasForm;
