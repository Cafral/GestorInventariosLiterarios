import { useState, useEffect, useCallback } from 'react'
import { obrasApi } from '../api/apiClient'
import ObraCard from '../components/ObraCard'

const CARRERAS = [
    { id: null, nombre: 'Todas' },
    { id: 1, nombre: 'Desarrollo de Software' },
]

export default function DashboardPage() {
    const [obras, setObras] = useState([])
    const [carrera, setCarrera] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    const cargar = useCallback(async () => {
        setCargando(true)
        setError('')
        try {
            const data = carrera
                ? await obrasApi.listarCarrera(carrera)
                : await obrasApi.listar()
            setObras(Array.isArray(data) ? data : [])
        } catch (e) {
            setError(e.message)
            setObras([])
        } finally {
            setCargando(false)
        }
    }, [carrera])

    useEffect(() => {
        cargar()
    }, [cargar])

    return (
        <div>
            <h2 style={{ marginBottom: '1rem' }}>📖 Mejores Obras</h2>

            <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {CARRERAS.map(c => (
                    <button key={c.nombre} onClick={() => setCarrera(c.id)}
                        style={{
                            padding: '6px 18px', borderRadius: 9999, cursor: 'pointer',
                            border: '1px solid #3b82f6', fontSize: '0.85rem',
                            background: carrera === c.id ? '#3b82f6' : '#fff',
                            color: carrera === c.id ? '#fff' : '#3b82f6'
                        }}>
                        {c.nombre}
                    </button>
                ))}
            </div>

            {cargando && <p style={{ color: '#94a3b8' }}>Cargando obras...</p>}
            {error && <p style={{ color: '#dc2626' }}>Error: {error}</p>}

            {!cargando && !error && obras.length === 0 && (
                <p style={{ color: '#94a3b8' }}>No hay obras registradas aún.</p>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                gap: '1rem'
            }}>
                {obras.map(o => (
                    <ObraCard key={o.id} obra={o} onActualizar={cargar} />
                ))}
            </div>
        </div>
    )
}