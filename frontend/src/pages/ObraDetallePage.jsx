import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { obrasApi } from '../api/apiClient'
import { QRCodeSVG } from 'qrcode.react'
import '../estilos/ObraDetallePage.css'; // Importación fundamental para aplicar el diseño

export default function ObraDetallePage() {
    const { id } = useParams()
    const [obra, setObra] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        obrasApi.buscar(id)
            .then(setObra)
            .catch(e => setError(e.message))
    }, [id])

    // Pantalla de error con clase específica
    if (error) return <p className="detail-error-msg">{error}</p>

    // Pantalla de carga con clase específica
    if (!obra) return <p className="detail-loading-msg">Cargando detalles de la obra...</p>

    const estrellas = Math.round(obra.rating_promedio ?? 0)

    return (
        <div className="detail-page-container">
            {/* Link de retorno con estilo de flecha */}
            <Link to="/" className="detail-back-link">← Volver al Repositorio</Link>

            <h2 className="detail-main-title">{obra.titulo}</h2>

            {/* Sistema de calificación visual */}
            <div className="detail-stars-wrapper">
                {'★★★★★'.split('').map((_, i) => (
                    <span key={i} className={`detail-star-icon ${i < estrellas ? 'is-active' : 'is-inactive'}`}>
                        ★
                    </span>
                ))}
                <span className="detail-votes-count">
                    ({obra.total_votos} votos registrados)
                </span>
            </div>

            {/* Tabla de especificaciones técnicas */}
            <table className="detail-info-table">
                <tbody>
                    {[
                        ['Género', obra.genero],
                        ['ISBN-13', obra.isbn13],
                        ['Plataforma', obra.plataforma],
                        ['Editorial', obra.editorial],
                        ['Año', obra.anio],
                        ['Costo adq.', `$${Number(obra.precio_adquisicion).toFixed(2)}`],
                        ['PVP', `$${Number(obra.pvp).toFixed(2)}`],
                        ['Stock actual', obra.stock_actual],
                    ].map(([k, v]) => (
                        <tr key={k} className="detail-table-row">
                            <td className="detail-table-label">{k}</td>
                            <td className="detail-table-value">{v}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Sección de historial con estilo de lista técnica */}
            <h3 className="detail-section-subtitle">Historial de estados</h3>
            <ul className="detail-history-list">
                {obra.historialEstados?.map((e, i) => (
                    <li key={i} className="detail-history-item">
                        <strong className="detail-history-status">{e.estado}</strong>
                        <span className="detail-history-date">
                            {' '}— {String(e.fecha_cambio).substring(0, 10)}
                        </span>
                        {e.notas && <span className="detail-history-notes"> ({e.notas})</span>}
                    </li>
                ))}
            </ul>

            {/* Sección del código QR para acceso rápido */}
            <div className="detail-qr-section">
                <h3 className="detail-section-subtitle">Código QR de acceso</h3>
                <div className="detail-qr-container">
                    <QRCodeSVG
                        value={`${window.location.origin}/obras/${id}`}
                        size={150}
                        fgColor="#000000"
                    />
                </div>
                <p className="detail-qr-footer-text">
                    Escanea para ver el detalle o comprar directamente desde el móvil.
                </p>
            </div>
        </div>
    )
}