const BASE = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : '/api'

async function req(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Error del servidor')
    return data
}

const post = (path, body) => req(path, { method: 'POST', body: JSON.stringify(body) })
const put = (path, body) => req(path, { method: 'PUT', body: JSON.stringify(body) })
const del = (path) => req(path, { method: 'DELETE' })

export const obrasApi = {
    listar: () => req('/obras'),
    listarCarrera: (id) => req(`/obras?carreraId=${id}`),
    buscar: (id) => req(`/obras/${id}`),
    crear: (body) => post('/obras', body),
    cambiarEstado: (id, body) => put(`/obras/${id}/estado`, body),
    valorar: (id, pts) => post(`/obras/${id}/valorar`, { puntuacion: pts }),
    eliminar: (id) => del(`/obras/${id}`)
}

export const usuariosApi = {
    listar: () => req('/usuarios'),
    registrar: (body) => post('/usuarios/registro', body),
    login: (body) => post('/usuarios/login', body)
}

export const inventarioApi = {
    ingresarLote: (body) => post('/inventario/ingreso', body),
    vender: (body) => post('/inventario/venta', body),
    reporte: () => req('/inventario/reporte'),
    transacciones: () => req('/inventario/transacciones'),
    transaccionesObra: (id) => req(`/inventario/transacciones/${id}`)
}