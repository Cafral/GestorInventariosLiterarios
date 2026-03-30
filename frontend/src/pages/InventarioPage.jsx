import { useState, useEffect, useCallback } from 'react'
import { inventarioApi, obrasApi } from '../api/apiClient'
import { useAuth } from '../context/AuthContext'
import '../estilos/InventarioPage.css'

export default function InventarioPage() {
    const { usuario } = useAuth()

    const [obras, setObras] = useState([])
    const [reporte, setReporte] = useState('')
    const [trans, setTrans] = useState([])
    const [msg, setMsg] = useState('')
    const [errLote, setErrLote] = useState({})
    const [errVenta, setErrVenta] = useState({})

    const [lote, setLote] = useState({ obraId: '', cantidad: '', costoNuevo: '' })
    const [venta, setVenta] = useState({ obraId: '', cantidad: '' })

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

    // Validaciones
    const validarLote = () => {
        const e = {}
        if (!lote.obraId) e.obraId = 'Selecciona una obra'
        if (!lote.cantidad) e.cantidad = 'La cantidad es obligatoria'
        else if (!/^\d+$/.test(lote.cantidad)) e.cantidad = 'La cantidad solo puede contener números enteros'
        else if (parseInt(lote.cantidad) <= 0) e.cantidad = 'La cantidad debe ser mínimo 1'
        if (!lote.costoNuevo) e.costoNuevo = 'El costo es obligatorio'
        else if (!/^\d+(\.\d{1,2})?$/.test(lote.costoNuevo)) e.costoNuevo = 'Solo números válidos (ej: 12 o 12.50)'
        else if (parseFloat(lote.costoNuevo) <= 0) e.costoNuevo = 'El costo debe ser mayor a 0'
        return e
    }

    const validarVenta = () => {
        const e = {}
        if (!venta.obraId) e.obraId = 'Selecciona una obra'
        if (!venta.cantidad || parseInt(venta.cantidad) <= 0) e.cantidad = 'Cantidad inválida (mínimo 1)'
        return e
    }

    // ── Ingresar lote
    const handleLote = async (e) => {
        e.preventDefault()
        setMsg('')
        const ev = validarLote()
        if (Object.keys(ev).length) { setErrLote(ev); return }
        setErrLote({})
        try {
            const r = await inventarioApi.ingresarLote({
                obraId: parseInt(lote.obraId),
                cantidad: parseInt(lote.cantidad),
                costoNuevo: parseFloat(lote.costoNuevo),
                usuarioId: usuario.id
            })
            setMsg(r.resultado)
            setLote({ obraId: '', cantidad: '', costoNuevo: '' })
            cargar()
        } catch (err) { setMsg('ERROR: ' + err.message) }
    }

    // ── Registrar venta 
    const handleVenta = async (e) => {
        e.preventDefault()
        setMsg('')
        const ev = validarVenta()
        if (Object.keys(ev).length) { setErrVenta(ev); return }
        setErrVenta({})
        try {
            const r = await inventarioApi.vender({
                obraId: parseInt(venta.obraId),
                cantidad: parseInt(venta.cantidad),
                usuarioId: usuario.id
            })
            setMsg(r.resultado)
            setVenta({ obraId: '', cantidad: '' })
            cargar()
        } catch (err) { setMsg('ERROR: ' + err.message) }
    }

    const cambiarLote = (e) => { setLote(f => ({ ...f, [e.target.name]: e.target.value })); setErrLote(er => ({ ...er, [e.target.name]: '' })) }
    const cambiarVenta = (e) => { setVenta(f => ({ ...f, [e.target.name]: e.target.value })); setErrVenta(er => ({ ...er, [e.target.name]: '' })) }

    return (
        <div className="inventory-page-container">
            <h2 className="inventory-main-title">Inventario</h2>

            {/* Operador en sesión */}
            <p className="inventory-user-info">
                Operaciones registradas como: <strong>{usuario?.nombre}</strong>
            </p>

            {msg && (
                <p className={`inventory-alert-msg ${msg.startsWith('ERROR') ? 'is-error' : 'is-success'}`}>
                    {msg}
                </p>
            )}

            <div className="inventory-forms-grid">

                {/* Ingresar Lote */}
                <div className="inventory-card-form">
                    <h3 className="inventory-form-title">Ingresar Lote</h3>
                    <form onSubmit={handleLote} className="inventory-form-element" noValidate>

                        <div>
                            <select name="obraId" required
                                className={`inventory-input${errLote.obraId ? ' input-error' : ''}`}
                                value={lote.obraId} onChange={cambiarLote}>
                                <option value="">Selecciona obra</option>
                                {obras.map(o => <option key={o.id} value={o.id}>{o.titulo}</option>)}
                            </select>
                            {errLote.obraId && <span className="field-error">{errLote.obraId}</span>}
                        </div>

                        <div>
                            <input name="cantidad" type="number" min="1" placeholder="Cantidad" required
                                className={`inventory-input${errLote.cantidad ? ' input-error' : ''}`}
                                value={lote.cantidad} onChange={cambiarLote} />
                            {errLote.cantidad && <span className="field-error">{errLote.cantidad}</span>}
                        </div>

                        <div>
                            <input name="costoNuevo" type="number" placeholder="Costo nuevo ($)"
                                step="0.01" min="0.01" required
                                className={`inventory-input${errLote.costoNuevo ? ' input-error' : ''}`}
                                value={lote.costoNuevo} onChange={cambiarLote} />
                            {errLote.costoNuevo && <span className="field-error">{errLote.costoNuevo}</span>}
                        </div>

                        <button className="inventory-btn inventory-btn-lote" type="submit">
                            Ingresar
                        </button>
                    </form>
                </div>

                {/* Registrar Venta */}
                <div className="inventory-card-form">
                    <h3 className="inventory-form-title">Registrar Venta</h3>
                    <form onSubmit={handleVenta} className="inventory-form-element" noValidate>

                        <div>
                            <select name="obraId" required
                                className={`inventory-input${errVenta.obraId ? ' input-error' : ''}`}
                                value={venta.obraId} onChange={cambiarVenta}>
                                <option value="">Selecciona obra</option>
                                {obras.map(o => (
                                    <option key={o.id} value={o.id}>
                                        {o.titulo} (Stock: {o.stock_actual})
                                    </option>
                                ))}
                            </select>
                            {errVenta.obraId && <span className="field-error">{errVenta.obraId}</span>}
                        </div>

                        <div>
                            <input name="cantidad" type="number" min="1" placeholder="Cantidad" required
                                className={`inventory-input${errVenta.cantidad ? ' input-error' : ''}`}
                                value={venta.cantidad} onChange={cambiarVenta} />
                            {errVenta.cantidad && <span className="field-error">{errVenta.cantidad}</span>}
                        </div>

                        <button className="inventory-btn inventory-btn-venta" type="submit">
                            Vender
                        </button>
                    </form>
                </div>
            </div>

            {/* Reporte de stock */}
            <h3 className="inventory-section-subtitle">Reporte de Stock</h3>
            <pre className="inventory-report-block">
                {reporte || 'Sin datos disponibles'}
            </pre>

            {/* Historial de transacciones */}
            <h3 className="inventory-section-subtitle">Transacciones</h3>
            <div className="inventory-table-wrapper">
                <table className="inventory-table">
                    <thead>
                        <tr className="inventory-table-header">
                            {['Tipo', 'Obra ID', 'Cant.', 'Costo', 'PVP', 'Usuario', 'Fecha'].map(h =>
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
                                <td className="inventory-td">{t.usuario_id}</td>
                                <td className="inventory-td inventory-date">{String(t.fecha).substring(0, 10)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}