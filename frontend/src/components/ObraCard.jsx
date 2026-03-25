import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { obrasApi } from '../api/apiClient'
import { useState } from 'react'

export default function ObraCard({ obra, onActualizar }) {
    const [votado, setVotado] = useState(false)

    const handleVotar = async (pts) => {
        try {
            await obrasApi.valorar(obra.id, pts)
            setVotado(true)
            onActualizar?.()
        } catch (e) { alert(e.message) }
    }

    const estrellas = Math.round(obra.rating_promedio ?? 0)

    return (
        <div style={css.card}>
            {obra.imagen_url
                ? <img src={obra.imagen_url} alt={obra.titulo} style={css.img} />
                : <div style={css.sinImg}>Sin imagen</div>
            }

            <p style={css.titulo}>{obra.titulo}</p>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={css.badge}>{obra.genero}</span>
                {obra.stock_actual === 0 &&
                    <span style={{ ...css.badge, background: '#fef2f2', color: '#dc2626' }}>
                        Sin stock
                    </span>}
            </div>

            <p style={css.precio}>
                PVP: <strong>${Number(obra.pvp).toFixed(2)}</strong>
            </p>

            <div style={{ display: 'flex', gap: 2 }}>
                {'★★★★★'.split('').map((_, i) => (
                    <span key={i} style={{ color: i < estrellas ? '#f59e0b' : '#d1d5db', fontSize: '1.1rem' }}>
                        ★
                    </span>
                ))}
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: 4, alignSelf: 'center' }}>
                    ({obra.total_votos ?? 0})
                </span>
            </div>

            <div style={{ textAlign: 'center', margin: '8px 0' }}>
                <QRCodeSVG value={`${window.location.origin}/obras/${obra.id}`} size={88} />
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '4px 0 0' }}>
                    Escanea para ver / comprar
                </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/obras/${obra.id}`} style={css.btnVer}>Ver más</Link>
                {!votado && (
                    <button style={css.btnVotar} onClick={() => handleVotar(5)}>⭐ Valorar</button>
                )}
            </div>
        </div>
    )
}

const css = {
    card: {
        border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem',
        background: '#fff', display: 'flex', flexDirection: 'column',
        gap: '0.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)'
    },
    img: { width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 },
    sinImg: {
        height: 140, background: '#f1f5f9', borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#94a3b8', fontSize: '0.8rem'
    },
    titulo: { fontWeight: 600, fontSize: '0.95rem', margin: 0 },
    badge: {
        background: '#eff6ff', color: '#1d4ed8', borderRadius: 9999,
        padding: '2px 10px', fontSize: '0.75rem'
    },
    precio: { fontSize: '0.85rem', color: '#475569', margin: 0 },
    btnVer: {
        background: '#6366f1', color: '#fff', borderRadius: 6, padding: '5px 12px',
        textDecoration: 'none', fontSize: '0.8rem', textAlign: 'center'
    },
    btnVotar: {
        background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6,
        padding: '5px 12px', cursor: 'pointer', fontSize: '0.8rem'
    }
}