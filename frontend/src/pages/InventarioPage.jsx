import { useState, useEffect, useCallback } from 'react'
import { inventarioApi, obrasApi } from '../api/apiClient'
import '../estilos/InventarioPage.css'; // Vinculamos los estilos externos

export default function InventarioPage() {
    const [obras, setObras] = useState([])
    const [reporte, setReporte] = useState('')
    const [trans, setTrans] = useState([])
    const [msg, setMsg] = useState('')
    const [lote, setLote] = useState({ obraId: '', cantidad: '', costoNuevo: '', usuarioId: '' })
    const [venta, setVenta] = useState({ obraId: '', cantidad: '', usuarioId: '' })

    const cargar = useCallback(async () => {
        const [listaObras, rep, listaT] = await Promise.all([
            obrasApi.listar(),
            inventarioApi.reporte(),
            inventarioApi.transacciones()
        ])
        setObras(Array.isArray(listaObras) ? listaObras : [])
        setReporte(rep.reporte ?? '')
        setTrans(Array.isArray(listaT) ? listaT : [])
    }, [])

    useEffect(() => { cargar() }, [cargar])

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
        <div className="inventory-page-container">
            <h2 className="inventory-main-title">Inventario</h2>

            {/* Mensajes de feedback dinámicos */}
            {msg && (
                <p className={`inventory-alert-msg ${msg.startsWith('ERROR') ? 'is-error' : 'is-success'}`}>
                    {msg}
                </p>
            )}

            <div className="inventory-forms-grid">

                {/* Sección para Ingresar Lote */}
                <div className="inventory-card-form">
                    <h3 className="inventory-form-title">Ingresar Lote</h3>
                    <form onSubmit={handleLote} className="inventory-form-element">
                        <select className="inventory-input" required value={lote.obraId}
                            onChange={e => setLote(f => ({ ...f, obraId: e.target.value }))}>
                            <option value="">Selecciona obra</option>
                            {obras.map(o => <option key={o.id} value={o.id}>{o.titulo}</option>)}
                        </select>
                        <input className="inventory-input" type="number" placeholder="Cantidad" required
                            value={lote.cantidad}
                            onChange={e => setLote(f => ({ ...f, cantidad: e.target.value }))} />
                        <input className="inventory-input" type="number" placeholder="Costo nuevo ($)" step="0.01" required
                            value={lote.costoNuevo}
                            onChange={e => setLote(f => ({ ...f, costoNuevo: e.target.value }))} />
                        <input className="inventory-input" type="number" placeholder="ID Usuario" required
                            value={lote.usuarioId}
                            onChange={e => setLote(f => ({ ...f, usuarioId: e.target.value }))} />
                        <button className="inventory-btn inventory-btn-lote" type="submit">
                            Ingresar
                        </button>
                    </form>
                </div>

                {/* Sección para Registrar Venta */}
                <div className="inventory-card-form">
                    <h3 className="inventory-form-title">Registrar Venta</h3>
                    <form onSubmit={handleVenta} className="inventory-form-element">
                        <select className="inventory-input" required value={venta.obraId}
                            onChange={e => setVenta(f => ({ ...f, obraId: e.target.value }))}>
                            <option value="">Selecciona obra</option>
                            {obras.map(o =>
                                <option key={o.id} value={o.id}>
                                    {o.titulo} (Stock: {o.stock_actual})
                                </option>)}
                        </select>
                        <input className="inventory-input" type="number" placeholder="Cantidad" required
                            value={venta.cantidad}
                            onChange={e => setVenta(f => ({ ...f, cantidad: e.target.value }))} />
                        <input className="inventory-input" type="number" placeholder="ID Usuario" required
                            value={venta.usuarioId}
                            onChange={e => setVenta(f => ({ ...f, usuarioId: e.target.value }))} />
                        <button className="inventory-btn inventory-btn-venta" type="submit">
                            Vender
                        </button>
                    </form>
                </div>
            </div>

            {/* Reporte de stock en formato técnico */}
            <h3 className="inventory-section-subtitle">📊 Reporte de Stock</h3>
            <pre className="inventory-report-block">
                {reporte || 'Sin datos de inventario disponibles'}
            </pre>

            {/* Tabla histórica de transacciones */}
            <h3 className="inventory-section-subtitle">🔄 Transacciones</h3>
            <div className="inventory-table-wrapper">
                <table className="inventory-table">
                    <thead>
                        <tr className="inventory-table-header">
                            {['Tipo', 'Obra ID', 'Cant.', 'Costo', 'PVP', 'Fecha'].map(h =>
                                <th key={h} className="inventory-th">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {trans.map((t, i) => (
                            <tr key={i} className="inventory-tr">
                                <td className={`inventory-td-type ${t.tipo === 'COMPRA' ? 'type-compra' : 'type-venta'}`}>
                                    {t.tipo}
                                </td>
                                <td className="inventory-td">{t.obra_id}</td>
                                <td className="inventory-td">{t.cantidad}</td>
                                <td className="inventory-td">${Number(t.costo_unitario).toFixed(2)}</td>
                                <td className="inventory-td inventory-text-red">${Number(t.pvp_calculado).toFixed(2)}</td>
                                <td className="inventory-td inventory-date">
                                    {String(t.fecha).substring(0, 10)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}