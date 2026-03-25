import { useState, useEffect, useCallback } from 'react'
import { obrasApi } from '../api/apiClient'
import ObraCard from '../components/ObraCard'
import '../estilos/DashboardPage.css'; // Importación final para unificar el diseño

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
        <div className="dashboard-wrapper">
            {/* Título principal con clase CSS */}
            <h2 className="dashboard-main-title">Mejores Obras</h2>

            {/* Contenedor de filtros de carrera */}
            <div className="dashboard-filters-container">
                {CARRERAS.map(c => (
                    <button
                        key={c.nombre}
                        onClick={() => setCarrera(c.id)}
                        className={`dashboard-filter-btn ${carrera === c.id ? 'is-active' : 'is-inactive'}`}
                    >
                        {c.nombre}
                    </button>
                ))}
            </div>

            {/* Estados de carga, error o vacío con clases específicas */}
            {cargando && <p className="dashboard-state-msg is-loading">Cargando las obras del ITQ...</p>}

            {error && <p className="dashboard-state-msg is-error">Ocurrió un error: {error}</p>}

            {!cargando && !error && obras.length === 0 && (
                <p className="dashboard-state-msg is-empty">No hay obras registradas en esta categoría aún.</p>
            )}

            {/* Grid principal de visualización */}
            <div className="dashboard-grid-layout">
                {obras.map(o => (
                    <ObraCard key={o.id} obra={o} onActualizar={cargar} />
                ))}
            </div>
        </div>
    )
}