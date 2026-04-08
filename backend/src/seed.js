import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import Usuario from './modules/usuarios/usuario.model.js'
import Rol from './modules/roles/rol.model.js'

const MONGO_URI = process.env.MONGO_URI

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Conectado a MongoDB')

    // ── Crear rol administrador si no existe ──
    let rolAdmin = await Rol.findOne({ nombre: 'administrador' })
    if (!rolAdmin) {
      rolAdmin = await Rol.create({
        nombre: 'administrador',
        descripcion: 'Acceso total al sistema',
        permisos: [
          'dashboard', 'productos', 'categorias',
          'pedidos', 'reportes', 'roles', 'usuarios',
        ],
        estado: true,
        esDefault: false,
      })
      console.log('🛡️  Rol "administrador" creado')
    } else {
      console.log('🛡️  Rol "administrador" ya existe')
    }

    // ── Usuarios a crear ──
    const admins = [
      { nombre: 'David Goez',  email: 'dgoez2020@gmail.com' },
      { nombre: 'Ermin Admin', email: 'ermin020@gmail.com'  },
    ]
    const passwordHash = await bcrypt.hash('Codigo123@', 10)

    for (const a of admins) {
      const existe = await Usuario.findOne({ email: a.email })
      if (!existe) {
        await Usuario.create({
          nombre: a.nombre,
          email: a.email,
          password: passwordHash,
          rol: 'administrador',
          estado: true,
        })
        console.log(`👤 Usuario "${a.email}" creado`)
      } else {
        console.log(`👤 Usuario "${a.email}" ya existe`)
      }
    }

    console.log('\n🎉 Seed completado')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error en seed:', err.message)
    process.exit(1)
  }
}

seed()
