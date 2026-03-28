import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { obrasApi } from '../api/apiClient'
import { useState } from 'react'
import '../estilos/ObraCard.css';

export default function ObraCard({ obra, onActualizar }) {
    const [votado, setVotado] = useState(false)
    const [hover, setHover] = useState(0)
    const [rating, setRating] = useState(0)

    const handleVotar = async (pts) => {
        if (votado) return
        try {
            await obrasApi.valorar(obra.id, pts)
            setVotado(true)
            setRating(pts)
            onActualizar?.()
        } catch (e) { alert(e.message) }
    }

    const estrellas = hover || rating || Math.round(obra.rating_promedio ?? 0)

    return (
        <div className="obra-card-container">
            {/* Contenedor de imagen: Si hay imagen se muestra, si no, se muestra el cuadro negro */}
            {obra.imagen_url
                ? <img src={obra.imagen_url} alt={obra.titulo} className="obra-card-image" />
                : <div className="obra-card-no-image">Sin imagen</div>
            }

            <p className="obra-card-title">{obra.titulo}</p>

            <div className="obra-card-tags-wrapper">
                <span className="obra-card-badge-general">{obra.genero}</span>
                {obra.stock_actual === 0 &&
                    <span className="obra-card-badge-no-stock">
                        Sin stock
                    </span>}
            </div>

            <p className="obra-card-price">
                PVP: <strong>${Number(obra.pvp).toFixed(2)}</strong>
            </p>

            <div className="obra-card-rating-section">
                <div className={`obra-stars-group ${votado ? 'is-voted' : 'is-clickable'}`}>
                    {[1, 2, 3, 4, 5].map(n => (
                        <span
                            key={n}
                            className={`obra-individual-star ${n <= estrellas ? 'star-active' : 'star-inactive'}`}
                            onMouseEnter={() => !votado && setHover(n)}
                            onMouseLeave={() => !votado && setHover(0)}
                            onClick={() => handleVotar(n)}
                        >
                            ★
                        </span>
                    ))}
                    <span className="obra-card-total-votes">
                        ({obra.total_votos ?? 0})
                    </span>
                </div>
                {votado ? (
                    <p className="obra-card-feedback-thanks">¡Gracias por tu valoración!</p>
                ) : (
                    <p className="obra-card-feedback-prompt">Haz clic para calificar</p>
                )}
            </div>

            <div className="obra-card-qr-section">
                <QRCodeSVG
                    value={`${window.location.origin}/obras/${obra.id}`}
                    size={88}
                    fgColor="#000000"
                />
                <p className="obra-card-qr-text">Escanea para ver</p>
            </div>

            <div className="obra-card-buttons-group">
                <Link to={`/obras/${obra.id}`} className="obra-card-btn-view">Ver más</Link>
            </div>
        </div>
    )
}