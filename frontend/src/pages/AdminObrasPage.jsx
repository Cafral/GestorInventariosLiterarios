import { useState, useEffect } from 'react'
import { obrasApi } from '../api/apiClient'
import '../estilos/AdminObrasPage.css';

const FORM_INIT = {
    titulo: '', genero: '', isbn13: '', plataforma: 'Físico',
    precioAdquisicion: '', carreraId: 1, autorId: '',
    editorial: '', anio: new Date().getFullYear(),
    imagen_url: ''
}

export default function AdminObrasPage() {
    const [obras, setObras] = useState([])
    const [form, setForm] = useState(FORM_INIT)
    const [msg, setMsg] = useState('')

    const cargar = () => obrasApi.listar().then(setObras).catch(() => { })
    useEffect(() => { cargar() }, [])

    const handleChange = e =>
        setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleCrear = async (e) => {
        e.preventDefault()
        setMsg('')
        try {
            const res = await obrasApi.crear({
                ...form,
                precioAdquisicion: parseFloat(form.precioAdquisicion),
                carreraId: parseInt(form.carreraId),
                autorId: parseInt(form.autorId),
                anio: parseInt(form.anio)
            })
            setMsg(res.resultado)
            if (!res.resultado.startsWith('ERROR')) { setForm(FORM_INIT); cargar() }
        } catch (e) { setMsg(e.message) }
    }

    const handleEstado = async (id, estado) => {
        try {
            await obrasApi.cambiarEstado(id, { estado, responsable: 'admin', notas: '' })
            cargar()
        } catch (e) { alert(e.message) }
    }

    const handleEliminar = async (id) => {
        if (!confirm('¿Eliminar obra?')) return
        await obrasApi.eliminar(id)
        cargar()
    }

    const CAMPOS = [
        ['titulo', 'Título', 'text'], ['genero', 'Género', 'text'],
        ['isbn13', 'ISBN-13', 'text'], ['plataforma', 'Plataforma', 'text'],
        ['precioAdquisicion', 'Costo adq.', 'number'], ['editorial', 'Editorial', 'text'],
        ['anio', 'Año', 'number'], ['carreraId', 'ID Carrera', 'number'],
        ['autorId', 'ID Autor', 'number'],
        ['imagen_url', 'URL imagen portada', 'text']
    ]

    return (
        <div className="admin-container">
            <h2 className="admin-main-title">Gestión de Obras</h2>

            {/* Formulario de creación con grid layout definido en CSS */}
            <form onSubmit={handleCrear} className="admin-form-grid">
                {CAMPOS.map(([name, label, type]) => (
                    <div key={name} className="admin-form-group">
                        <label className="admin-label">{label}</label>
                        <input 
                            name={name} 
                            type={type} 
                            required 
                            className="admin-input"
                            value={form[name]} 
                            onChange={handleChange} 
                        />
                    </div>
                ))}
                <div className="admin-form-actions">
                    <button className="admin-btn-submit" type="submit">+ Crear Nueva Obra</button>
                    {msg && (
                        <span className={msg.startsWith('ERROR') ? 'admin-msg-error' : 'admin-msg-success'}>
                            {msg}
                        </span>
                    )}
                </div>
            </form>

            <h3 className="admin-subtitle">Obras registradas</h3>
            
            {/* Tabla de datos con estilos profesionales */}
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr className="admin-table-header-row">
                            {['ID', 'Título', 'ISBN', 'PVP', 'Stock', 'Estado', 'Acciones'].map(h =>
                                <th key={h} className="admin-th">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {obras.map(o => (
                            <tr key={o.id} className="admin-table-row">
                                <td className="admin-td">{o.id}</td>
                                <td className="admin-td admin-td-bold">{o.titulo}</td>
                                <td className="admin-td">{o.isbn13}</td>
                                <td className="admin-td admin-text-red">${Number(o.pvp).toFixed(2)}</td>
                                <td className="admin-td">{o.stock_actual}</td>
                                <td className="admin-td">
                                    <span className="admin-status-badge">{o.estado_actual ?? '—'}</span>
                                </td>
                                <td className="admin-td admin-actions-cell">
                                    <select 
                                        className="admin-select-status"
                                        onChange={e => handleEstado(o.id, e.target.value)}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Estado</option>
                                        {['BORRADOR', 'ENTREGADO', 'PUBLICADO', 'VENDIDO'].map(s =>
                                            <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <button className="admin-btn-delete" onClick={() => handleEliminar(o.id)}>
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}