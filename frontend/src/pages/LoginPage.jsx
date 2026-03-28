import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usuariosApi } from '../api/apiClient'
import { useAuth } from '../context/AuthContext'
import '../estilos/LoginPage.css';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '', nombre: '', rol: 'ESTUDIANTE', carrera_id: 1 })
    const [isLogin, setIsLogin] = useState(true)
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            if (isLogin) {
                const usuario = await usuariosApi.login({
                    email: form.email,
                    password: form.password
                })
                login(usuario)
                navigate('/')
            } else {
                await usuariosApi.registrar(form)
                alert("¡Usuario registrado con éxito! Ahora inicia sesión.")
                setIsLogin(true)
            }
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="login-page-wrapper">
            <div className="login-card">
                <h2 className="login-title">
                    {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta ITQ'}
                </h2>

                {/* Mensaje de error resaltado en rojo */}
                {error && <p className="login-error-msg">{error}</p>}

                <form onSubmit={handleSubmit} className="login-form">
                    {!isLogin && (
                        <div className="login-field">
                            <label className="login-label">Nombre Completo</label>
                            <input className="login-input" type="text" required
                                value={form.nombre}
                                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                        </div>
                    )}

                    <div className="login-field">
                        <label className="login-label">Email Institucional</label>
                        <input className="login-input" type="email" required
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>

                    <div className="login-field">
                        <label className="login-label">Contraseña</label>
                        <input className="login-input" type="password" required
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                    </div>

                    {!isLogin && (
                        <div className="login-field">
                            <label className="login-label">Rol en el Sistema</label>
                            <select className="login-input"
                                value={form.rol}
                                onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}>
                                <option value="ESTUDIANTE">Estudiante</option>
                                <option value="GESTOR_INVENTARIO">Gestor de Inventario</option>
                                <option value="ADMIN_TI">Administrador TI</option>
                            </select>
                        </div>
                    )}

                    <button className="login-btn-main" type="submit">
                        {isLogin ? 'Entrar' : 'Registrarme'}
                    </button>
                </form>

                {/* Botón para alternar entre Login y Registro */}
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="login-btn-switch"
                >
                    {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                </button>

                {isLogin && (
                    <div className="login-demo-info">
                        <p>Demo: admin1@itq.edu.ec / admin123</p>
                    </div>
                )}
            </div>
        </div>
    )
}