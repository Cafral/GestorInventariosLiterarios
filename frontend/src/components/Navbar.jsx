import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../estilos/Navbar.css'

export default function NavBar() {
    const { usuario, logout } = useAuth()
    const navigate = useNavigate()

    return (
        <nav className="navbar-container">
            <Link to="/" className="navbar-brand">ITQ Repositorio</Link>

            <div className="navbar-links-group">
                <Link to="/" className="navbar-link">Inicio</Link>

                {/* Gestión de obras: ADMIN_TI y ADMIN_ACADEMICO */}
                {(usuario?.rol === 'ADMIN_TI' || usuario?.rol === 'ADMIN_ACADEMICO') && (
                    <Link to="/admin/obras" className="navbar-link">Obras</Link>
                )}

                {/* Gestión de usuarios: solo ADMIN_TI */}
                {usuario?.rol === 'ADMIN_TI' && (
                    <Link to="/admin/usuarios" className="navbar-link">Usuarios</Link>
                )}

                {/* Inventario: GESTOR_INVENTARIO y ADMIN_TI */}
                {(usuario?.rol === 'GESTOR_INVENTARIO' || usuario?.rol === 'ADMIN_TI') && (
                    <Link to="/inventario" className="navbar-link">Inventario</Link>
                )}
            </div>

            <div className="navbar-right-section">
                {usuario ? (
                    <>
                        <span className="navbar-badge-role">{usuario.rol}</span>
                        <span className="navbar-username">{usuario.nombre}</span>
                        <button className="navbar-logout-btn"
                            onClick={() => { logout(); navigate('/login') }}>
                            Salir
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="navbar-login-link">Iniciar sesión</Link>
                )}
            </div>
        </nav>
    )
}