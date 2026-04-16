import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './modules/auth/auth.routes.js'
import productoRoutes from './modules/productos/producto.routes.js'
import categoriaRoutes from './modules/categorias/categoria.routes.js'
import pedidoRoutes from './modules/pedidos/pedido.routes.js'
import usuarioRoutes from './modules/usuarios/usuario.routes.js'
import rolRoutes from './modules/roles/rol.routes.js'
import ventaRoutes from './modules/ventas/venta.routes.js'
import clienteRoutes from './modules/clientes/cliente.routes.js'
import inventarioRoutes from './modules/inventario/inventario.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Servir archivos subidos
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/productos', productoRoutes)
app.use('/api/categorias', categoriaRoutes)
app.use('/api/pedidos', pedidoRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/roles', rolRoutes)
app.use('/api/ventas', ventaRoutes)
app.use('/api/clientes', clienteRoutes)
app.use('/api/inventario', inventarioRoutes)

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API Surti Antojos funcionando 🚀')
})

export default app
