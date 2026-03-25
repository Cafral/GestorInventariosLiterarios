import { useState, useEffect } from 'react'
import { obrasApi } from '../api/apiClient'

const FORM_INIT = {
    titulo: '', genero: '', isbn13: '', plataforma: 'Físico',
    precioAdquisicion: '', carreraId: 1, autorId: 1,
    editorial: '', anio: new Date().getFullYear()
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
        ['autorId', 'ID Autor', 'number']
    ]

    return (
        <div>
            <h2>⚙️ Gestión de Obras</h2>

            <form onSubmit={handleCrear}
                style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem',
                    maxWidth: 680, marginBottom: '2rem'
                }}>
                {CAMPOS.map(([name, label, type]) => (
                    <div key={name}>
                        <label style={css.label}>{label}</label>
                        <input name={name} type={type} required style={css.input}
                            value={form[name]} onChange={handleChange} />
                    </div>
                ))}
                <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button style={css.btn} type="submit">+ Crear</button>
                    {msg && <span style={{
                        color: msg.startsWith('ERROR') ? '#dc2626' : '#16a34a',
                        fontSize: '0.85rem'
                    }}>{msg}</span>}
                </div>
            </form>

            <h3>Obras registradas</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                    <tr style={{ background: '#f8fafc' }}>
                        {['ID', 'Título', 'ISBN', 'PVP', 'Stock', 'Estado', 'Acciones'].map(h =>
                            <th key={h} style={css.th}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {obras.map(o => (
                        <tr key={o.id}>
                            <td style={css.td}>{o.id}</td>
                            <td style={css.td}>{o.titulo}</td>
                            <td style={css.td}>{o.isbn13}</td>
                            <td style={css.td}>${Number(o.pvp).toFixed(2)}</td>
                            <td style={css.td}>{o.stock_actual}</td>
                            <td style={css.td}>{o.estado_actual ?? '—'}</td>
                            <td style={{ ...css.td, display: 'flex', gap: 6 }}>
                                <select style={{ ...css.input, padding: '3px 6px', marginBottom: 0 }}
                                    onChange={e => handleEstado(o.id, e.target.value)}
                                    defaultValue="">
                                    <option value="" disabled>Estado</option>
                                    {['BORRADOR', 'ENTREGADO', 'PUBLICADO', 'VENDIDO'].map(s =>
                                        <option key={s}>{s}</option>)}
                                </select>
                                <button style={css.btnR} onClick={() => handleEliminar(o.id)}>✕</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const css = {
    label: { display: 'block', fontSize: '0.8rem', color: '#374151', marginBottom: 3 },
    input: {
        width: '100%', padding: '7px 10px', border: '1px solid #d1d5db',
        borderRadius: 7, fontSize: '0.9rem', boxSizing: 'border-box'
    },
    btn: {
        background: '#3b82f6', color: '#fff', border: 'none',
        borderRadius: 7, padding: '8px 20px', cursor: 'pointer'
    },
    btnR: {
        background: '#ef4444', color: '#fff', border: 'none',
        borderRadius: 6, padding: '4px 10px', cursor: 'pointer'
    },
    th: {
        padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid #e2e8f0',
        color: '#475569', fontWeight: 600
    },
    td: { padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }
}