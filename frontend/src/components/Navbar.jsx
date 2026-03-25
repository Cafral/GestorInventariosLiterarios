import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
    const { usuario, logout } = useAuth()
    const navigate = useNavigate()

    return (
        <nav style={css.nav}>
            <Link to="/" style={css.brand}>ITQ Repositorio</Link>

            <div style={css.links}>
                <Link to="/" style={css.link}>Inicio</Link>
                {usuario?.rol?.includes('ADMIN') &&
                    <Link to="/admin/obras" style={css.link}>Obras</Link>}
                {(usuario?.rol === 'GESTOR_INVENTARIO' || usuario?.rol === 'ADMIN_TI') &&
                    <Link to="/inventario" style={css.link}>Inventario</Link>}
            </div>

            <div style={css.right}>
                {usuario ? (
                    <>
                        <span style={css.badge}>{usuario.rol}</span>
                        <span style={css.nombre}>{usuario.nombre}</span>
                        <button style={css.btn} onClick={() => { logout(); navigate('/login') }}>
                            Salir
                        </button>
                    </>
                ) : (
                    <Link to="/login" style={{ ...css.link, color: '#60a5fa' }}>
                        Iniciar sesión
                    </Link>
                )}
            </div>
        </nav>
    )
}

const css = {
    nav: {
        background: '#1e293b', color: '#fff', padding: '0 2rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem', height: 56
    },
    brand: { color: '#fff', fontWeight: 700, textDecoration: 'none', marginRight: 8 },
    links: { display: 'flex', gap: '1rem', flex: 1 },
    link: { color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' },
    right: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' },
    badge: {
        background: '#3b82f6', color: '#fff', borderRadius: 9999,
        padding: '2px 10px', fontSize: '0.75rem'
    },
    nombre: { fontSize: '0.85rem', color: '#cbd5e1' },
    btn: {
        background: '#ef4444', color: '#fff', border: 'none',
        borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: '0.85rem'
    }
}