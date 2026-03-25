import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { obrasApi } from '../api/apiClient'
import { QRCodeSVG } from 'qrcode.react'

export default function ObraDetallePage() {
    const { id } = useParams()
    const [obra, setObra] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        obrasApi.buscar(id)
            .then(setObra)
            .catch(e => setError(e.message))
    }, [id])

    if (error) return <p style={{ color: '#dc2626' }}>{error}</p>
    if (!obra) return <p style={{ color: '#94a3b8' }}>Cargando...</p>

    const estrellas = Math.round(obra.rating_promedio ?? 0)

    return (
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
            <Link to="/" style={{ color: '#3b82f6', fontSize: '0.85rem' }}>← Volver</Link>

            <h2 style={{ margin: '0.75rem 0 0.25rem' }}>{obra.titulo}</h2>

            <div style={{ display: 'flex', gap: 2, marginBottom: '1rem' }}>
                {'★★★★★'.split('').map((_, i) => (
                    <span key={i} style={{ color: i < estrellas ? '#f59e0b' : '#d1d5db', fontSize: '1.2rem' }}>
                        ★
                    </span>
                ))}
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', alignSelf: 'center', marginLeft: 6 }}>
                    ({obra.total_votos} votos)
                </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {[
                    ['Género', obra.genero],
                    ['ISBN-13', obra.isbn13],
                    ['Plataforma', obra.plataforma],
                    ['Editorial', obra.editorial],
                    ['Año', obra.anio],
                    ['Costo adq.', `$${Number(obra.precio_adquisicion).toFixed(2)}`],
                    ['PVP', `$${Number(obra.pvp).toFixed(2)}`],
                    ['Stock', obra.stock_actual],
                ].map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px 8px', color: '#64748b', width: '40%' }}>{k}</td>
                        <td style={{ padding: '6px 8px', fontWeight: 500 }}>{v}</td>
                    </tr>
                ))}
            </table>

            <h3 style={{ marginBottom: '0.5rem' }}>Historial de estados</h3>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                {obra.historialEstados?.map((e, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                        <strong>{e.estado}</strong>
                        <span style={{ color: '#64748b' }}>
                            {' '}— {String(e.fecha_cambio).substring(0, 10)}
                        </span>
                        {e.notas && <span style={{ color: '#94a3b8' }}> ({e.notas})</span>}
                    </li>
                ))}
            </ul>

            <h3 style={{ marginBottom: '0.5rem' }}>Código QR</h3>
            <QRCodeSVG value={`${window.location.origin}/obras/${id}`} size={150} />
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 6 }}>
                Apunta a esta página de detalle / compra
            </p>
        </div>
    )
}