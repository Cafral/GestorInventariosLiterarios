import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usuariosApi } from '../api/apiClient'
import { useAuth } from '../context/AuthContext'

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
                // MODO LOGIN: Solo mandamos email y password
                const usuario = await usuariosApi.login({
                    email: form.email,
                    password: form.password
                })
                login(usuario)
                navigate('/')
            } else {
                // MODO REGISTRO: Mandamos todo el paquete
                const nuevoUsuario = await usuariosApi.registrar(form)
                alert("¡Usuario registrado con éxito! Ahora inicia sesión.")
                setIsLogin(true) // Lo mandamos al login para que entre
            }
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div style={css.wrap}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta ITQ'}
            </h2>

            {error && <p style={css.error}>{error}</p>}

            <form onSubmit={handleSubmit}>
                {/* CAMPO NOMBRE: Solo se ve en registro */}
                {!isLogin && (
                    <>
                        <label style={css.label}>Nombre Completo</label>
                        <input style={css.input} type="text" required
                            value={form.nombre}
                            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                    </>
                )}

                <label style={css.label}>Email Institucional</label>
                <input style={css.input} type="email" required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />

                <label style={css.label}>Contraseña</label>
                <input style={css.input} type="password" required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />

                {/* CAMPO ROL: Solo se ve en registro (ejemplificado como select) */}
                {!isLogin && (
                    <>
                        <label style={css.label}>Rol en el Sistema</label>
                        <select style={css.input}
                            value={form.rol}
                            onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}>
                            <option value="ESTUDIANTE">Estudiante</option>
                            <option value="GESTOR_INVENTARIO">Gestor de Inventario</option>
                            <option value="ADMIN_TI">Administrador TI</option>
                        </select>
                    </>
                )}

                <button style={css.btn} type="submit">
                    {isLogin ? 'Entrar' : 'Registrarme'}
                </button>
                
            </form>

            {/* BOTÓN PARA CAMBIAR DE MODO */}
            <button
                onClick={() => setIsLogin(!isLogin)}
                style={{ ...css.btn, background: 'none', color: '#3b82f6', marginTop: '10px', fontSize: '0.85rem' }}
            >
                {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>

            {isLogin && (
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem' }}>
                    Demo: admin1@itq.edu.ec / admin123
                </p>
            )}
        </div>
    )
}

const css = {
    wrap: {
        maxWidth: 380, margin: '4rem auto', padding: '2rem',
        border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff'
    },
    label: { display: 'block', fontSize: '0.85rem', color: '#374151', marginBottom: 4 },
    input: {
        width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
        borderRadius: 8, marginBottom: '1rem', fontSize: '0.95rem',
        boxSizing: 'border-box'
    },
    btn: {
        width: '100%', background: '#3b82f6', color: '#fff', border: 'none',
        borderRadius: 8, padding: 10, cursor: 'pointer', fontSize: '1rem'
    },
    error: {
        background: '#fef2f2', color: '#dc2626', padding: '8px 12px',
        borderRadius: 8, fontSize: '0.85rem', marginBottom: '1rem'
    }
}