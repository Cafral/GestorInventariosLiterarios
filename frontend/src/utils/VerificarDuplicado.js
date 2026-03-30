const BASE = import.meta.env.VITE_API_URL || '/api'

// Consulta al backend si un valor ya existe en la BD.
// Retorna true si YA EXISTE, false si está disponible.
export async function verificarDuplicado(endpoint, valor) {
    if (!valor || valor.trim().length < 2) return false
    try {
        const url = BASE + endpoint + encodeURIComponent(valor.trim())
        const res = await fetch(url)
        const data = await res.json()
        return data.existe === true
    } catch {
        return false
    }
}