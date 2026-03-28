import { useState, useEffect, useCallback } from 'react'
import { obrasApi, carrerasApi } from '../api/apiClient'
import ObraCard from '../components/ObraCard'
import '../estilos/DashboardPage.css'

export default function DashboardPage() {
    const [obras, setObras] = useState([])
    const [carreras, setCarreras] = useState([])
    const [carrera, setCarrera] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    // Carga las 17 carreras desde la BD
    useEffect(() => {
        carrerasApi.listar().then(setCarreras).catch(() => { })
    }, [])

    // Carga obras cada vez que cambia el filtro de carrera
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
            <h2 className="dashboard-main-title">Mejores Obras</h2>

            <div className="dashboard-filters-container">
                <button
                    onClick={() => setCarrera(null)}
                    className={`dashboard-filter-btn ${carrera === null ? 'is-active' : 'is-inactive'}`}
                >
                    Todas
                </button>

                {carreras.map(c => (
                    <button
                        key={c.id}
                        onClick={() => setCarrera(c.id)}
                        className={`dashboard-filter-btn ${carrera === c.id ? 'is-active' : 'is-inactive'}`}
                    >
                        {c.nombre}
                    </button>
                ))}
            </div>

            {cargando && <p className="dashboard-state-msg is-loading">Cargando las obras del ITQ...</p>}
            {error && <p className="dashboard-state-msg is-error">Ocurrió un error: {error}</p>}
            {!cargando && !error && obras.length === 0 && (
                <p className="dashboard-state-msg is-empty">No hay obras registradas en esta categoría aún.</p>
            )}

            <div className="dashboard-grid-layout">
                {obras.map(o => (
                    <ObraCard key={o.id} obra={o} onActualizar={cargar} />
                ))}
            </div>
        </div>
    )
}