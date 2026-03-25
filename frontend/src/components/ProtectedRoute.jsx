import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
    const { usuario } = useAuth()
    if (!usuario) return <Navigate to="/login" />
    if (roles && !roles.includes(usuario.rol)) return <Navigate to="/" />
    return children
}