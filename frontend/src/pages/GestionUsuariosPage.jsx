import { useState, useEffect } from 'react'
import { usuariosApi, carrerasApi } from '../api/apiClient'
import '../estilos/GestionUsuariosPage.css'

const FORM_INIT = {
    nombre: '', email: '', password: '', confirmar: '',
    rol: 'ESTUDIANTE', carrera_id: ''
}

const ROLES = [
    { value: 'ESTUDIANTE', label: 'Estudiante' },
    { value: 'GESTOR_INVENTARIO', label: 'Gestor de Inventario' },
    { value: 'ADMIN_ACADEMICO', label: 'Administrador Académico' },
    { value: 'ADMIN_TI', label: 'Administrador TI' },
]

export default function GestionUsuariosPage() {
    const [usuarios, setUsuarios] = useState([])
    const [carreras, setCarreras] = useState([])
    const [form, setForm] = useState(FORM_INIT)
    const [msg, setMsg] = useState('')
    const [errores, setErrores] = useState({})

    const cargar = () => {
        usuariosApi.listar().then(setUsuarios).catch(() => { })
        carrerasApi.listar().then(setCarreras).catch(() => { })
    }
    useEffect(() => { cargar() }, [])

    // ── Validaciones ──────────────────────────────────────────
    const validar = () => {
        const e = {}
        if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
        if (!form.email.includes('@')) e.email = 'Email inválido'
        if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
        if (form.password !== form.confirmar) e.confirmar = 'Las contraseñas no coinciden'
        if (!form.rol) e.rol = 'Selecciona un rol'
        if (!form.carrera_id) e.carrera_id = 'Selecciona una carrera'
        return e
    }

    const handleCrear = async (e) => {
        e.preventDefault()
        setMsg('')
        const ev = validar()
        if (Object.keys(ev).length) { setErrores(ev); return }
        setErrores({})
        try {
            const res = await usuariosApi.crearPorAdmin({
                nombre: form.nombre.trim(),
                email: form.email.trim(),
                password: form.password,
                rol: form.rol,
                carrera_id: parseInt(form.carrera_id)
            })
            if (String(res.resultado).startsWith('ERROR')) {
                setMsg('ERROR: ' + res.resultado)
            } else {
                setMsg('✓ Usuario creado (ID: ' + res.resultado + ')')
                setForm(FORM_INIT)
                cargar()
            }
        } catch (err) {
            setMsg('ERROR: ' + err.message)
        }
    }

    const cambiar = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }))
        setErrores(er => ({ ...er, [e.target.name]: '' }))
    }

    return (
        <div className="admin-container">
            <h2 className="admin-main-title">Gestión de Usuarios</h2>
            <p className="admin-info-text">
                Como <strong>Administrador TI</strong> puedes crear usuarios con cualquier rol del sistema.
            </p>

            <h3 className="admin-subtitle">Crear Nuevo Usuario</h3>
            <form onSubmit={handleCrear} className="admin-form-grid" noValidate>

                <div className="admin-form-group">
                    <label className="admin-label">Nombre Completo *</label>
                    <input name="nombre" type="text"
                        className={`admin-input${errores.nombre ? ' input-error' : ''}`}
                        value={form.nombre} onChange={cambiar} />
                    {errores.nombre && <span className="field-error">{errores.nombre}</span>}
                </div>

                <div className="admin-form-group">
                    <label className="admin-label">Email *</label>
                    <input name="email" type="email"
                        className={`admin-input${errores.email ? ' input-error' : ''}`}
                        value={form.email} onChange={cambiar} />
                    {errores.email && <span className="field-error">{errores.email}</span>}
                </div>

                <div className="admin-form-group">
                    <label className="admin-label">Contraseña * (mínimo 6 caracteres)</label>
                    <input name="password" type="password"
                        className={`admin-input${errores.password ? ' input-error' : ''}`}
                        value={form.password} onChange={cambiar} />
                    {errores.password && <span className="field-error">{errores.password}</span>}
                </div>

                <div className="admin-form-group">
                    <label className="admin-label">Confirmar Contraseña *</label>
                    <input name="confirmar" type="password"
                        className={`admin-input${errores.confirmar ? ' input-error' : ''}`}
                        value={form.confirmar} onChange={cambiar} />
                    {errores.confirmar && <span className="field-error">{errores.confirmar}</span>}
                </div>

                <div className="admin-form-group">
                    <label className="admin-label">Rol *</label>
                    <select name="rol"
                        className={`admin-input${errores.rol ? ' input-error' : ''}`}
                        value={form.rol} onChange={cambiar}>
                        {ROLES.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </select>
                    {errores.rol && <span className="field-error">{errores.rol}</span>}
                </div>

                <div className="admin-form-group">
                    <label className="admin-label">Carrera *</label>
                    <select name="carrera_id"
                        className={`admin-input${errores.carrera_id ? ' input-error' : ''}`}
                        value={form.carrera_id} onChange={cambiar}>
                        <option value="">Selecciona una carrera</option>
                        {carreras.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                    {errores.carrera_id && <span className="field-error">{errores.carrera_id}</span>}
                </div>

                <div className="admin-form-actions">
                    <button className="admin-btn-submit" type="submit">+ Crear Usuario</button>
                    {msg && (
                        <span className={msg.startsWith('ERROR') ? 'admin-msg-error' : 'admin-msg-success'}>
                            {msg}
                        </span>
                    )}
                </div>
            </form>

            {/* Tabla usuarios */}
            <h3 className="admin-subtitle">Usuarios del sistema ({usuarios.length})</h3>
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr className="admin-table-header-row">
                            {['ID', 'Nombre', 'Email', 'Rol', 'Carrera ID'].map(h =>
                                <th key={h} className="admin-th">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(u => (
                            <tr key={u.id} className="admin-table-row">
                                <td className="admin-td">{u.id}</td>
                                <td className="admin-td admin-td-bold">{u.nombre}</td>
                                <td className="admin-td">{u.email}</td>
                                <td className="admin-td">
                                    <span className="admin-status-badge">{u.rol}</span>
                                </td>
                                <td className="admin-td">{u.carrera_id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}