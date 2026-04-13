import express from 'express'
import cors from 'cors'
import authRoutes from './modules/auth/auth.routes.js'
import productoRoutes from './modules/productos/producto.routes.js'
import categoriaRoutes from './modules/categorias/categoria.routes.js'
import pedidoRoutes from './modules/pedidos/pedido.routes.js'
import usuarioRoutes from './modules/usuarios/usuario.routes.js'
import rolRoutes from './modules/roles/rol.routes.js'
import ventaRoutes from './modules/ventas/venta.routes.js'
import clienteRoutes from './modules/clientes/cliente.routes.js'

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/productos', productoRoutes)
app.use('/api/categorias', categoriaRoutes)
app.use('/api/pedidos', pedidoRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/roles', rolRoutes)
app.use('/api/ventas', ventaRoutes)
app.use('/api/clientes', clienteRoutes)

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API Surti Antojos funcionando 🚀')
})

export default app
