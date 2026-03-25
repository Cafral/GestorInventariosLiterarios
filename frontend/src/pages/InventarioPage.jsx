import { useState, useEffect } from 'react'
import { inventarioApi, obrasApi } from '../api/apiClient'

export default function InventarioPage() {
    const [obras, setObras] = useState([])
    const [reporte, setReporte] = useState('')
    const [trans, setTrans] = useState([])
    const [msg, setMsg] = useState('')
    const [lote, setLote] = useState({ obraId: '', cantidad: '', costoNuevo: '', usuarioId: '' })
    const [venta, setVenta] = useState({ obraId: '', cantidad: '', usuarioId: '' })

    const cargar = async () => {
        obrasApi.listar().then(setObras)
        inventarioApi.reporte().then(r => setReporte(r.reporte ?? ''))
        inventarioApi.transacciones().then(setTrans)
    }

    useEffect(() => { cargar() }, [])

    const handleLote = async (e) => {
        e.preventDefault()
        setMsg('')
        try {
            const r = await inventarioApi.ingresarLote({
                obraId: parseInt(lote.obraId),
                cantidad: parseInt(lote.cantidad),
                costoNuevo: parseFloat(lote.costoNuevo),
                usuarioId: parseInt(lote.usuarioId)
            })
            setMsg(r.resultado)
            cargar()
        } catch (e) { setMsg(e.message) }
    }

    const handleVenta = async (e) => {
        e.preventDefault()
        setMsg('')
        try {
            const r = await inventarioApi.vender({
                obraId: parseInt(venta.obraId),
                cantidad: parseInt(venta.cantidad),
                usuarioId: parseInt(venta.usuarioId)
            })
            setMsg(r.resultado)
            cargar()
        } catch (e) { setMsg(e.message) }
    }

    return (
        <div>
            <h2>Inventario</h2>

            {msg && (
                <p style={{
                    padding: '8px 14px', borderRadius: 8, marginBottom: '1rem', fontSize: '0.9rem',
                    background: msg.startsWith('ERROR') ? '#fef2f2' : '#f0fdf4',
                    color: msg.startsWith('ERROR') ? '#dc2626' : '#16a34a'
                }}>
                    {msg}
                </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>

                {/* Ingresar lote */}
                <div>
                    <h3 style={{ marginBottom: '0.75rem' }}>Ingresar Lote</h3>
                    <form onSubmit={handleLote} style={css.form}>
                        <select style={css.input} required value={lote.obraId}
                            onChange={e => setLote(f => ({ ...f, obraId: e.target.value }))}>
                            <option value="">Selecciona obra</option>
                            {obras.map(o => <option key={o.id} value={o.id}>{o.titulo}</option>)}
                        </select>
                        <input style={css.input} type="number" placeholder="Cantidad" required
                            value={lote.cantidad}
                            onChange={e => setLote(f => ({ ...f, cantidad: e.target.value }))} />
                        <input style={css.input} type="number" placeholder="Costo nuevo ($)" step="0.01" required
                            value={lote.costoNuevo}
                            onChange={e => setLote(f => ({ ...f, costoNuevo: e.target.value }))} />
                        <input style={css.input} type="number" placeholder="ID Usuario" required
                            value={lote.usuarioId}
                            onChange={e => setLote(f => ({ ...f, usuarioId: e.target.value }))} />
                        <button style={{ ...css.btn, background: '#10b981' }} type="submit">
                            Ingresar
                        </button>
                    </form>
                </div>

                {/* Registrar venta */}
                <div>
                    <h3 style={{ marginBottom: '0.75rem' }}>Registrar Venta</h3>
                    <form onSubmit={handleVenta} style={css.form}>
                        <select style={css.input} required value={venta.obraId}
                            onChange={e => setVenta(f => ({ ...f, obraId: e.target.value }))}>
                            <option value="">Selecciona obra</option>
                            {obras.map(o =>
                                <option key={o.id} value={o.id}>
                                    {o.titulo} (Stock: {o.stock_actual})
                                </option>)}
                        </select>
                        <input style={css.input} type="number" placeholder="Cantidad" required
                            value={venta.cantidad}
                            onChange={e => setVenta(f => ({ ...f, cantidad: e.target.value }))} />
                        <input style={css.input} type="number" placeholder="ID Usuario" required
                            value={venta.usuarioId}
                            onChange={e => setVenta(f => ({ ...f, usuarioId: e.target.value }))} />
                        <button style={{ ...css.btn, background: '#3b82f6' }} type="submit">
                            Vender
                        </button>
                    </form>
                </div>
            </div>

            {/* Reporte stock */}
            <h3>📊 Reporte de Stock</h3>
            <pre style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
                padding: '1rem', fontSize: '0.8rem', whiteSpace: 'pre-wrap', marginBottom: '2rem'
            }}>
                {reporte || 'Sin datos'}
            </pre>

            {/* Transacciones */}
            <h3>🔄 Transacciones</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                    <tr style={{ background: '#f8fafc' }}>
                        {['Tipo', 'Obra ID', 'Cant.', 'Costo', 'PVP', 'Fecha'].map(h =>
                            <th key={h} style={css.th}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {trans.map((t, i) => (
                        <tr key={i}>
                            <td style={{
                                ...css.td, fontWeight: 600,
                                color: t.tipo === 'COMPRA' ? '#16a34a' : '#3b82f6'
                            }}>{t.tipo}</td>
                            <td style={css.td}>{t.obra_id}</td>
                            <td style={css.td}>{t.cantidad}</td>
                            <td style={css.td}>${Number(t.costo_unitario).toFixed(2)}</td>
                            <td style={css.td}>${Number(t.pvp_calculado).toFixed(2)}</td>
                            <td style={{ ...css.td, color: '#94a3b8' }}>
                                {String(t.fecha).substring(0, 10)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const css = {
    form: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    input: {
        padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 7,
        fontSize: '0.9rem', width: '100%', boxSizing: 'border-box'
    },
    btn: {
        color: '#fff', border: 'none', borderRadius: 7,
        padding: '9px', cursor: 'pointer', fontSize: '0.9rem'
    },
    th: {
        padding: '8px 10px', textAlign: 'left',
        borderBottom: '2px solid #e2e8f0', color: '#475569'
    },
    td: { padding: '7px 10px', borderBottom: '1px solid #f1f5f9' }
}