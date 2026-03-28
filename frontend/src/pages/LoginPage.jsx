import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usuariosApi, carrerasApi } from '../api/apiClient'
import { useAuth } from '../context/AuthContext'
import '../estilos/LoginPage.css'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [carreras, setCarreras] = useState([])
    const [error, setError] = useState('')
    const [errores, setErrores] = useState({})
    const [cargando, setCargando] = useState(false)

    const [loginForm, setLoginForm] = useState({ email: '', password: '' })
    const [regForm, setRegForm] = useState({
        nombre: '', email: '', password: '', confirmar: '', carrera_id: ''
    })

    const { login } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        carrerasApi.listar().then(setCarreras).catch(() => { })
    }, [])

    // ── Validaciones ──────────────────────────────────────────
    const validarLogin = () => {
        const e = {}
        if (!loginForm.email.trim()) e.email = 'El email es obligatorio'
        else if (!loginForm.email.includes('@')) e.email = 'Email inválido'
        if (!loginForm.password) e.password = 'La contraseña es obligatoria'
        return e
    }

    const validarRegistro = () => {
        const e = {}
        if (!regForm.nombre.trim()) e.nombre = 'El nombre es obligatorio'
        if (!regForm.email.includes('@')) e.email = 'Email inválido'
        if (regForm.password.length < 6) e.password = 'Mínimo 6 caracteres'
        if (regForm.password !== regForm.confirmar) e.confirmar = 'Las contraseñas no coinciden'
        if (!regForm.carrera_id) e.carrera_id = 'Selecciona tu carrera'
        return e
    }

    // ── Submit login ──────────────────────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        const ev = validarLogin()
        if (Object.keys(ev).length) { setErrores(ev); return }
        setErrores({})
        setCargando(true)
        try {
            const usuario = await usuariosApi.login({
                email: loginForm.email.trim(),
                password: loginForm.password
            })
            login(usuario)
            navigate('/')
        } catch (err) {
            setError(err.message)
        } finally {
            setCargando(false)
        }
    }

    // ── Submit registro (solo ESTUDIANTE) ────────────────────
    const handleRegistro = async (e) => {
        e.preventDefault()
        setError('')
        const ev = validarRegistro()
        if (Object.keys(ev).length) { setErrores(ev); return }
        setErrores({})
        setCargando(true)
        try {
            await usuariosApi.registrar({
                nombre: regForm.nombre.trim(),
                email: regForm.email.trim(),
                password: regForm.password,
                carrera_id: parseInt(regForm.carrera_id)
                // rol forzado a ESTUDIANTE en el backend
            })
            alert('¡Registro exitoso! Ahora inicia sesión.')
            setIsLogin(true)
            setRegForm({ nombre: '', email: '', password: '', confirmar: '', carrera_id: '' })
        } catch (err) {
            setError(err.message)
        } finally {
            setCargando(false)
        }
    }

    const cambiarLogin = (e) => {
        setLoginForm(f => ({ ...f, [e.target.name]: e.target.value }))
        setErrores(er => ({ ...er, [e.target.name]: '' }))
        setError('')
    }
    const cambiarReg = (e) => {
        setRegForm(f => ({ ...f, [e.target.name]: e.target.value }))
        setErrores(er => ({ ...er, [e.target.name]: '' }))
        setError('')
    }

    return (
        <div className="login-page-wrapper">
            <div className="login-card">
                <h2 className="login-title">
                    {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta ITQ'}
                </h2>

                {error && <p className="login-error-msg">{error}</p>}

                {/* ── FORMULARIO LOGIN ── */}
                {isLogin ? (
                    <form onSubmit={handleLogin} className="login-form" noValidate>

                        <div className="login-field">
                            <label className="login-label">Email</label>
                            <input
                                className={`login-input${errores.email ? ' input-error' : ''}`}
                                type="email" name="email" autoComplete="email"
                                value={loginForm.email} onChange={cambiarLogin}
                            />
                            {errores.email && <span className="field-error">{errores.email}</span>}
                        </div>

                        <div className="login-field">
                            <label className="login-label">Contraseña</label>
                            <input
                                className={`login-input${errores.password ? ' input-error' : ''}`}
                                type="password" name="password" autoComplete="current-password"
                                value={loginForm.password} onChange={cambiarLogin}
                            />
                            {errores.password && <span className="field-error">{errores.password}</span>}
                        </div>

                        <button className="login-btn-main" type="submit" disabled={cargando}>
                            {cargando ? 'Ingresando...' : 'Entrar'}
                        </button>

                        <div className="login-demo-info">
                            <p>Demo invitado: invitado@gmail.com / invitado123</p>
                        </div>
                    </form>

                ) : (
                    /* ── FORMULARIO REGISTRO (ESTUDIANTE) ── */
                    <form onSubmit={handleRegistro} className="login-form" noValidate>

                        <div className="login-field">
                            <label className="login-label">Nombre Completo *</label>
                            <input
                                className={`login-input${errores.nombre ? ' input-error' : ''}`}
                                type="text" name="nombre" autoComplete="name"
                                value={regForm.nombre} onChange={cambiarReg}
                            />
                            {errores.nombre && <span className="field-error">{errores.nombre}</span>}
                        </div>

                        <div className="login-field">
                            <label className="login-label">Email Institucional *</label>
                            <input
                                className={`login-input${errores.email ? ' input-error' : ''}`}
                                type="email" name="email" autoComplete="email"
                                value={regForm.email} onChange={cambiarReg}
                            />
                            {errores.email && <span className="field-error">{errores.email}</span>}
                        </div>

                        <div className="login-field">
                            <label className="login-label">Contraseña * (mínimo 6 caracteres)</label>
                            <input
                                className={`login-input${errores.password ? ' input-error' : ''}`}
                                type="password" name="password" autoComplete="new-password"
                                value={regForm.password} onChange={cambiarReg}
                            />
                            {errores.password && <span className="field-error">{errores.password}</span>}
                        </div>

                        <div className="login-field">
                            <label className="login-label">Confirmar Contraseña *</label>
                            <input
                                className={`login-input${errores.confirmar ? ' input-error' : ''}`}
                                type="password" name="confirmar" autoComplete="new-password"
                                value={regForm.confirmar} onChange={cambiarReg}
                            />
                            {errores.confirmar && <span className="field-error">{errores.confirmar}</span>}
                        </div>

                        <div className="login-field">
                            <label className="login-label">Carrera *</label>
                            <select
                                className={`login-input${errores.carrera_id ? ' input-error' : ''}`}
                                name="carrera_id"
                                value={regForm.carrera_id} onChange={cambiarReg}
                            >
                                <option value="">Selecciona tu carrera</option>
                                {carreras.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                            </select>
                            {errores.carrera_id && <span className="field-error">{errores.carrera_id}</span>}
                        </div>

                        <div className="login-field">
                            <label className="login-label">Rol asignado</label>
                            <input className="login-input login-input-disabled" type="text" value="Estudiante" disabled/>
                        </div>

                        <button className="login-btn-main" type="submit" disabled={cargando}>
                            {cargando ? 'Registrando...' : 'Registrarme'}
                        </button>
                    </form>
                )}

                <button
                    onClick={() => { setIsLogin(!isLogin); setError(''); setErrores({}) }}
                    className="login-btn-switch"
                >
                    {isLogin
                        ? '¿No tienes cuenta? Regístrate aquí'
                        : '¿Ya tienes cuenta? Inicia sesión'}
                </button>
            </div>
        </div>
    )
}